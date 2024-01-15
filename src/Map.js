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

  const initializeMap = async () => {
    if (mapView.current) return;

    Config.apiKey = 'AAPK3d737cc3995b41de949427b52d04f894Ujr4K1pyTeeqmvTK161wvqE6yVRI_bv7MLOWyOrKzXhG9DaHWeR4T-cXQfIGgmEW';

    const popupFootballFields = new PopupTemplate({
      title: '{name}',
      outFields: ['*'],
      content: async function(feature) {
        const ratingsData = await fetchRatingsForField(feature.graphic.attributes.id - 1);
    
        let ratingsContent = "<b>Ratings:</b><br/>";
        let sum = 0.0;
        let nr = 0;
        for (const userId in ratingsData) {
          const userRating = ratingsData[userId];
          const userName = await fetchNameByUserId(userId);
          nr += 1;
          sum += userRating.rating;
          ratingsContent += userName === null ?
            `User Anonymous: ${userRating.rating} stars - ${userRating.comment} <br/>` :
            `User ${userName}: ${userRating.rating} stars - ${userRating.comment} <br/>`;
        }
    
        let ratingsAverage = nr > 0 ? "<b>Average Rating:</b> " + (sum / nr).toFixed(1) : "<b>No Ratings Yet</b>";
    
        let fieldContent = `
          <b>ID:</b> ${feature.graphic.attributes.id}<br/>
          <b>Sport:</b> ${feature.graphic.attributes.description}<br/>
          <b>Address:</b> ${feature.graphic.attributes.Address}<br/>
          <b>Facilities:</b> ${feature.graphic.attributes.Facilities}<br/>
          <b>Fields:</b> ${feature.graphic.attributes.No_fields}<br/>
          <b>Phone Number:</b> ${feature.graphic.attributes.PhoneNumber}<br/>
          <b>Price (per hour):</b> ${feature.graphic.attributes.Price}<br/>
        `;
    
        // Image element in HTML
        let imageHtml = `<img src="${feature.graphic.attributes.url}" alt="Field Image" style="width:100%;max-height:200px;">`; // Adjust the style as needed
    
        // Combine all contents
        let combinedContent = fieldContent + ratingsContent + ratingsAverage + imageHtml;
    
        // Return the combined content
        return combinedContent;
      },
      actions: [addRatingAction]
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