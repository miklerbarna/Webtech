import { Component, OnInit  } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-customer-rental-view',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './customer-rental-view.component.html',
  styleUrl: './customer-rental-view.component.css'
})
export class CustomerRentalViewComponent implements OnInit {
  map: L.Map;
  mapOptions: L.MapOptions = {
    zoom: 12,
    center: new L.LatLng(46.62472, 14.30528)
  };

  constructor() {
    this.map = new L.Map('map', this.mapOptions);
  }

  ngOnInit(): void {
    // Define your map options and initialize the map here
    if (this.map){
      const stations = [
        { lat: 46.62472, lon: 14.30528, name: 'Central Station' },
        // ... other stations ...
      ];

      this.map = new L.Map('map', {
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
          })
        ],
        zoom: 13,
        center: L.latLng(46.62472, 14.30528) // Centered at Klagenfurt
      });

      stations.forEach(station => {
        L.marker([station.lat, station.lon]).addTo(this.map)
          .bindPopup(station.name);
      });
  }
  }
}

