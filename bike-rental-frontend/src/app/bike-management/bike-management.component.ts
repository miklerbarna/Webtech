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
  categories = [
    { name: 'mountain bike' },
    { name: 'electric bike' },
    { name: 'city bike' },
    { name: 'children bike' },
  ];

  editingModels = false;
  uniqueModels: any[] = []; // Array to store unique models

  constructor(
      private router: Router, 
      private bikeService: BikeManagementService
    ) { } // Inject the BikeService

  ngOnInit(): void {
    this.refreshBikes(); //Init and sort
    this.initializeUniqueModels();
  }

  initializeUniqueModels(): void {
    const allModels = this.bikes.map(bike => ({ category: bike.category, name: bike.model }));
    this.uniqueModels = [...new Map(allModels.map(model => [model.name, model])).values()];
  }

  refreshBikes(): void{
    this.bikes = this.bikeService.getBikes()
      .sort((a, b) => {
        // Sort by category
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;

        // If categories are equal, sort by model
        if (a.model < b.model) return -1;
        if (a.model > b.model) return 1;

        return 0;
      });
  }
  
  selectBike(bike: any): void {
    this.selectedBike = bike;
  }

  editBike(bike: any): void {
    const newStationId = prompt('Enter new Station ID:', bike.stationId.toString());
    const newParkingSpot = prompt('Enter new Parking Spot:', bike.parkingSpot.toString());

    if (newStationId !== null && newParkingSpot !== null) {
      // Update the bike details
      bike.stationId = parseInt(newStationId, 10);
      bike.parkingSpot = parseInt(newParkingSpot, 10);

      // Update the list of bikes
      const index = this.bikes.findIndex(b => b.id === bike.id);
      if (index !== -1) {
        this.bikes[index] = bike;
      }

      // Refresh the selected bike details
      this.selectedBike = {...bike};
    }
    this.refreshBikes();
  }

  deleteBike(bikeId: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this bike?');
    if (confirmDeletion) {
      // Remove the bike from the list
      this.bikes = this.bikes.filter(bike => bike.id !== bikeId);

      // Close the detailed view if the deleted bike was selected
      if (this.selectedBike && this.selectedBike.id === bikeId) {
        this.selectedBike = null;
      }
    }
    this.refreshBikes();
  }

  /* ------------Category funtions------------------*/

  addCategory(): void {
    // Implement adding a new category
  }

  editCategory(category: any): void {
    // Implement editing a category
  }

  deleteCategory(categoryName: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this category?');
    if (confirmDeletion) {
      this.categories = this.categories.filter(cat => cat.name !== categoryName);
    }    
  }

  /* ------------Model funtions------------------*/

  addModel(): void {
    const newCategory = prompt('Enter category for the new model:');
    const newModelName = prompt('Enter name for the new model:');

    if (newCategory && newModelName) {
      this.uniqueModels.push({ category: newCategory, name: newModelName });
    }
  }

  editModel(model: any): void {
    const updatedCategory = prompt('Edit category:', model.category);
    const updatedModelName = prompt('Edit model name:', model.name);

    if (updatedCategory !== null && updatedModelName !== null) {
      const index = this.uniqueModels.findIndex(m => m.name === model.name);
      if (index !== -1) {
        this.uniqueModels[index] = { ...model, category: updatedCategory, name: updatedModelName };
      }
    }
  }

  deleteModel(modelName: string): void {
    const confirmDeletion = confirm('Are you sure you want to delete this model?');
    if (confirmDeletion) {
      this.uniqueModels = this.uniqueModels.filter(model => model.name !== modelName);
    }
  }

  navigateToStations(): void {
    this.router.navigate(['/management']);
  }

}
