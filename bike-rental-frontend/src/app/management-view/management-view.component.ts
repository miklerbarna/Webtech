import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BikeStationService } from '../bike-station.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-management-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './management-view.component.html',
  styleUrls: ['./management-view.component.css']
})
export class ManagementViewComponent implements OnInit {
  bikeStations: any[] = [];
  selectedStation: any = null;
  categories: any[] = [];

  constructor(
    private router: Router,
    private bikeStationService: BikeStationService,
    private titleService: Title   
    ) { }

    ngOnInit(): void {
      this.titleService.setTitle('Management View');
      this.refreshStations();
      this.refreshCategories();
    }
  
    refreshStations(): Promise<void>{
      return new Promise((resolve, reject) => {
        this.bikeStationService.getBikeStations().subscribe(stations => {
          this.bikeStations = stations;
          resolve();
        }, error => {
          console.error('Error fetching bike stations:', error);
          reject(error);
        });
      });
    }

    refreshSelectedStation(): void{
      if (this.selectedStation && this.selectedStation.station_id) {
        const stationToUpdate = this.bikeStations.find(station => station.station_id === this.selectedStation.station_id);
        
        if (stationToUpdate) {
          this.selectedStation = { ...stationToUpdate };
        } else {
          console.log(`Station with ID ${this.selectedStation.station_id} not found.`);
        }
      } else {
        console.log("No station selected or selected station has no ID.");
      }
    }

  calculateTotalCapacity(station: any): number {
    return station.parkingPlaces.reduce((total: number, place: any) => total + place.capacity, 0);
  }
  
  deleteStation(): void {
    const confirmDeletion = confirm('Are you sure you want to delete this station?');
    if (confirmDeletion) {
      this.bikeStationService.deleteBikeStation(this.selectedStation.station_id).subscribe(
        response => {
          console.log('Station deleted successfully', response);
          this.refreshStations();
          this.selectedStation = null;
        },
        error => {
          console.error('Error deleting Station', error);
          this.refreshStations();
          this.selectedStation = null;
        }
      );
      
    }
  }

  editStation(station: any): void {
    let updatedStation: {[key: string]: any} = {}; //Legyen egy üres szótár
    updatedStation["station_id"] = this.selectedStation.station_id;
    // Define the properties to be edited
    const propertiesToEdit = ['name', 'address', 'latitude', 'longitude'];

    propertiesToEdit.forEach(prop => {
      const currentValue = this.selectedStation[prop];
      const newValue = prompt(`Edit ${prop}:`, currentValue);

      if (newValue !== null && newValue !== currentValue) {
        updatedStation[prop] = newValue;
      }
    });

    // Check if the model has been updated
    if (JSON.stringify(this.selectedStation) !== JSON.stringify(updatedStation)) {
      
      // Call service to update the model on the backend
      this.bikeStationService.editBikeStation(updatedStation).subscribe(
        response => {
          console.log('Station updated successfully', response);
          this.refreshStations().then(() => {
            this.refreshSelectedStation();
          });
        },
        error => {
          console.error('Error updating Station', error);
          this.refreshStations().then(() => {
            this.refreshSelectedStation();
          });
        }
      );
    }
  }

  createNewStation() : void{
    this.refreshCategories();
    let newStation: {[key: string]: any} = {}; //Legyen egy üres szótár

    // Define the properties to be edited
    const propertiesToAdd = ['name', 'address', 'city', 'latitude', 'longitude'];

    newStation['places'] = [
      {
          "category": 1,
          "place_num" : 3
      },
      {
          "category": 2,
          "place_num" : 0
      }];

    newStation['places_all'] = 3;

    propertiesToAdd.forEach(prop => {
      const newValue = prompt(`Enter ${prop} for the new Station:`);
      if (newValue !== null) {
        newStation[prop] = newValue;
      }
    });

    newStation['places'] = [];
    let sum_of_places = 0;
    //Ask for number of places for every category:
    this.categories.forEach(category => {
      const newValue = prompt(`Enter number of places for ${category.name} category for the new Station:`);
      if (newValue !== null) {
        // Parse the input to ensure it's treated as a number
        const place_num = parseInt(newValue);
        // Check if the parse was successful and the number is not NaN
        if (!isNaN(place_num) && 1 <= place_num) {
          // Add the new object to the places list
          sum_of_places += place_num;
          newStation['places'].push({
            "category": category.category_id,
            "place_num": place_num
          });
        } else {
          alert("Invalid number entered, skipping this category.");
        }
      }
    });
    newStation['places_all'] = sum_of_places; //Kategoriankent összeadva minden

    // Call service to update the model on the backend
    this.bikeStationService.addBikeStation(newStation).subscribe(
      response => {
        console.log('Bike Station added successfully', response);
        this.refreshStations();
      },
      error => {
        console.error('Error adding Bike Station', error);
        this.refreshStations();
      }
    );
  }
  
  selectStation(station: any): void {
    this.selectedStation = station;
  }

  navigateToBikes(): void {
    this.router.navigate(['/bikes']);
  }

  refreshCategories(): void{
    this.bikeStationService.getCategories().subscribe(categories => {
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
  
}
