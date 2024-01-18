import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-customer-rental-view',
  standalone: true,
  imports: [],
  templateUrl: './customer-rental-view.component.html',
  styleUrl: './customer-rental-view.component.css'
})
export class CustomerRentalViewComponent implements AfterViewInit {
  private map?: L.Map; 
  private stations = [
    { lat: 46.62472, lon: 14.30528, name: 'Central Station', desc: "#4285" },
    { lat: 46.66472, lon: 14.30228, name: 'Viktring Station', desc: "#4285"},
  ];
  mapOptions: L.MapOptions = {
    zoom: 12,
    center: new L.LatLng(46.62472, 14.30528)
  };

  constructor() {
    
  }
  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = new L.Map('map').setView([46.62472, 14.30528], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    this.addStationsToMap();
  }

  private addStationsToMap(): void {
    this.stations.forEach(station => {
      L.marker([station.lat, station.lon]).addTo(this.map!)
        .bindPopup(station.name);
    });
  }
}

