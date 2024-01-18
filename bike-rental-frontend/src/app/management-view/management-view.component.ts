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
      this.bikeStationService.getBikeStations().subscribe(stations => {
        this.bikeStations = stations;
      }, error => {
        console.error('Error fetching bike stations:', error);
      });
    }

  calculateTotalCapacity(station: any): number {
    return station.parkingPlaces.reduce((total: number, place: any) => total + place.capacity, 0);
  }
  
  deleteStation(stationId: number): void {
    const confirmDeletion = confirm('Are you sure you want to delete this station?');
    if (confirmDeletion) {
      this.bikeStationService.deleteBikeStation(stationId);
      // Refresh the list or remove the item from the array
      this.bikeStations = this.bikeStations.filter(station => station.station_id !== stationId);
      if (this.selectedStation && this.selectedStation.station_id === stationId) {
        this.selectedStation = null; // Close the details view if the deleted station was selected
      }
    }
  }

  editStation(station: any): void {
    const updatedName = prompt('Enter new name for the station:', station.name);
    const updatedAddress = prompt('Enter new address for the station:', station.address);
    const updatedLatitude = prompt('Enter new latitude for the station:', station.latitude.toString());
    const updatedLongitude = prompt('Enter new longitude for the station:', station.longitude.toString());
    if (updatedName !== null && updatedAddress !== null && updatedLatitude !== null && updatedLongitude !== null) {
      const updatedStation = { 
        ...station, 
        name: updatedName, 
        address: updatedAddress,
        latitude: parseFloat(updatedLatitude), 
        longitude: parseFloat(updatedLongitude) 
      };
      this.bikeStationService.updateBikeStation(updatedStation);
      // Update the list
      const index = this.bikeStations.findIndex(s => s.station_id === station.station_id);
      if (index !== -1) {
        this.bikeStations[index] = updatedStation;
      }
    }
  }
  
  selectStation(station: any): void {
    this.selectedStation = station;
  }

  navigateToBikes(): void {
    this.router.navigate(['/bikes']);
  }
  
}
