import React, { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load the ArcGIS modules
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer'], { css: true })
      .then(([Map, MapView, FeatureLayer]) => {
        // Create a map
        const map = new Map({
          basemap: 'streets' // You can change the basemap as needed
        });

        // Create a map view
        const view = new MapView({
          container: mapRef.current,
          map,
          center: [-98, 40], // Set the initial center of the map
          zoom: 4 // Set the initial zoom level
        });

        // Create a feature layer (replace this URL with your own feature layer URL)
        const featureLayer = new FeatureLayer({
          url: 'YOUR_FEATURE_LAYER_URL'
        });

        // Add the feature layer to the map
        map.add(featureLayer);
      })
      .catch((err) => console.error('Error loading ArcGIS modules:', err));
  }, []);

  return <div ref={mapRef} style={{ height: '500px' }} />;
};
