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
      
      const url_ball = 'data:image/png;base64,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';
      const footballLayer = new FeatureLayer({
        url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
        outFields: ['OBJECTID', 'name', 'Address', 'id', 'Facilities', 'description', 'Price', 'PhoneNumber', 'No_fields'],
        popupTemplate: popupFootballFields, // Assign the PopupTemplate to the FeatureLayer
        renderer: {
          type: 'simple',
          symbol: {
            type: 'picture-marker',
            url: url_ball,
            width: '30px',
            height: '30px',
          },
        },
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

      const drawPolygon = () => {
        // Coordinates for a sample polygon around Bucharest (you can modify these coordinates)
        const polygonCoordinates = [
          [25.97, 44.53], // Top-West
          [26.02, 44.36], // Bottom-West
          [26.22, 44.31], // Bottom-East
          [26.35, 44.44], // Middle-East
          [25.97, 44.53]  // Closing the polygon (back to Top-West)
        ];
      
        // Create a polygon geometry using the coordinates
        const polygonGeometry = {
          type: 'polygon',
          rings: [polygonCoordinates],
        };
      
        // Symbol for the polygon
        const fillSymbol = {
          type: 'simple-fill',
          color: [227, 139, 79, 0.5], // Change the color and transparency as desired
          outline: {
            color: [255, 255, 255],
            width: 1,
          },
        };
      
        // Create a graphic with the polygon geometry and symbol
        const polygonGraphic = new Graphic({
          geometry: polygonGeometry,
          symbol: fillSymbol,
        });
      
        // Add the graphic to the map view
        mapView.current.graphics.add(polygonGraphic);
      };
      
      // Call the drawPolygon function from within the initializeMap function
      drawPolygon();

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