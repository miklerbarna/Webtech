import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { CustomerRentalViewService } from '../customer-rental-view.service'; // Adjust the path as necessary
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

interface Review {
  rating: number;
  text: string;
  station_id: number;
}

const customIcon = L.icon({
  iconUrl: 'assets/icons/map_pins.png',
  iconSize: [40, 40], // Size of the icon. Adjust as needed.
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location.
  popupAnchor: [0, -42] // Point from which the popup should open relative to the iconAnchor.
});

@Component({
  selector: 'app-customer-rental-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-rental-view.component.html',
  styleUrls: ['./customer-rental-view.component.css']
})
export class CustomerRentalViewComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  bikeStations: any[] = [];
  public selectedStation: any = null; // Make sure this is public if you need to access it in your template

  review: Review = { rating: 1, text: '', station_id: 1 }; 

  constructor(private customerRentalViewService: CustomerRentalViewService, private titleService: Title) {}

  ngAfterViewInit(): void {
    this.titleService.setTitle('Rental Map View');
    this.initMap();
    this.loadStations();
    

    // Connect the global function to a method inside this component
    (window as any).triggerStationSelect = this.selectStation.bind(this);
  }

  ngOnDestroy(): void {
    // Clean up the global function to prevent memory leaks
    (window as any).triggerStationSelect = undefined;
  }

  private initMap(): void {
    this.map = new L.Map('map').setView([46.62472, 14.30528], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
  }

  private loadStations(): void {
    this.customerRentalViewService.getBikeStations().subscribe(stations => {
      this.bikeStations = stations;
      stations.forEach(station => {
        const popupContent = `
          <strong style="font-size: 16px;">${station.name}</strong><br>
          Address: ${station.address}, ${station.city}<br>
          Places Taken: ${station.places_taken}/${station.places_all}<br>
          <button style="border-radius: 5px; cursor: pointer; font-size: 12px; margin-top: 3px; padding: 3px; font-weight: 600; border-width: 1px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.17);" onclick="window.triggerStationSelect(${station.station_id})">View Details</button>
        `;
        L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(this.map!)
          .bindPopup(popupContent);
      });
    });
  }

  refreshStations(): Promise<void>{
    return new Promise((resolve, reject) => {
      this.customerRentalViewService.getBikeStations().subscribe(stations => {
        this.bikeStations = stations;
        this.refreshSelectedStation();
        console.log("Refreshed bike stations!");
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
        console.log("Refreshed current Selected station!");
        this.selectedStation = { ...stationToUpdate };
      } else {
        console.log(`Station with ID ${this.selectedStation.station_id} not found.`);
      }
    } else {
      console.log("No station selected or selected station has no ID.");
    }
  }

  private selectStation(stationId: number): void {
    
      const station = this.bikeStations.find(s => s.station_id === stationId);
      if (station) {
        this.selectedStation = station;
      }
  }
  deSelectStation() : void{
    console.log("Deselect station!");
    this.selectedStation = null;
  }

  submitReview(): void {
    // Add logic to submit the review
    if (this.review.rating && this.review.text) {
      this.review.station_id = this.selectedStation.station_id;
      // Here you can send the review data to your backend or perform any necessary action
      console.log('Submitting review:', this.review);
      this.customerRentalViewService.postStationReview(this.review).subscribe(
        response => {
          console.log("Response: ", response);
          this.refreshStations();
        },
        error => {
          console.error('Error updating Station', error);
          console.log("Response: ", error);
          this.refreshStations();
        });
      // Clear the review form after submission
      this.review = { rating: 1, text: '', station_id : 1 };
    } else {
      alert('Please provide both a rating and a review text.');
    }
  }
}
