import React, { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { database ,getCurrentUserId,auth, addToFavorites, removeFromFavorites} from './firebase';
import Button from '@mui/material/Button';
import { getDatabase, ref, set, get, update, onValue } from 'firebase/database';
import LayerList from '@arcgis/core/widgets/LayerList';
import '@arcgis/core/assets/esri/themes/light/main.css';

import './EsriMapComponent.css';

const Map = () => {
  const mapViewNode = useRef(null);
  const mapView = useRef(null);
  const [footballLayerVisible, setFootballLayerVisible] = useState(true);
  const [layerList, setLayerList] = useState(null);

  const toggleFootballLayerVisibility = () => {
    setFootballLayerVisible(!footballLayerVisible);
  };

  const initializeMap = async () => {
    if (mapView.current) return;

    Config.apiKey = 'AAPK3d737cc3995b41de949427b52d04f894Ujr4K1pyTeeqmvTK161wvqE6yVRI_bv7MLOWyOrKzXhG9DaHWeR4T-cXQfIGgmEW';

    const addFieldToFavoritesAction = {
      title: "Add To Favourites",
      id: "add-this",
      className: "esri-icon-favorites",
    };

    const removeFieldFromFavoritesAction = {
      title: "Remove From Favourites",
      id: "remove-this",
      className: "esri-icon-close-circled"
    };

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
      ],
      actions: [addFieldToFavoritesAction, removeFieldFromFavoritesAction]
    });
    
    const map = new WebMap({
      basemap: 'arcgis/navigation',
    });

    mapView.current = new MapView({
      container: mapViewNode.current,
      center: [26.1025, 44.4268],
      zoom: 11,
      map: map,
    });

    const url_ball = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTQiIGhlaWdodD0iMTk0IiB2ZXJzaW9uPSIxLjEiPgoJPGNpcmNsZSBmaWxsPSIjMDAwMDAwIiBjeD0iOTciIGN5PSI5NyIgcj0iOTciIC8+Cgk8cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtIDk0LDkuMiBhIDg4LDg4IDAgMCAwIC01NSwyMS44IGwgMjcsMCAyOCwtMTQuNCAwLC03LjQgeiBtIDYsMCAwLDcuNCAyOCwxNC40IDI3LDAgYSA4OCw4OCAwIDAgMCAtNTUsLTIxLjggeiBtIC02Ny4yLDI3LjggYSA4OCw4OCAwIDAgMCAtMjAsMzQuMiBsIDE2LDI3LjYgMjMsLTMuNiAyMSwtMzYuMiAtOC40LC0yMiAtMzEuNiwwIHogbSA5Ni44LDAgLTguNCwyMiAyMSwzNi4yIDIzLDMuNiAxNS44LC0yNy40IGEgODgsODggMCAwIDAgLTE5LjgsLTM0LjQgbCAtMzEuNiwwIHogbSAtNTAsMjYgLTIwLjIsMzUuMiAxNy44LDMwLjggMzkuNiwwIDE3LjgsLTMwLjggLTIwLjIsLTM1LjIgLTM0LjgsMCB6IG0gLTY4LjgsMTYuNiBhIDg4LDg4IDAgMCAwIC0xLjgsMTcuNCA4OCw4OCAwIDAgMCAxMC40LDQxLjQgbCA3LjQsLTQuNCAtMS40LC0yOSAtMTQuNiwtMjUuNCB6IG0gMTcyLjQsMC4yIC0xNC42LDI1LjIgLTEuNCwyOSA3LjQsNC40IGEgODgsODggMCAwIDAgMTAuNCwtNDEuNCA4OCw4OCAwIDAgMCAtMS44LC0xNy4yIHogbSAtMTA2LDU3LjIgLTE1LjQsMTkgTCA3Ny4yLDE4Mi42IGEgODgsODggMCAwIDAgMTkuOCwyLjQgODgsODggMCAwIDAgMTkuOCwtMi40IGwgMTUuNCwtMjYuNiAtMTUuNCwtMTkgLTM5LjYsMCB6IG0gLTQ3LjgsMi42IC03LDQgQSA4OCw4OCAwIDAgMCA2OC44LDE4MC40IGwgLTE0LC0yNC42IC0yNS40LC0xNi4yIHogbSAxMzUuMiwwIC0yNS40LDE2LjIgLTE0LDI0LjQgYSA4OCw4OCAwIDAgMCA0Ni40LC0zNi42IGwgLTcsLTQgeiIvPgo8L3N2Zz4K';

    const footballLayer = new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
          id: 'footballLayerId',
          title: 'Terenuri de fotbal',
          outFields: ['*'],
          popupTemplate: popupFootballFields,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              url: url_ball,
              width: '20px',
              height: '20px',
            },
          },
        });
      
      map.add(footballLayer);


      await mapView.current.when();

      reactiveUtils.on(
        () => mapView.current.popup,
        "trigger-action",
        async (event) => {
          // Execute the measureThis() function if the measure-this action is clicked
          if (event.action.id === "add-this") {
            if (mapView.current.popup.visible && mapView.current.popup.selectedFeature) {
              const fieldId = mapView.current.popup.selectedFeature.attributes.id;
              await addToFavorites(fieldId,"footballFieldsFavouriteList");
            }
          }
          if (event.action.id === "remove-this") {
            if (mapView.current.popup.visible && mapView.current.popup.selectedFeature) {
              const fieldId = mapView.current.popup.selectedFeature.attributes.id;
              await removeFromFavorites(fieldId, "footballFieldsFavouriteList");
            }
          }
        }
      );

      // Define a reference to the `footballFieldsFavouriteList` for the current user in Firebase
    const userId = getCurrentUserId();
    const databaseRef = getDatabase(); // Get the Firebase Database reference
    const footballFieldsFavouriteRef = ref(databaseRef, 'users/' + userId + '/footballFieldsFavouriteList');
    const favouriteFootbalFieldsLayer = new FeatureLayer({
      url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
      id: 'favouriteFootballLayerId',
      title: 'Terenuri de fotbal favorite',
      outFields: ['*'],
      definitionExpression: '',
      popupTemplate: popupFootballFields,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: url_ball,
          width: '20px',
          height: '20px',
        },
      },
    });;
    

    onValue(footballFieldsFavouriteRef, (snapshot) => {
      const favoriteFieldIds = snapshot.val() || [];
      console.log(favoriteFieldIds)

      // Create a query to filter the `footballLayer` based on these IDs
      const query = footballLayer.createQuery();
      query.where = 'id IN (' + favoriteFieldIds.join(', ') + ')';
      favouriteFootbalFieldsLayer.definitionExpression = query.where;
    });

   
    map.add(favouriteFootbalFieldsLayer);
      // Create a LayerList widget
  const layerListWidget = new LayerList({
    view: mapView.current,
    listItemCreatedFunction: (event) => {
      // Customize the appearance of the layer list items if needed
      const item = event.item;
      if (item.layer.type === "feature") {
        // You can customize feature layer list items here
      }
    },
  });

  // Add the LayerList widget to the UI
  mapView.current.ui.add(layerListWidget, {
    position: "top-right", // Adjust the position as needed
  });

  // Store the LayerList widget instance in the state
  setLayerList(layerListWidget);
 
  if (layerList) {
    layerList.operationalItems.addMany(footballLayer,favouriteFootbalFieldsLayer);
  }
  };

  useEffect(() => {
    initializeMap();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '50px' }}>
      <div
        ref={mapViewNode}
        className="map-container"
        style={{ position: 'absolute', top: '50px', width: '100%', height: 'calc(100% - 50px)' }}
      ></div>
      <div
        className="centered-buttons"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: '-15px',
          width: '100%',
          gap: '100px',
        }}
      >
      </div>
    </div>
  );
};

export default Map;