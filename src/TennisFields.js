import React, { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { addToFavorites, removeFromFavorites, fetchRatingsForField, fetchNameByUserId} from './firebase';
import Button from '@mui/material/Button';
import RatingForm from "./RatingFormFootball";
import { useNavigate } from 'react-router-dom';
import '@arcgis/core/assets/esri/themes/light/main.css';

import './EsriMapComponent.css';

const Map = () => {
  const mapViewNode = useRef(null);
  const mapView = useRef(null);
  const navigate = useNavigate();

  const openRatingForm = (fieldId) => {
    navigate('/ratingform', { state: { fieldId } });
  };

  const url_ball = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTQiIGhlaWdodD0iMTk0IiB2ZXJzaW9uPSIxLjEiPgoJPGNpcmNsZSBmaWxsPSIjMDAwMDAwIiBjeD0iOTciIGN5PSI5NyIgcj0iOTciIC8+Cgk8cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtIDk0LDkuMiBhIDg4LDg4IDAgMCAwIC01NSwyMS44IGwgMjcsMCAyOCwtMTQuNCAwLC03LjQgeiBtIDYsMCAwLDcuNCAyOCwxNC40IDI3LDAgYSA4OCw4OCAwIDAgMCAtNTUsLTIxLjggeiBtIC02Ny4yLDI3LjggYSA4OCw4OCAwIDAgMCAtMjAsMzQuMiBsIDE2LDI3LjYgMjMsLTMuNiAyMSwtMzYuMiAtOC40LC0yMiAtMzEuNiwwIHogbSA5Ni44LDAgLTguNCwyMiAyMSwzNi4yIDIzLDMuNiAxNS44LC0yNy40IGEgODgsODggMCAwIDAgLTE5LjgsLTM0LjQgbCAtMzEuNiwwIHogbSAtNTAsMjYgLTIwLjIsMzUuMiAxNy44LDMwLjggMzkuNiwwIDE3LjgsLTMwLjggLTIwLjIsLTM1LjIgLTM0LjgsMCB6IG0gLTY4LjgsMTYuNiBhIDg4LDg4IDAgMCAwIC0xLjgsMTcuNCA4OCw4OCAwIDAgMCAxMC40LDQxLjQgbCA3LjQsLTQuNCAtMS40LC0yOSAtMTQuNiwtMjUuNCB6IG0gMTcyLjQsMC4yIC0xNC42LDI1LjIgLTEuNCwyOSA3LjQsNC40IGEgODgsODggMCAwIDAgMTAuNCwtNDEuNCA4OCw4OCAwIDAgMCAtMS44LC0xNy4yIHogbSAtMTA2LDU3LjIgLTE1LjQsMTkgTCA3Ny4yLDE4Mi42IGEgODgsODggMCAwIDAgMTkuOCwyLjQgODgsODggMCAwIDAgMTkuOCwtMi40IGwgMTUuNCwtMjYuNiAtMTUuNCwtMTkgLTM5LjYsMCB6IG0gLTQ3LjgsMi42IC03LDQgQSA4OCw4OCAwIDAgMCA2OC44LDE4MC40IGwgLTE0LC0yNC42IC0yNS40LC0xNi4yIHogbSAxMzUuMiwwIC0yNS40LDE2LjIgLTE0LDI0LjQgYSA4OCw4OCAwIDAgMCA0Ni40LC0zNi42IGwgLTcsLTQgeiIvPgo8L3N2Zz4K';

  const addRatingAction = {
    title: "Rate",
    id: "rate-this",
    className: "esri-icon-edit"
  };

  
  const popupFootballFields = new PopupTemplate({
    title: '{name}',
    outFields: ['*'],
    content:  [ {
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
    actions: [addRatingAction]
  });

  const initializeMap = async () => {
    if (mapView.current) return;

    Config.apiKey = 'AAPK3d737cc3995b41de949427b52d04f894Ujr4K1pyTeeqmvTK161wvqE6yVRI_bv7MLOWyOrKzXhG9DaHWeR4T-cXQfIGgmEW';

    
    
    const map = new WebMap({
      basemap: 'arcgis/navigation',
    });

    mapView.current = new MapView({
      container: mapViewNode.current,
      center: [26.1025, 44.4268],
      zoom: 11,
      map: map,
    });
    
    const createFootballLayer = async() => {
      //const featureLayerData = await getFootballFeatureLayerData();
      //const formattedData = formatDataForFirebase(featureLayerData);
      //addFootballFieldsToFirebase(formattedData);
      return new FeatureLayer({
        url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
        id: 'footballLayerId',
        visible: true,
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
    }

    const footballLayer = await createFootballLayer();
    map.add(footballLayer);

      reactiveUtils.on(
        () => mapView.current.popup,
        "trigger-action",
        async (event) => {
          if (event.action.id === "rate-this") {
            if (mapView.current.popup.visible && mapView.current.popup.selectedFeature) {
                const fieldId = mapView.current.popup.selectedFeature.attributes.id - 1;
                console.log(fieldId);
                openRatingForm(fieldId);
              }
            }
          }
      );

  
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
    </div>
  );
};

export default Map;