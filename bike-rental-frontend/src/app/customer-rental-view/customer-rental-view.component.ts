import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CustomerRentalViewService } from '../customer-rental-view.service'; // Adjust the path as necessary

const customIcon = L.icon({
  iconUrl: 'assets/icons/map_pins.png',
  iconSize: [40, 40], // Size of the icon. Adjust as needed.
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location.
  popupAnchor: [0, -42] // Point from which the popup should open relative to the iconAnchor.
});

@Component({
  selector: 'app-customer-rental-view',
  standalone: true,
  imports: [],
  templateUrl: './customer-rental-view.component.html',
  styleUrls: ['./customer-rental-view.component.css']
})
export class CustomerRentalViewComponent implements AfterViewInit {
  private map?: L.Map;

  constructor(private customerRentalViewService: CustomerRentalViewService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadStations();
  }

  private initMap(): void {
    this.map = new L.Map('map').setView([46.62472, 14.30528], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
  }

  private loadStations(): void {
    this.customerRentalViewService.getBikeStations().subscribe(stations => {
      stations.forEach(station => {
        L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(this.map!)
          .bindPopup(`
            <strong>${station.name}</strong><br>
            Address: ${station.address}, ${station.city}<br>
            Places Taken: ${station.places_taken}/${station.places_all}
          `);
      });
    });
  }
}
