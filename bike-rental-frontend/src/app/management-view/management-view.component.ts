import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BikeStationService } from '../bike-station.service';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router,
    private bikeStationService: BikeStationService    
    ) { }

    ngOnInit(): void {
      this.refreshStations();
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
        },
        error => {
          console.error('Error deleting Station', error);
          this.refreshStations();
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
    let newStation: {[key: string]: any} = {}; //Legyen egy üres szótár

    // Define the properties to be edited
    const propertiesToAdd = ['name', 'address', 'city', 'latitude', 'longitude', 'places_all'];

    newStation['places'] = [
      {
          "category": "universal"
      },
      {
          "category": "universal"
      }];

    propertiesToAdd.forEach(prop => {
      const newValue = prompt(`Enter ${prop} for the new Station:`);
      if (newValue !== null) {
        newStation[prop] = newValue;
      }
    });

    // Call service to update the model on the backend
    this.bikeStationService.addBikeStation(newStation).subscribe(
      response => {
        console.log('Bike added successfully', response);
      },
      error => {
        console.error('Error adding Bike', error);
      }
    );
  }
  
  selectStation(station: any): void {
    this.selectedStation = station;
  }

  navigateToBikes(): void {
    this.router.navigate(['/bikes']);
  }
  
}
