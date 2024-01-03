import React, { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
//import Graphic from '@arcgis/core/Graphic';
import Locate from '@arcgis/core/widgets/Locate';
import Home from '@arcgis/core/widgets/Home';
import Search from '@arcgis/core/widgets/Search';
import Legend from '@arcgis/core/widgets/Legend';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Directions from  '@arcgis/core/widgets/Directions';
import RouteLayer from '@arcgis/core/layers/RouteLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer'
import Button from '@mui/material/Button';
import '@arcgis/core/assets/esri/themes/light/main.css'; // Import the ArcGIS CSS

import './EsriMapComponent.css';

const EsriMapComponent = () => {
  const mapViewNode = useRef(null);
  const mapLoaded = useRef(false);
  const mapView = useRef(null);
  const locateWidget = useRef(null);
  const [footballLayerVisible, setFootballLayerVisible] = useState(true);
  const [tennisLayerVisible, setTennisLayerVisible] = useState(true);
  const [basketballLayerVisible, setBasketballLayerVisible] = useState(true);

  const toggleFootballLayerVisibility = () => {
    setFootballLayerVisible(!footballLayerVisible);
  };

  const toggleTennisLayerVisibility = () => {
    setTennisLayerVisible(!tennisLayerVisible);
  };

  const toggleBasketballLayerVisibility = () => {
    setBasketballLayerVisible(!basketballLayerVisible);
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
            content: (attachments) => {
              if (attachments && attachments.length > 0) {
                return `<img src="${attachments[0].url}" alt="Attachment"/>`;
              }
              return 'No image available';
            },
          },
        ],
      });

      const popupNeighbourhoods = new PopupTemplate({
        title: '{Denumire}',
      });


      const routeLayer = new RouteLayer();
      const map = new WebMap({
        basemap: 'arcgis/navigation',
        layers: [routeLayer]
      });

      mapView.current = new MapView({
        container: mapViewNode.current,
        center: [26.1025, 44.4268],
        zoom: 11,
        map: map,
      });

      const neighbourhoodLayer = new FeatureLayer({
        url: 'https://services3.arcgis.com/uqhwf6G7xoGVtEZ0/arcgis/rest/services/Cartiere_Bucure%C8%99ti/FeatureServer',
        title: 'Cartiere Bucuresti',
        popupTemplate: popupNeighbourhoods
      });

      map.add(neighbourhoodLayer);

      const trafficLayer = new MapImageLayer({
        url: 'https://utility.arcgis.com/usrsvcs/servers/529472aaf30947929eb09d7cfcd11ce0/rest/services/World/Traffic/MapServer',
      });

      map.add(trafficLayer);
      
      const createFootballLayer = (visibility) => {
        const url_ball = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTQiIGhlaWdodD0iMTk0IiB2ZXJzaW9uPSIxLjEiPgoJPGNpcmNsZSBmaWxsPSIjMDAwMDAwIiBjeD0iOTciIGN5PSI5NyIgcj0iOTciIC8+Cgk8cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtIDk0LDkuMiBhIDg4LDg4IDAgMCAwIC01NSwyMS44IGwgMjcsMCAyOCwtMTQuNCAwLC03LjQgeiBtIDYsMCAwLDcuNCAyOCwxNC40IDI3LDAgYSA4OCw4OCAwIDAgMCAtNTUsLTIxLjggeiBtIC02Ny4yLDI3LjggYSA4OCw4OCAwIDAgMCAtMjAsMzQuMiBsIDE2LDI3LjYgMjMsLTMuNiAyMSwtMzYuMiAtOC40LC0yMiAtMzEuNiwwIHogbSA5Ni44LDAgLTguNCwyMiAyMSwzNi4yIDIzLDMuNiAxNS44LC0yNy40IGEgODgsODggMCAwIDAgLTE5LjgsLTM0LjQgbCAtMzEuNiwwIHogbSAtNTAsMjYgLTIwLjIsMzUuMiAxNy44LDMwLjggMzkuNiwwIDE3LjgsLTMwLjggLTIwLjIsLTM1LjIgLTM0LjgsMCB6IG0gLTY4LjgsMTYuNiBhIDg4LDg4IDAgMCAwIC0xLjgsMTcuNCA4OCw4OCAwIDAgMCAxMC40LDQxLjQgbCA3LjQsLTQuNCAtMS40LC0yOSAtMTQuNiwtMjUuNCB6IG0gMTcyLjQsMC4yIC0xNC42LDI1LjIgLTEuNCwyOSA3LjQsNC40IGEgODgsODggMCAwIDAgMTAuNCwtNDEuNCA4OCw4OCAwIDAgMCAtMS44LC0xNy4yIHogbSAtMTA2LDU3LjIgLTE1LjQsMTkgTCA3Ny4yLDE4Mi42IGEgODgsODggMCAwIDAgMTkuOCwyLjQgODgsODggMCAwIDAgMTkuOCwtMi40IGwgMTUuNCwtMjYuNiAtMTUuNCwtMTkgLTM5LjYsMCB6IG0gLTQ3LjgsMi42IC03LDQgQSA4OCw4OCAwIDAgMCA2OC44LDE4MC40IGwgLTE0LC0yNC42IC0yNS40LC0xNi4yIHogbSAxMzUuMiwwIC0yNS40LDE2LjIgLTE0LDI0LjQgYSA4OCw4OCAwIDAgMCA0Ni40LC0zNi42IGwgLTcsLTQgeiIvPgo8L3N2Zz4K';
    
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
          id: 'footballLayerId',
          visible: visibility,
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

      const footballLayer = createFootballLayer(true);
      map.add(footballLayer);

      const createTennisLayer = (visibility) => {
        const url_ball = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1Ij4NCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM1MS44NDQ0OCwtNjA1LjU0MjQyKSI+DQogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC4yMjgwODE1MiwwLDAsMC4yMjgwMDgwNywyNzEuNTk1MjYsNDk0LjQ5MzU4KSI+DQogICAgICA8cGF0aCBkPSJtIDUwNS4xMjMzNiw1NjguOTUxMzIgYyAtMi44MzYzMSw0Mi4yODY3NSAtMzkuNDUwNDUsNzQuMTk1MiAtODEuNzM3MjEsNzEuNDIzMzYgLTQyLjI4Njc2LC0yLjgzNjMxIC03NC4yNTk2NywtMzkuNDUwNDUgLTcxLjM1ODksLTgxLjgwMTY3IDIuODM2MywtNDIuMjIyMjkgMzkuNDUwNDUsLTc0LjE5NTIxIDgxLjY3Mjc0LC03MS4zNTg5IDQyLjI4Njc2LDIuODM2MzEgNzQuMjU5NjgsMzkuNDUwNDUgNzEuNDIzMzcsODEuNzM3MjEiIHN0eWxlPSJmaWxsOiNlOGUwMDA7IiAvPg0KICAgICAgPHBhdGggc3R5bGU9ImZpbGw6I2ZmZmZmZjsiDQogICAgICAgICBkPSJNIDE5LjgxMjUgMC40MDYyNSBDIDE4LjAzNDU2MiAwLjQ5NTI2Nzg3IDE2LjU4NDM4IDEuNTExNTQxOCAxNS44MTI1IDIuNDM3NSBDIDE0LjkzMDM0OSAzLjQ5NTczNzkgMTEuMDMyOTIxIDEyLjM2ODY4NyAxMC4zMTI1IDE0LjI1IEMgOS41NzczNzUgMTYuMTMxMzExIDcuODExOTc5MSAxOS40MzMwNDIgNS41NjI1IDIxLjM0Mzc1IEMgMy4xMjE4ODYzIDIzLjQ2MDIyNCAwLjU2MjUgMjEuMjE4NzUgMC41NjI1IDIxLjIxODc1IEMgMS4wNDc2ODE5IDIzLjU0MDk5MiAzLjMzNTEwMzcgMjQuMDg1NzggNS42ODc1IDIyLjk2ODc1IEMgOC4wMjUxOTQyIDIxLjgzNzAyNSAxMC45MzAzNTEgMTYuNjE4MzI5IDExLjgxMjUgMTQuNTMxMjUgQyAxMi42OTQ2NDkgMTIuNDQ0MTY5IDE1LjU3OTMzNyA1Ljg5MzczODQgMTYuODQzNzUgMy4yMTg3NSBDIDE4LjA5MzQ2MSAwLjU1ODQ1NjcyIDIwLjU5Mzc1IDAuNDM3NSAyMC41OTM3NSAwLjQzNzUgQyAyMC4zMjcyNjggMC40MDk5NDE1MiAyMC4wNjY0OTEgMC4zOTM1MzMxNiAxOS44MTI1IDAuNDA2MjUgeiBNIDM0Ljg3NSAxNS41IEMgMzQuODc1IDE1LjUgMzIuNTM2OTU0IDIyLjM0ODM3MSAyNS40MDYyNSAyNy4zNzUgQyAxOC4zMDQ5NSAzMi40MTYzMjcgMTUuMDMxMjUgMzQuODEyNSAxNS4wMzEyNSAzNC44MTI1IEwgMTYuNjI1IDM0Ljk2ODc1IEwgMjYgMjguNDM3NSBDIDI2Ljg4MjE0OSAyNy43OTA3OTggMzUuOTMzNTc5IDIxLjg5MzUyIDM0Ljg3NSAxNS41IHogIg0KICAgICAgICAgdHJhbnNmb3JtPSJtYXRyaXgoNC4zODQzOTczLDAsMCw0LjM4NTgwOTcsMzUxLjg0NDQ2LDQ4Ny4wMzkwOCkiIC8+DQogICAgPC9nPg0KICA8L2c+DQo8L3N2Zz4NCg==';
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/arcgis/rest/services/Tenis_Layer/FeatureServer',
          id: 'tennisLayerId',
          visible: visibility,
          title: 'Terenuri de tenis',
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

      const tennisLayer = createTennisLayer(true);
      map.add(tennisLayer);

      const createBasketballLayer = (visibility) => {
        const url_ball = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJzdmcyNDk1IiB2aWV3Qm94PSIwIDAgMzcwIDM3MCIgdmVyc2lvbj0iMS4wIj4KICA8ZGVmcyBpZD0iZGVmczI0OTciPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXJHcmFkaWVudDI2NDEiIHgxPSIyNjYuMDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB5MT0iMzY1LjgiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjM0Ni4zMSIgeTI9IjM1Ny45OCI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzI3NiIgc3RvcC1jb2xvcj0iI2Y1NzkzNiIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzI3OCIgc3RvcC1jb2xvcj0iI2Y1NzkzNiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY0MyIgeDE9IjI3NC40OSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIzNDIuNSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgtMTEyLjUyIC0yNzEpIiB4Mj0iMjgyLjMiIHkyPSIzMDUuMDMiPgogICAgICA8c3RvcCBpZD0ic3RvcDMyODYiIHN0b3AtY29sb3I9IiNmMzgxM2IiIG9mZnNldD0iMCIvPgogICAgICA8c3RvcCBpZD0ic3RvcDMyODgiIHN0b3AtY29sb3I9IiNmMzgxM2IiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXJHcmFkaWVudDI2NDUiIHgxPSIyNDUuNzEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB5MT0iMzc3LjY5IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTIuNTIgLTI3MSkiIHgyPSIyNTAuMzYiIHkyPSIzMjEuODQiPgogICAgICA8c3RvcCBpZD0ic3RvcDMyOTYiIHN0b3AtY29sb3I9IiNmOWE0NjUiIG9mZnNldD0iMCIvPgogICAgICA8c3RvcCBpZD0ic3RvcDMyOTgiIHN0b3AtY29sb3I9IiNmOWE0NjUiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXJHcmFkaWVudDI2NDciIHgxPSIyMjUuOTkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB5MT0iNDAwLjA3IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTIuNTIgLTI3MSkiIHgyPSIxNjUuNjYiIHkyPSIzODMuMjIiPgogICAgICA8c3RvcCBpZD0ic3RvcDMzMDYiIHN0b3AtY29sb3I9IiNmYWE2NjgiIG9mZnNldD0iMCIvPgogICAgICA8c3RvcCBpZD0ic3RvcDMzMDgiIHN0b3AtY29sb3I9IiNmYWE2NjgiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXJHcmFkaWVudDI2NDkiIHgxPSIxOTkuMyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI0MjAuMDIiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjE2MS4zNiIgeTI9IjQ0Ny4xMSI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMxNiIgc3RvcC1jb2xvcj0iI2YxN2UzOSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMxOCIgc3RvcC1jb2xvcj0iI2YxN2UzOSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY1MSIgeDE9IjIxOC4xNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI0MjkuNjkiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjIxMy4zNSIgeTI9IjQ4MS4zMiI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMyNiIgc3RvcC1jb2xvcj0iI2Y2N2EzNCIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMyOCIgc3RvcC1jb2xvcj0iI2Y2N2EzNCIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY1MyIgeDE9IjIzNS4zMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI0MDcuMDQiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjI3Ny40NyIgeTI9IjQ1MC45OCI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMzNiIgc3RvcC1jb2xvcj0iI2ZjOWY1OSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzMzOCIgc3RvcC1jb2xvcj0iI2ZjOWY1OSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY1NSIgeDE9IjI2NC44MiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIzNzUuNzkiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjMxNC4yNyIgeTI9IjQwNy42OSI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM0NiIgc3RvcC1jb2xvcj0iI2ZjOWY1OSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM0OCIgc3RvcC1jb2xvcj0iI2ZjOWY1OSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY1NyIgeDE9IjQ2NS43MSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI1MjcuMjUiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjMxOC4xIiB5Mj0iNDA4LjA5Ij4KICAgICAgPHN0b3AgaWQ9InN0b3AzMzU2IiBzdG9wLWNvbG9yPSIjOWY0MTBkIiBvZmZzZXQ9IjAiLz4KICAgICAgPHN0b3AgaWQ9InN0b3AzMzU4IiBzdG9wLWNvbG9yPSIjOWY0MTBkIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iMSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyR3JhZGllbnQyNjU5IiB4MT0iNDQyLjQ4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeTE9IjM2MC41IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTIuNTIgLTI3MSkiIHgyPSIzMzQuMDYiIHkyPSIzNTguOCI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM2NiIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM2OCIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY2MSIgeDE9IjMyNS4zNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIyNzcuMTkiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjMwMi45MiIgeTI9IjMwOS44NSI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM3NiIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM3OCIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY2MyIgeDE9IjIwMi4wNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIyODUuNjUiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjIyMS4yNSIgeTI9IjMxNC41OSI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM4NiIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM4OCIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY2NSIgeDE9IjEyOC41NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIzNjUuMzQiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi41MiAtMjcxKSIgeDI9IjE2Ny41OSIgeTI9IjM4My4yMiI+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM5NiIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgb2Zmc2V0PSIwIi8+CiAgICAgIDxzdG9wIGlkPSJzdG9wMzM5OCIgc3RvcC1jb2xvcj0iI2ExNDIwZSIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhckdyYWRpZW50MjY2NyIgeDE9IjM2Mi4zMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSI2MDguOCIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgtMTEyLjUyIC0yNzEpIiB4Mj0iMjY1LjExIiB5Mj0iNDQ2LjIzIj4KICAgICAgPHN0b3AgaWQ9InN0b3AzNDA2IiBzdG9wLWNvbG9yPSIjYTE0MjBkIiBvZmZzZXQ9IjAiLz4KICAgICAgPHN0b3AgaWQ9InN0b3AzNDA4IiBzdG9wLWNvbG9yPSIjYTE0MjBkIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iMSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyR3JhZGllbnQyNjY5IiB4MT0iMjI0LjMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB5MT0iNjE1LjI5IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTIuNTIgLTI3MSkiIHgyPSIyMTYuOTYiIHkyPSI0ODguNDciPgogICAgICA8c3RvcCBpZD0ic3RvcDM0MTYiIHN0b3AtY29sb3I9IiNhMTQyMGQiIG9mZnNldD0iMCIvPgogICAgICA8c3RvcCBpZD0ic3RvcDM0MTgiIHN0b3AtY29sb3I9IiNhMTQyMGQiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXJHcmFkaWVudDI2NzEiIHgxPSIxMTguNjYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB5MT0iNDg5LjI0IiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTIuNTIgLTI3MSkiIHgyPSIxNjEuMzYiIHkyPSI0NTAuOTMiPgogICAgICA8c3RvcCBpZD0ic3RvcDM0MjYiIHN0b3AtY29sb3I9IiNhMzQzMGUiIG9mZnNldD0iMCIvPgogICAgICA8c3RvcCBpZD0ic3RvcDM0MjgiIHN0b3AtY29sb3I9IiNhMzQzMGUiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyBpZD0ibGF5ZXIxIj4KICAgIDxnIGlkPSJnMjYxNCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzY5LjE3IDApIj4KICAgICAgPHBhdGggaWQ9InBhdGgyNDc0IiB0cmFuc2Zvcm09Im1hdHJpeCgxLjA0NTkgMCAwIDEuMDQ1OSAtMTQxLjE1IC0zMDUuNzUpIiBkPSJtNDgyLjA4IDQ2OC44N2ExNzAuNjIgMTcwLjYyIDAgMSAxIC0zNDEuMjUgMCAxNzAuNjIgMTcwLjYyIDAgMSAxIDM0MS4yNSAweiIvPgogICAgICA8cGF0aCBpZD0icGF0aDI0NTgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI2Q2NWExZSIgZD0ibTEyOS40MSAxMTkuMzFsLTIzLjQ2IDI4LjljNTcuMTkgNDEuOSAzMi44NiAxODcuNjMgOTYuMjggMjE0IDQ0Ljg3LTQuNDEgODQuODktMjUuNDcgMTEzLjc4LTU2LjktNTcuODMtNjkuNDctMTE3LjY0LTEzNS42LTE4Ni42LTE4NnoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgyNDYwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNkNjVhMWUiIGQ9Im0xNjMuMTMgODYuODA4bC0yNS4yOCAyNS4yODJjODMuNzYgNzEuMDEgMTM2Ljc2IDEzMC40OSAxODIuMzUgMTg3LjE5bDAuNzUgMC40M2MyNi4yNi0zMS4wNyA0Mi4wOS03MS4yNCA0Mi4wOS0xMTUuMDkgMC0zLjU1LTAuMTEtNy4wNy0wLjMxLTEwLjU2LTMxLjcyLTY0LTE1MC44Ny00My4wMi0xOTkuNi04Ny4yNTJ6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMjQ2MiIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZDY1YTFlIiBkPSJtMjY4LjY2IDM3Ljc0NWMtMzkuODEgMC4zOTgtOTAuMzkgMjYuMDEyLTk1LjMxIDQwLjY1NiAxLjYyIDM2Ljc1OSAxNzAuNiAyNS45ODkgMTg4LjM4IDg2LjY1OWwwLjI1IDAuMDNjLTUuNTktNTEuMi0zMi44NC05NS45MS03Mi40MS0xMjQuNzUtNi40Ni0xLjg3OC0xMy41NS0yLjY2OC0yMC45MS0yLjU5NXoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgyNDY0IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNkNjVhMWUiIGQ9Im0xODQuNiA2LjE4MjZjLTguOTUgMC0xNy43NyAwLjY2MjQtMjYuMzcgMS45Mzc1LTI2LjU1IDI4LjczNS0xMi4zOCA1NC41NDkgMS44NyA2Mi40MzggMTIuMTcgOC42NjMgNDMuNTUtNDUuNTgxIDEyMi4yMi0zNS4yMTktMjguMDgtMTguNDI2LTYxLjY1LTI5LjE1Ni05Ny43Mi0yOS4xNTZ6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMjQ2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZDY1YTFlIiBkPSJtMTAzLjI2IDE1OC42OGMtMS42MyAwLjAzLTMuMzMzIDAuMzYtNS4xMjcgMC45Ny0yMy4yNTcgMTguMjUtNjUuODAxIDEwNi4wNy00MC45MzcgMTQ5Ljg1IDAuMDA1IDAtMC4wMDUgMC4wMiAwIDAuMDMgMzIuMzkyIDMzLjAzIDc3LjUyNCA1My41MyAxMjcuNCA1My41MyAxLjM3IDAgMi43MyAwIDQuMS0wLjAzLTUzLjc0LTM4Ljg0LTQyLjA0LTE5My42OC04NS40NC0yMDQuMzV6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMjQ2OCIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZDY1YTFlIiBkPSJtNjAuMzIxIDEzNi4xNWMtMTkuNTM2IDAuNjItNDIuMzM1IDEwLjg2LTUzLjA2MyAzMy4xM2wtMC41NjIyIDEuMzRjLTAuMzU5NCA0LjYyLTAuNTYyNSA5LjI5LTAuNTYyNSAxNCAwIDQ0LjE1IDE2LjA2OCA4NC41NSA0Mi42NTcgMTE1LjcyLTI0LjYwOS03Ny4yNSA1MC4yNjYtMTQ1LjE3IDQyLjEyNS0xNTIuNzItNS4zODItNy44LTE3LjIyNy0xMS44OS0zMC41OTQtMTEuNDd6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMjQ3MCIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZDY1YTFlIiBkPSJtNTQuNjY1IDYyLjM3Yy0yNS4yMTMgMjYuNzg0LTQyLjI4IDYxLjM0LTQ3LjEyNSA5OS42OSAxOC45NjctMzEuNzIgNDcuMjYxLTQzLjI0IDkzLTE5LjI1bDIzLjQ3LTI5LjVjLTE1LjMzLTEzLjgyOS00Ny42NDItMzcuNzAyLTY5LjM0NS01MC45NHoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgyNDcyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNkNjVhMWUiIGQ9Im0xNTAuNTEgOS40MzI2Yy0zNC45NiA2Ljc2ODQtNjYuMjg1IDIzLjc1Ny05MC43NTIgNDcuNzE4bDAuNDM4IDAuNzgyYzI1LjczNyAxMS43MTkgNDcuNzU0IDMwLjkyOSA3MC40MzQgNDguNzQ3bDI3LjA3LTI1LjI3OWMtMTcuNjQtMTcuNzg0LTMxLjI0LTM3LjIwMi03LjE5LTcxLjk2OHoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzMjcyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjQxKSIgZD0ibTI2OC42NiAzNy43NDVjLTM5LjgxIDAuMzk4LTkwLjM5IDI2LjAxMi05NS4zMSA0MC42NTYgMS42MiAzNi43NTkgMTcwLjYgMjUuOTg5IDE4OC4zOCA4Ni42NTlsMC4yNSAwLjAzYy01LjU5LTUxLjItMzIuODQtOTUuOTEtNzIuNDEtMTI0Ljc1LTYuNDYtMS44NzgtMTMuNTUtMi42NjgtMjAuOTEtMi41OTV6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMzI4MiIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50MjY0MykiIGQ9Im0xODQuNiA2LjE4MjZjLTguOTUgMC0xNy43NyAwLjY2MjQtMjYuMzcgMS45Mzc1LTI2LjU1IDI4LjczNS0xMi4zOCA1NC41NDkgMS44NyA2Mi40MzggMTIuMTcgOC42NjMgNDMuNTUtNDUuNTgxIDEyMi4yMi0zNS4yMTktMjguMDgtMTguNDI2LTYxLjY1LTI5LjE1Ni05Ny43Mi0yOS4xNTZ6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMzI5MiIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50MjY0NSkiIGQ9Im0xNTAuNTEgOS40MzI2Yy0zNC45NiA2Ljc2ODQtNjYuMjg1IDIzLjc1Ny05MC43NTIgNDcuNzE4bDAuNDM4IDAuNzgyYzI1LjczNyAxMS43MTkgNDcuNzU0IDMwLjkyOSA3MC40MzQgNDguNzQ3bDI3LjA3LTI1LjI3OWMtMTcuNjQtMTcuNzg0LTMxLjI0LTM3LjIwMi03LjE5LTcxLjk2OHoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzMzAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjQ3KSIgZD0ibTU0LjY2NSA2Mi4zN2MtMjUuMjEzIDI2Ljc4NC00Mi4yOCA2MS4zNC00Ny4xMjUgOTkuNjkgMTguOTY3LTMxLjcyIDQ3LjI2MS00My4yNCA5My0xOS4yNWwyMy40Ny0yOS41Yy0xNS4zMy0xMy44MjktNDcuNjQyLTM3LjcwMi02OS4zNDUtNTAuOTR6Ii8+CiAgICAgIDxwYXRoIGlkPSJwYXRoMzMxMiIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50MjY0OSkiIGQ9Im02MC4zMjEgMTM2LjE1Yy0xOS41MzYgMC42Mi00Mi4zMzUgMTAuODYtNTMuMDYzIDMzLjEzbC0wLjU2MjIgMS4zNGMtMC4zNTk0IDQuNjItMC41NjI1IDkuMjktMC41NjI1IDE0IDAgNDQuMTUgMTYuMDY4IDg0LjU1IDQyLjY1NyAxMTUuNzItMjQuNjA5LTc3LjI1IDUwLjI2Ni0xNDUuMTcgNDIuMTI1LTE1Mi43Mi01LjM4Mi03LjgtMTcuMjI3LTExLjg5LTMwLjU5NC0xMS40N3oiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzMzIyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjUxKSIgZD0ibTEwMy4yNiAxNTguNjhjLTEuNjMgMC4wMy0zLjMzMyAwLjM2LTUuMTI3IDAuOTctMjMuMjU3IDE4LjI1LTY1LjgwMSAxMDYuMDctNDAuOTM3IDE0OS44NSAwLjAwNSAwLTAuMDA1IDAuMDIgMCAwLjAzIDMyLjM5MiAzMy4wMyA3Ny41MjQgNTMuNTMgMTI3LjQgNTMuNTMgMS4zNyAwIDIuNzMgMCA0LjEtMC4wMy01My43NC0zOC44NC00Mi4wNC0xOTMuNjgtODUuNDQtMjA0LjM1eiIvPgogICAgICA8cGF0aCBpZD0icGF0aDMzMzIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NTMpIiBkPSJtMTI5LjQxIDExOS4zMWwtMjMuNDYgMjguOWM1Ny4xOSA0MS45IDMyLjg2IDE4Ny42MyA5Ni4yOCAyMTQgNDQuODctNC40MSA4NC44OS0yNS40NyAxMTMuNzgtNTYuOS01Ny44My02OS40Ny0xMTcuNjQtMTM1LjYtMTg2LjYtMTg2eiIvPgogICAgICA8cGF0aCBpZD0icGF0aDMzNDIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NTUpIiBkPSJtMTYzLjEzIDg2LjgwOGwtMjUuMjggMjUuMjgyYzgzLjc2IDcxLjAxIDEzNi43NiAxMzAuNDkgMTgyLjM1IDE4Ny4xOWwwLjc1IDAuNDNjMjYuMjYtMzEuMDcgNDIuMDktNzEuMjQgNDIuMDktMTE1LjA5IDAtMy41NS0wLjExLTcuMDctMC4zMS0xMC41Ni0zMS43Mi02NC0xNTAuODctNDMuMDItMTk5LjYtODcuMjUyeiIvPgogICAgICA8cGF0aCBpZD0icGF0aDMzNTIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NTcpIiBkPSJtMTYzLjEzIDg2LjgwOGwtMjUuMjggMjUuMjgyYzgzLjc2IDcxLjAxIDEzNi43NiAxMzAuNDkgMTgyLjM1IDE4Ny4xOWwwLjc1IDAuNDNjMjYuMjYtMzEuMDcgNDIuMDktNzEuMjQgNDIuMDktMTE1LjA5IDAtMy41NS0wLjExLTcuMDctMC4zMS0xMC41Ni0zMS43Mi02NC0xNTAuODctNDMuMDItMTk5LjYtODcuMjUyeiIvPgogICAgICA8cGF0aCBpZD0icGF0aDMzNjIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NTkpIiBkPSJtMjY4LjY2IDM3Ljc0NWMtMzkuODEgMC4zOTgtOTAuMzkgMjYuMDEyLTk1LjMxIDQwLjY1NiAxLjYyIDM2Ljc1OSAxNzAuNiAyNS45ODkgMTg4LjM4IDg2LjY1OWwwLjI1IDAuMDNjLTUuNTktNTEuMi0zMi44NC05NS45MS03Mi40MS0xMjQuNzUtNi40Ni0xLjg3OC0xMy41NS0yLjY2OC0yMC45MS0yLjU5NXoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzMzcyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjYxKSIgZD0ibTE4NC42IDYuMTgyNmMtOC45NSAwLTE3Ljc3IDAuNjYyNC0yNi4zNyAxLjkzNzUtMjYuNTUgMjguNzM1LTEyLjM4IDU0LjU0OSAxLjg3IDYyLjQzOCAxMi4xNyA4LjY2MyA0My41NS00NS41ODEgMTIyLjIyLTM1LjIxOS0yOC4wOC0xOC40MjYtNjEuNjUtMjkuMTU2LTk3LjcyLTI5LjE1NnoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzMzgyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjYzKSIgZD0ibTE1MC41MSA5LjQzMjZjLTM0Ljk2IDYuNzY4NC02Ni4yODUgMjMuNzU3LTkwLjc1MiA0Ny43MThsMC40MzggMC43ODJjMjUuNzM3IDExLjcxOSA0Ny43NTQgMzAuOTI5IDcwLjQzNCA0OC43NDdsMjcuMDctMjUuMjc5Yy0xNy42NC0xNy43ODQtMzEuMjQtMzcuMjAyLTcuMTktNzEuOTY4eiIvPgogICAgICA8cGF0aCBpZD0icGF0aDMzOTIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NjUpIiBkPSJtNTQuNjY1IDYyLjM3Yy0yNS4yMTMgMjYuNzg0LTQyLjI4IDYxLjM0LTQ3LjEyNSA5OS42OSAxOC45NjctMzEuNzIgNDcuMjYxLTQzLjI0IDkzLTE5LjI1bDIzLjQ3LTI5LjVjLTE1LjMzLTEzLjgyOS00Ny42NDItMzcuNzAyLTY5LjM0NS01MC45NHoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzNDAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjY3KSIgZD0ibTEyOS40MSAxMTkuMzFsLTIzLjQ2IDI4LjljNTcuMTkgNDEuOSAzMi44NiAxODcuNjMgOTYuMjggMjE0IDQ0Ljg3LTQuNDEgODQuODktMjUuNDcgMTEzLjc4LTU2LjktNTcuODMtNjkuNDctMTE3LjY0LTEzNS42LTE4Ni42LTE4NnoiLz4KICAgICAgPHBhdGggaWQ9InBhdGgzNDEyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQyNjY5KSIgZD0ibTEwMy4yNiAxNTguNjhjLTEuNjMgMC4wMy0zLjMzMyAwLjM2LTUuMTI3IDAuOTctMjMuMjU3IDE4LjI1LTY1LjgwMSAxMDYuMDctNDAuOTM3IDE0OS44NSAwLjAwNSAwLTAuMDA1IDAuMDIgMCAwLjAzIDMyLjM5MiAzMy4wMyA3Ny41MjQgNTMuNTMgMTI3LjQgNTMuNTMgMS4zNyAwIDIuNzMgMCA0LjEtMC4wMy01My43NC0zOC44NC00Mi4wNC0xOTMuNjgtODUuNDQtMjA0LjM1eiIvPgogICAgICA8cGF0aCBpZD0icGF0aDM0MjIiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDI2NzEpIiBkPSJtNjAuMzIxIDEzNi4xNWMtMTkuNTM2IDAuNjItNDIuMzM1IDEwLjg2LTUzLjA2MyAzMy4xM2wtMC41NjIyIDEuMzRjLTAuMzU5NCA0LjYyLTAuNTYyNSA5LjI5LTAuNTYyNSAxNCAwIDQ0LjE1IDE2LjA2OCA4NC41NSA0Mi42NTcgMTE1LjcyLTI0LjYwOS03Ny4yNSA1MC4yNjYtMTQ1LjE3IDQyLjEyNS0xNTIuNzItNS4zODItNy44LTE3LjIyNy0xMS44OS0zMC41OTQtMTEuNDd6Ii8+CiAgICA8L2c+CiAgPC9nPgogIDxtZXRhZGF0YT4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yaz4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIi8+CiAgICAgICAgPGNjOmxpY2Vuc2UgcmRmOnJlc291cmNlPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9wdWJsaWNkb21haW4vIi8+CiAgICAgICAgPGRjOnB1Ymxpc2hlcj4KICAgICAgICAgIDxjYzpBZ2VudCByZGY6YWJvdXQ9Imh0dHA6Ly9vcGVuY2xpcGFydC5vcmcvIj4KICAgICAgICAgICAgPGRjOnRpdGxlPk9wZW5jbGlwYXJ0PC9kYzp0aXRsZT4KICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgPC9kYzpwdWJsaXNoZXI+CiAgICAgICAgPGRjOnRpdGxlPlBhbGxvbmUgYmFza2V0PC9kYzp0aXRsZT4KICAgICAgICA8ZGM6ZGF0ZT4yMDEwLTAzLTEzVDIwOjI1OjQ1PC9kYzpkYXRlPgogICAgICAgIDxkYzpkZXNjcmlwdGlvbj5CYWtldGJhbGw8L2RjOmRlc2NyaXB0aW9uPgogICAgICAgIDxkYzpzb3VyY2U+aHR0cDovL29wZW5jbGlwYXJ0Lm9yZy9kZXRhaWwvMzE0NTMvcGFsbG9uZS1iYXNrZXQtYnktcGVycGFvbGE8L2RjOnNvdXJjZT4KICAgICAgICA8ZGM6Y3JlYXRvcj4KICAgICAgICAgIDxjYzpBZ2VudD4KICAgICAgICAgICAgPGRjOnRpdGxlPnBlcnBhb2xhPC9kYzp0aXRsZT4KICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgPC9kYzpjcmVhdG9yPgogICAgICAgIDxkYzpzdWJqZWN0PgogICAgICAgICAgPHJkZjpCYWc+CiAgICAgICAgICAgIDxyZGY6bGk+YmFza2V0YmFsbDwvcmRmOmxpPgogICAgICAgICAgICA8cmRmOmxpPmNsaXAgYXJ0PC9yZGY6bGk+CiAgICAgICAgICAgIDxyZGY6bGk+Y2xpcGFydDwvcmRmOmxpPgogICAgICAgICAgICA8cmRmOmxpPmltYWdlPC9yZGY6bGk+CiAgICAgICAgICAgIDxyZGY6bGk+bWVkaWE8L3JkZjpsaT4KICAgICAgICAgICAgPHJkZjpsaT5wdWJsaWMgZG9tYWluPC9yZGY6bGk+CiAgICAgICAgICAgIDxyZGY6bGk+c3BvcnQ8L3JkZjpsaT4KICAgICAgICAgICAgPHJkZjpsaT5zcG9ydHMyMDEwPC9yZGY6bGk+CiAgICAgICAgICAgIDxyZGY6bGk+c3ZnPC9yZGY6bGk+CiAgICAgICAgICA8L3JkZjpCYWc+CiAgICAgICAgPC9kYzpzdWJqZWN0PgogICAgICA8L2NjOldvcms+CiAgICAgIDxjYzpMaWNlbnNlIHJkZjphYm91dD0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvcHVibGljZG9tYWluLyI+CiAgICAgICAgPGNjOnBlcm1pdHMgcmRmOnJlc291cmNlPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyNSZXByb2R1Y3Rpb24iLz4KICAgICAgICA8Y2M6cGVybWl0cyByZGY6cmVzb3VyY2U9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zI0Rpc3RyaWJ1dGlvbiIvPgogICAgICAgIDxjYzpwZXJtaXRzIHJkZjpyZXNvdXJjZT0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjRGVyaXZhdGl2ZVdvcmtzIi8+CiAgICAgIDwvY2M6TGljZW5zZT4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgo8L3N2Zz4K';
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/arcgis/rest/services/Basketball_Layer/FeatureServer',
          id: 'basketballLayerId',
          visible: visibility,
          title: 'Terenuri de baschet',
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

      const basketballLayer = createBasketballLayer(true);
      map.add(basketballLayer);

      locateWidget.current = new Locate({
        view: mapView.current,
      });

      mapView.current.ui.add(locateWidget.current, {
        position: 'top-left',
      });

      const homeWidget = new Home({
        view: mapView.current,
      });
  
      mapView.current.ui.add(homeWidget, 'top-left');

      const legendWidget = new Legend({
        view: mapView.current,
      });
      
      mapView.current.ui.add(legendWidget, 'top-left');

      const searchWidget = new Search({
        view: mapView.current,
        includeDefaultSources: false, // Exclude default search sources
        sources: [
          {
            layer: footballLayer,
            searchFields: ['name'], // Replace with the actual field used for football field names
            displayField: 'name', // Replace with the actual field used for football field names
            exactMatch: false,
            outFields: ['*'],
            name: 'Football Fields',
            placeholder: 'Search Football Fields',
          },
          {
            layer: tennisLayer,
            searchFields: ['name'], // Replace with the actual field used for tennis field names
            displayField: 'name', // Replace with the actual field used for tennis field names
            exactMatch: false,
            outFields: ['*'],
            name: 'Tennis Fields',
            placeholder: 'Search Tennis Fields',
          },
          {
            layer: basketballLayer,
            searchFields: ['name'], // Replace with the actual field used for basketball field names
            displayField: 'name', // Replace with the actual field used for basketball field names
            exactMatch: false,
            outFields: ['*'],
            name: 'Basketball Fields',
            placeholder: 'Search Basketball Fields',
          },
        ],
      });

      const handleSearchResults = (event) => {
        const results = event.results;
        if (results.length > 0) {
          // Handle the search results here
          console.log('Search Results:', results);
        }
      };

      searchWidget.on('search-complete', handleSearchResults);
  
      mapView.current.ui.add(searchWidget, 'top-right');

      const directionsWidget = new Directions({
        layer: routeLayer,
        view: mapView.current
      });

      mapView.current.ui.add(directionsWidget, 'bottom-right');

      // await mapView.current.when();

      // mapView.current.on('error', (error) => console.error('MapView error:', error));

      // await mapView.current.when();
      // console.log('ArcGIS map loaded');
      // mapLoaded.current = true;

      // const drawPolygon = () => {
      //   // Coordinates for a sample polygon around Bucharest (you can modify these coordinates)
      //   const polygonCoordinates = [
      //     [25.97, 44.53], // Top-West
      //     [26.02, 44.36], // Bottom-West
      //     [26.22, 44.31], // Bottom-East
      //     [26.35, 44.44], // Middle-East
      //     [25.97, 44.53]  // Closing the polygon (back to Top-West)
      //   ];
      
      //   // Create a polygon geometry using the coordinates
      //   const polygonGeometry = {
      //     type: 'polygon',
      //     rings: [polygonCoordinates],
      //   };
      
      //   // Symbol for the polygon
      //   const fillSymbol = {
      //     type: 'simple-fill',
      //     color: [227, 139, 79, 0.35], // Change the color and transparency as desired
      //     outline: {
      //       color: [255, 255, 255],
      //       width: 1,
      //     },
      //   };
      
      //   // Create a graphic with the polygon geometry and symbol
      //   const polygonGraphic = new Graphic({
      //     geometry: polygonGeometry,
      //     symbol: fillSymbol,
      //   });
      
      //   // Add the graphic to the map view
      //   mapView.current.graphics.add(polygonGraphic);
      // };
      
      // // Call the drawPolygon function from within the initializeMap function
      // drawPolygon();

    } catch (error) {
      console.error('EsriLoader: ', error);
    }
  };


  useEffect(() => {
    initializeMap();
    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src = '//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js';
    script.id = 'openweathermap-widget-script';

    // Define your widget parameters
    window.myWidgetParam ??= [];
    window.myWidgetParam.push({
      id: 15,
      cityid: '683506',
      appid: '0e88a740c6b5c26a8108ae0ba679ff15',
      units: 'metric',
      containerid: 'openweathermap-widget-15',
    });

    // Append the script to the document body
    document.body.appendChild(script);

    // Clean up the script when the component is unmounted
    return () => {
      const existingScript = document.getElementById('openweathermap-widget-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    // Update layer visibility when footballLayerVisible changes
    if (mapView.current && mapView.current.map) {
      const footballLayer = mapView.current.map.findLayerById('footballLayerId');
      const tennisLayer = mapView.current.map.findLayerById('tennisLayerId');
      const basketballLayer = mapView.current.map.findLayerById('basketballLayerId');
      if (footballLayer) {
        footballLayer.visible = !footballLayerVisible;
      }
      if (tennisLayer) {
        tennisLayer.visible = !tennisLayerVisible;
      }
      if (basketballLayer) {
        basketballLayer.visible = !basketballLayerVisible;
      }
    }
  }, [footballLayerVisible, tennisLayerVisible, basketballLayerVisible]);


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '50px' }}>
      <div
        ref={mapViewNode}
        className="map-container"
        style={{ position: 'absolute', top: '50px', width: '100%', height: 'calc(100% - 50px)' }}
      ></div>
      <div
        id="openweathermap-widget-15"
        style={{
          position: 'absolute',
          top: '50px',
          right: '350px',
          padding: '10px',
        }}
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
        <Button variant="contained" style={{ fontSize: '16px', padding: '15px' }} onClick={toggleFootballLayerVisibility}>
          {!footballLayerVisible ? 'Hide Football Layer' : 'Show Football Layer'}
        </Button>
        <Button variant="contained" style={{ fontSize: '16px', padding: '15px' }} onClick={toggleTennisLayerVisibility}>
          {!tennisLayerVisible ? 'Hide Tennis Layer' : 'Show Tennis Layer'}
        </Button>
        <Button variant="contained" style={{ fontSize: '16px', padding: '15px' }} onClick={toggleBasketballLayerVisibility}>
          {!basketballLayerVisible ? 'Hide Basketball Layer' : 'Show Basketball Layer'}
        </Button>
      </div>
    </div>
  );
};

export default EsriMapComponent;