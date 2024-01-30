import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BikeManagementService } from '../bike-management.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bike-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bike-management.component.html',
  styleUrl: './bike-management.component.css'
})
export class BikeManagementComponent implements OnInit {
  bikes: any[] = []; // Bikes as a property
  selectedBike: any = null;
  editingCategories = false;
  categories: any[] = [];
  models: any[] = [];

  editingModels = false;
  //uniqueModels: any[] = []; // Array to store unique models

  constructor(
      private router: Router, 
      private bikeService: BikeManagementService
    ) { } // Inject the BikeService

  ngOnInit(): void {
    this.refreshBikes(); //Init and sort
    this.refreshCategories();
    this.refreshModels();
  }


  refreshBikes(): Promise<void>{
    return new Promise((resolve, reject) => {
      this.bikeService.getBikes().subscribe(bikes => {
        this.bikes = bikes.sort((a, b) => {
          // Sort by category
          if (a.category_name < b.category_name) return -1;
          if (a.category_name > b.category_name) return 1;

          // If categories are equal, sort by model
          if (a.model_name < b.model_name) return -1;
          if (a.model_name > b.model_name) return 1;

          return 0;
        });
        resolve();;
      }, error => {
        console.error('Error fetching bike stations:', error);
        reject(error);
      });
    });
  }

  refreshCategories(): void{
    this.bikeService.getCategories().subscribe(categories => {
      this.categories = categories.sort((a, b) => {
        // Sort by category
        if (a.name < b.name) return -1;
        if (a.name >= b.name) return 1;
        return 0;
      });;
    }, error => {
      console.error('Error fetching bike categories:', error);
    });
      
  }

  refreshModels(): void{
    this.bikeService.getModels().subscribe(models => {
      this.models = models.sort((a, b) => {
        // Sort by category
        if (a.name < b.name) return -1;
        if (a.name >= b.name) return 1;
        return 0;
      });;
      this.assignCategoryNameToModels();
    }, error => {
      console.error('Error fetching bike models:', error);
    });
      
  }

  refreshSelectedBike(selectedBike: any): void{
    if (selectedBike && selectedBike.bike_id) {
      console.log(this.bikes);
      const bikeToUpdate = this.bikes.find(bike => bike.bike_id === selectedBike.bike_id);
      
      if (bikeToUpdate) {
        this.selectedBike = { ...bikeToUpdate };
      } else {
        console.log(`Bike with ID ${selectedBike.bike_id} not found.`);
        // Handle the case where the bike is not found, for example:
        // this.selectedBike = null;
      }
    } else {
      console.log("No bike selected or selected bike has no ID.");
      // Handle the case where there is no selected bike or no ID, for example:
      // this.selectedBike = null;
    }
  }

  assignCategoryNameToModels(): void{
    this.refreshCategories();
    for (let index = 0; index < this.models.length; index++) {
      const model = this.models[index];
      const category = this.categories.find(cat => cat.category_id === model.category_id);
      console.log(category);
      if (category) {
        model.category_name = category.name;
      } else {
        // Handle the case where a category is not found
        model.category_name = 'Unknown'; // or any default value you prefer
      }
    }
  }
  
  selectBike(bike: any): void {
    this.selectedBike = bike;
  }

  addBike(): void {
    let newBike: {[key: string]: any} = {}; //Legyen egy üres szótár

    // Define the properties to be edited
    const propertiesToEdit = ['model_id', 'unique_id'];

    propertiesToEdit.forEach(prop => {
      const newValue = prompt(`Enter ${prop} for the new bike:`);
      if (newValue !== null) {
        newBike[prop] = newValue;
      }
    });

    // Call service to update the model on the backend
    this.bikeService.addBike(newBike).subscribe(
      response => {
        console.log('Bike added successfully', response);
        this.refreshBikes();
      },
      error => {
        console.error('Error adding Bike', error);
        this.refreshBikes();
      }
    );
    
  }

  editBike(selectedBike: any): void {
    let updatedModel: {[key: string]: any} = {}; //Legyen egy üres szótár
    updatedModel["bike_id"] = selectedBike.bike_id;
    // Define the properties to be edited
    const propertiesToEdit = ['status', 'station_id', 'place_number'];

    propertiesToEdit.forEach(prop => {
      const currentValue = selectedBike[prop];
      const newValue = prompt(`Edit ${prop}:`, currentValue);

      if (newValue !== null) {
        updatedModel[prop] = newValue;
      }
    });

    // Check if the model has been updated
    if (JSON.stringify(selectedBike) !== JSON.stringify(updatedModel)) {
      console.log(updatedModel['status']);
      
      // Call service to update the model on the backend
      this.bikeService.editBike(updatedModel).subscribe(
        response => {
          console.log('Bike updated successfully', response);
          this.refreshBikes().then(() => {
            this.refreshSelectedBike(selectedBike);
          });
        },
        error => {
          console.error('Error updating Bike', error);
          this.refreshBikes().then(() => {
            this.refreshSelectedBike(selectedBike);
          });
        }
      );
    }
    
  }

