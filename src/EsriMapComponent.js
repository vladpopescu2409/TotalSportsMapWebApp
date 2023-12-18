import React, { useEffect, useRef } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';

import './EsriMapComponent.css';

const EsriMapComponent = () => {
  const mapViewNode = useRef(null);
  const mapLoaded = useRef(false);
  const mapView = useRef(null);

  useEffect(() => {
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
                { fieldName: 'id', label: 'ID', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'description', label: 'Sport', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'Address', label: 'Address', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'Facilities', label: 'Facilities', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'No_fields', label: 'Fields', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'PhoneNumber', label: 'Phone Number', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
                { fieldName: 'Price', label: 'Price (per hour)', visible: true, isEditable: true, tooltip: '', format: null, stringFieldOption: 'text-box' },
              ],
            },
          ],
        });

        const map = new WebMap({
          basemap: 'arcgis/navigation',
        });

        const footballLayer = new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
          outFields: ['OBJECTID', 'name', 'Address', 'id', 'Facilities', 'description', 'Price', 'PhoneNumber', 'No_fields'],
          popupTemplate: popupFootballFields,
        });

        map.add(footballLayer, 0);

        mapView.current = new MapView({
          container: mapViewNode.current,
          center: [26.1025, 44.4268],
          zoom: 12,
          map: map,
        });

        mapView.current.on('error', (error) => console.error('MapView error:', error));

        await mapView.current.when();
        console.log('ArcGIS map loaded');
        mapLoaded.current = true;
      } catch (error) {
        console.error('EsriLoader: ', error);
      }
    };

    initializeMap();

    return () => {
      if (mapView.current) {
        mapView.current.destroy();
      }
    };
  }, []);

  return <div ref={mapViewNode} className="map-container"></div>;
};

export default EsriMapComponent;