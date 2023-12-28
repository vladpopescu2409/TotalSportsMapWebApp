// Config.apiKey = 'AAPK3d737cc3995b41de949427b52d04f894Ujr4K1pyTeeqmvTK161wvqE6yVRI_bv7MLOWyOrKzXhG9DaHWeR4T-cXQfIGgmEW';
import React, { useEffect, useRef } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import '@arcgis/core/assets/esri/themes/light/main.css'; // Import the ArcGIS CSS

import './EsriMapComponent.css';


const EsriMapComponent = () => {
  const mapViewNode = useRef(null);
  const mapLoaded = useRef(false);
  const mapView = useRef(null);


  const showUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const point = {
            type: 'point',
            longitude: longitude,
            latitude: latitude,
          };

          const markerGraphic = new Graphic({
            geometry: point,
            symbol: {
              type: 'simple-marker',
              color: 'blue',
              size: 8,
            },
          });

          mapView.current.graphics.add(markerGraphic);
          mapView.current.goTo(point);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported');
    }
  };
  
  const initializeMap = async () => {
    try {
      if (mapLoaded.current) return;

      Config.apiKey = 'AAPK3d737cc3995b41de949427b52d04f894Ujr4K1pyTeeqmvTK161wvqE6yVRI_bv7MLOWyOrKzXhG9DaHWeR4T-cXQfIGgmEW';

      const popupFootballFields = new PopupTemplate({
        title: '{name}',
        content: [
          {
            type: 'fields',
            fieldInfos: [
              { fieldName: 'id', label: 'ID', visible: true, isEditable: true },
              { fieldName: 'description', label: 'Sport', visible: true, isEditable: true },
              { fieldName: 'Address', label: 'Address', visible: true, isEditable: true },
              { fieldName: 'Facilities', label: 'Facilities', visible: true, isEditable: true },
              { fieldName: 'No_fields', label: 'Fields', visible: true, isEditable: true },
              { fieldName: 'PhoneNumber', label: 'Phone Number', visible: true, isEditable: true },
              { fieldName: 'Price', label: 'Price (per hour)', visible: true, isEditable: true },
            ],
          },
          {
            type: 'attachments',
            content: '<img src="{attachmentInfos[0].url}" alt="Attachment"/>', // Displaying the first attachment as an image
          },
        ],
      });

      const map = new WebMap({
        basemap: 'arcgis/navigation',
      });

      const footballLayer = new FeatureLayer({
        url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
        outFields: ['OBJECTID', 'name', 'Address', 'id', 'Facilities', 'description', 'Price', 'PhoneNumber', 'No_fields'],
        popupTemplate: popupFootballFields, // Assign the PopupTemplate to the FeatureLayer
      });

      map.add(footballLayer);

      mapView.current = new MapView({
        container: mapViewNode.current,
        center: [26.1025, 44.4268],
        zoom: 12,
        map: map,
      });

      await mapView.current.when();

      mapView.current.on('error', (error) => console.error('MapView error:', error));

      await mapView.current.when();
      console.log('ArcGIS map loaded');
      mapLoaded.current = true;
    } catch (error) {
      console.error('EsriLoader: ', error);
    }
  };


  useEffect(() => {
    initializeMap();

    return () => {
      if (mapView.current) {
        mapView.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '50px' }}>
      <div
        ref={mapViewNode}
        className="map-container"
        style={{ position: 'absolute', top: '10px', width: '100%', height: 'calc(100% - 50px)' }}
      ></div>
      <button
        onClick={showUserLocation}
        className="map-button" // Apply the button class
        style={{
          position: 'absolute',
          bottom: '-10px',
          right: '25px',
          zIndex: '1001',
        }}
      >
        Show My Location
      </button>
    </div>
  );
};

export default EsriMapComponent;