  deleteBike(bikeId: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this bike?');
    
    if (confirmDeletion) {
      console.log("Deleting bike: " + bikeId);
      this.bikeService.deleteBike(bikeId).subscribe(
        response => {
          console.log('Bike deleted successfully', response);
          this.selectedBike = null;
          this.refreshBikes();
        },
        error => {
          console.error('Error deleting bike', error);
          this.selectedBike = null;
          this.refreshBikes();
        }
      );

      
    }
    
  }

  /* ------------Category funtions------------------*/

  addCategory(): void {
    const newCategoryName = prompt('Enter new name for Category:');
    if (newCategoryName) {
      this.bikeService.addCategory(newCategoryName).subscribe(
        response => {
          console.log('Category added successfully', response);
          this.refreshCategories();
        },
        error => {
          console.error('Error in adding new Category', error);
          this.refreshCategories();
        }
      );
    } 
  }

  editCategory(category: any): void {
    const newCategoryName = prompt('Enter new name for Category:', category.name.toString());
    if(newCategoryName){
      this.bikeService.editCategory(category.category_id, newCategoryName).subscribe(
        response => {
          console.log('Category edited successfully', response);
          this.refreshCategories();
          this.refreshModels();
          this.refreshBikes();
        },
        error => {
          console.error('Category editing error: ', error);
          this.refreshCategories();
          this.refreshModels();
          this.refreshBikes();
        }
      );
    }
      
  }

  deleteCategory(categoryID: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this category? ' + categoryID);
    if (confirmDeletion) {
      this.bikeService.deleteCategory(categoryID).subscribe(
        response => {
          console.log('Category deleted successfully', response);
          this.refreshCategories();
        },
        error => {
          console.error('Category deleting bike', error);
          this.refreshCategories();
        }
      );
    }    
  }


  /* ------------Model funtions------------------*/

  addModel(): void {
    let newModel: {[key: string]: any} = {}; //Legyen egy üres szótár

    // Define the properties to be edited
    const propertiesToAdd = ['category_id', 'name', 'description', 'wheel_size', 'manufacturer', 'brakes_type'];

    propertiesToAdd.forEach(prop => {
      const newValue = prompt(`Enter ${prop} for the new Model:`);
      if (newValue !== null) {
        newModel[prop] = newValue;
      }
    });

    // Call service to update the model on the backend
    this.bikeService.addModel(newModel).subscribe(
      response => {
        console.log('Model added successfully', response);
        this.refreshModels();
      },
      error => {
        console.error('Error adding Model', error);
        this.refreshModels();
      }
    );
    
  }

  editModel(model: any): void {
    let updatedModel = { ...model }; // Clone the model object to avoid direct modifications

    // Define the properties to be edited
    const propertiesToEdit = ['name', 'category_id', 'manufacturer', 'wheel_size', 'brakes_type', 'description'];

    propertiesToEdit.forEach(prop => {
      const currentValue = model[prop];
      const newValue = prompt(`Edit ${prop}:`, currentValue);

      if (newValue !== null && newValue !== currentValue) {
        updatedModel[prop] = newValue;
      }
    });

    // Check if the model has been updated
    if (JSON.stringify(model) !== JSON.stringify(updatedModel)) {
      
      // Call service to update the model on the backend
      this.bikeService.editModel(updatedModel).subscribe(
        response => {
          console.log('Model updated successfully', response);
          this.refreshModels();
          this.refreshBikes();
        },
        error => {
          console.error('Error updating model', error);
          this.refreshModels();
          this.refreshBikes();
        }
      );
    }
    
  }

  deleteModel(modelID: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this model?');
    if (confirmDeletion) {
      this.bikeService.deleteModel(modelID).subscribe(
        response => {
          console.log('Model deleted successfully', response);
          this.refreshModels();
        },
        error => {
          console.error('Model deleting bike', error);
          this.refreshModels();
          this.refreshBikes();
        }
      );
    }
  }

  navigateToStations(): void {
    this.router.navigate(['/management']);
  }

}
