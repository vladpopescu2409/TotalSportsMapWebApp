import React, { useEffect, useRef } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Config from '@arcgis/core/config';

import './EsriMapComponent.css'; // Make sure to import the CSS file for styling

const EsriMapComponent = () => {
  const mapViewNode = useRef(null);
  const mapLoaded = useRef(false);
  const mapView = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (mapLoaded.current) return;

        Config.apiKey = '';

        const map = new WebMap({
          basemap: 'arcgis/navigation',
        });

        const footballLayer = new FeatureLayer({
          url:  "https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer"
        });

        map.add(footballLayer);

        mapView.current = new MapView({
          container: mapViewNode.current,
          center: [26.1025, 44.4268], // Bucharest coordinates
          //center: [-118.73682450024377, 34.07817583063242],
          zoom: 12,
          map: map,
        });

        // Log errors to the console
        mapView.current.on('error', (error) => console.error('MapView error:', error));

        await mapView.current.when(); // wait for the map to load
        console.log('ArcGIS map loaded');
        mapLoaded.current = true;
      } catch (error) {
        console.error('EsriLoader: ', error);
      }
    };

    initializeMap();

    // Cleanup function to destroy the MapView instance when the component is unmounted
    return () => {
      if (mapView.current) {
        mapView.current.destroy();
      }
    };
  }, []);

  return <div ref={mapViewNode} style={{ height: '500px', width: '100%' }}></div>;
};

export default EsriMapComponent;