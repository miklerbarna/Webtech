import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { CustomerRentalViewService } from '../customer-rental-view.service'; // Adjust the path as necessary
import { CommonModule } from '@angular/common';

const customIcon = L.icon({
  iconUrl: 'assets/icons/map_pins.png',
  iconSize: [40, 40], // Size of the icon. Adjust as needed.
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location.
  popupAnchor: [0, -42] // Point from which the popup should open relative to the iconAnchor.
});

@Component({
  selector: 'app-customer-rental-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-rental-view.component.html',
  styleUrls: ['./customer-rental-view.component.css']
})
export class CustomerRentalViewComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  bikeStations: any[] = [];
  public selectedStation: any = null; // Make sure this is public if you need to access it in your template

  constructor(private customerRentalViewService: CustomerRentalViewService) {}

  ngAfterViewInit(): void {
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
          <strong>${station.name}</strong><br>
          Address: ${station.address}, ${station.city}<br>
          Places Taken: ${station.places_taken}/${station.places_all}<br>
          <button onclick="window.triggerStationSelect(${station.station_id})">View Details</button>
        `;
        L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(this.map!)
          .bindPopup(popupContent);
      });
    });
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
}
