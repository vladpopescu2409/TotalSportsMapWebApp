import React, { useEffect, useRef, useState } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Locate from '@arcgis/core/widgets/Locate';
import Home from '@arcgis/core/widgets/Home';
import Search from '@arcgis/core/widgets/Search';
import Legend from '@arcgis/core/widgets/Legend';
import Config from '@arcgis/core/config';
import PopupTemplate from '@arcgis/core/PopupTemplate';
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


      const map = new WebMap({
        basemap: 'arcgis/navigation',
      });
      
      const createFootballLayer = (visibility) => {
        const url_ball = 'data:image/png;base64,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';;
    
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/ArcGIS/rest/services/Baze_Sportive/FeatureServer',
          id: 'footballLayerId',
          visible: visibility,
          outFields: ['*'],
          popupTemplate: popupFootballFields,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              url: url_ball,
              width: '15px',
              height: '15px',
            },
          },
        });
      }

      const footballLayer = createFootballLayer(true);
      map.add(footballLayer);

      const createTennisLayer = (visibility) => {
        const url_ball = 'data:image/jpeg;base64,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'
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/arcgis/rest/services/Tenis_Layer/FeatureServer',
          id: 'tennisLayerId',
          visible: visibility,
          outFields: ['*'],
          popupTemplate: popupFootballFields,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              url: url_ball,
              width: '15px',
              height: '15px',
            },
          },
        });
      }

      const tennisLayer = createTennisLayer(true);
      map.add(tennisLayer);

      const createBasketballLayer = (visibility) => {
        const url_ball = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFRUXFRgYGBgYGBcaGhgWGBoXGhgXGBgaHSggGBslHRUXITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy8lICYtLS0vLS8tLS0tLS0vLS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAAABwEBAAAAAAAAAAAAAAAAAQIDBAUGBwj/xABDEAABAgMFBAgDBwMCBQUAAAABAAIDESEEEjFBUQUGYXETIjKBkaGx8BTB0QdCUmJy4fEjgpKywkNTc6LSFiQzNGP/xAAaAQADAAMBAAAAAAAAAAAAAAAABAUBAgMG/8QANBEAAQIDBAgGAQQDAQAAAAAAAQACAwQREiExQQVRYXGBkaHwEyKxwdHhMhQjM/EVJFJC/9oADAMBAAIRAxEAPwDuKhRcSh0h1UhjAQCQhCKz4d6Tasu9FFMjIURwKznVCEiz9pSImB5FNxWgCYom2PJIE0ITanBJ6MaBRjEOqEIRu0U7ZsO/6JTGAgEhNxnXcKCUzkEISrTkm7P2lXR9uwGYvvnIM63nh5qttG9n/Lhd7jXwA+aViTsBlxcOFT6BNw5GYfeGnjd60WriYHkoaycTemOaC4OTZ+pKjO3gtH/Ml/ZDp/2pY6WgDAOPAe5CZboiOc2jifYFdDbgokbtFYf/ANR2kf8AFNPyw/8AxSXb5WiFNz2MigDDsOOnWkR5LLNKwXOoQRtNKdCVl2h44FQWnYCa9QF0CzYHmitWA5rmmy/tissaI2E2BHhucZC9cDS78MwTXu4LYWPeezv7TnM/WKeImPFOOmITHWHOAO1Isloz2W2NJGy/pj0VtA7Q95KU/AqOyMxzL7HNcMnNII8QktiHVdhfeuGxIU1mA5IujGgUZ0QzxQhHG7RTllwKOG0ETNSkxqYUQhKtOHemYPaCXCMzWqW9gAmBIoQnSoKWIh1UnoxoEIUNBTOjGgRIQk9AOKQ6IRQZI/iOHmh0M6zxQhGxt6pRP6mGaF+5TFDt8JIQiY+9QpZhAV0qk3LtcUOmnSWNEISfiDwRWgw2NL3uutGJJkFVbW2wyDNrevE0wA/UfljyWS21H+LkI8ntGDKhgPFs+t3zSEzpCHCNkXnZlv8AhPy2j4kUBxub1O755VU/a32j2ZhuQ4jP1OMyP7BXx8FnYm9kKOZvtIdzJA7gZAJp+7lkIrZoPdDYPCQxVfatyrOZ9GHQjq11BwkZjwUp8zDj/wAzncKU5f2dqrtl3Qf4WtrtrXn9AK/hPa4TaQQcDMU5pfsrDRtiWmz9aGekH5Tdf4Tr3HuVnsvet07sUF2AM6PAzGUu/XFZ/QeIKwHh2zA8vmi1M+YZpHYWnXiOYWkll4e8Ek+WfvBSLIYccf0XTdkwyBHP2U3aIRb2gRzGfABIvhuYaOFE9CjMiCrTVNH0x5eirtpRAGu4DglW23tYJuMudfJYvbG23RupDJDcCdeXui6y8u+M6jQto0wyXZaiHhmsy6kRz25RHOb3OLhLwC7AcATpPxWF3e2F0jg5wlDYQTh1iJEMHz4c1un/ALmh8wndKvbabDGLRf0oOnVT9Dw32XxHXBxu61O6+g3I7PanwyCxzmHgZeOver/Zm+L2yEZl4fibJrhzbgfJZszxrXDFIcPL3mEjBjxIJqw09OWCqR5aFHFIja7c+ePsuq2DarIzb0J7XDPUcxiO9TRBBrquNwI74bmuY4tcMwZHkdRwW43f3ybEuw44DHmjXYNdwP4DzoeGCuS2kGxPK+49D8HYV52c0U+ELUPzDqPnhyotS55bQYJTBexyRGFerghO5TGaoqSje27UcklsQuoc0L1+mGaPortZzkhCV0A4pv4g8Er4jgh8Px8kISfiDwQSvh+PkghCR0BTjYgAkck50g1Hio8RpJMghCU9t4zCOH1cc0qEZCtOaTGrKVeSEI3uDhIYrMba27KcOEazk54y4NOvFDeDaxE4MMyP33aatB11KzjR4HyUWfnyCYUI7z7D3PAK1ISFwixRuHufYcShd8fWfzSmt8D66BLa0947qfVOtYOAnhXsqNRVy5NXc9KH6BH0ZwlXEDQcU+1goeppKv8AmUDBFR1DI69rgFmi1tKK6GDrI8Kkqq2psWHFq4ScKXhQt/u+RmFfPhyBMwCOuCHUA0HFUO2dsQ4QMzQ4CdZ8eKy0uDgW45UxWzfMCDhnWlFm40GLZjeneYPvjFvMZcxTkre0b1PfZ7pk9zZXXGjgM+Bp7Ko41pjRzUljNPvEfL15JyBs03f6bZgDWQMsgcz7Ml6FrS6D/t0G3A/3uxz1qDELGzA/RVJxpiOH3dqOSpI7HxHTiOnM0A45cVebL3bLpOiAtb+Edo88mjz5JzYm1GNMyxpPZIIkRqBOrT7M1rurEbfhTcC66MAWkgUInQ171ynosWXaGwgA3WO7t9+9dJFkKYiF0Yku1HD72i6mpQ2Q2tADRJrcAJCRRO5iZzmlPEjIyBHmU2X/ALiWCgL0zRqROOdOAr4hNPI15mvgVF2htNkMEl0hlMgLK7Q3he+YhtMtXTqeWPomYErEinyhcI83CgDznhnyxWntNva2czwlX3JUls3mhNpeGiysYRIhk4ueXYNrXk0Y+asLLuhGfVwbCbnene/xHzIVL9DBhCsZ9O+fRS/8nHjkiXhk7e7uq6P9nv2nsMRlljvmxxDYbzObHGga4nFhw4csOuxBewyXmobjQh2osSf5Q1oHjP1XYN1d8mBsOBaCQ661vSmUnESALx90mkzhPRNQJuAPI1x2V+UjMyMyf3HMFc6Ec6fHJbWG27Uo3RARIYlHGMxStck1CaQQSJJ9S0YgFO9OEovGoUXozoUIUjpwgo/RnQoIQkqZCwHJKkokXEoQlWnHuVRtzavQsut7b8Pytzd8h+ytnx2shue7BsyVz222t0WI6I7Fxw0GQHJT9ITXgsst/I9Br9gqOjpXxn23fi3qdXueAzTQHjkfqnGDPLMcOajxI7Wippppy7vVVtr3lhtMm1M+cwMKBedYwuNGiu5eidcLRuGs3LRwYepFOtPGZyYprYFDMynV4kBLQCeSwbtv2h87vVBM8ZV1kAki86sWO7uMh89U/C0dHd/5pvPtipsacgNxfyBPU0C3ka1wGE34rcPy9jkPvKqtW9VnbMQ2uiOlIXRPPQYBZ6DZ4H4ekP8Ac/6qyhwIjpCHBuzGchpgBM5Z8dUwZJjP5YgG7H56JYTBeP24bnbTcOgp1VbtDatqi0AEJn5sa8MSa5lU8GwzfPrRH+MuQwbz81sYe7T3TMV2GXZGooDM04qws+z2tADG3XicmgSFPvmax+pgQP4GVOs916Bb+HGj3RngN/5b7kVHGrlnrFsQyvRMvu5T0JzPD1Vm+EJSApITApIaKY5wmSJNLZCWN4kVPvVRntmKTvS606Ump0aM+MavNfbd3vVKXhMhCjBQd4lZrbex7/8AUZJrxQVo4DJ0vI4jlRVmzNpPhPwk4Uc13o7hWYI1otZGiCpoMQAKrKbxxYVDOUQdmQqc7hAqR6YpyRmiP2Xi005Y0+tmWIvXGfkw9pjsNl4vrhXjhXbng67DQvtrCy+09UY0kQ7GR14HMLMbR28XEthCZzM6cqeihE32gGYpUTPgZYhT9n7ILh1ZBtATkNBIY+QTf+PgwSXxHeXu7WeCTGlI8Zohw2+c4nvDjgqN9nc4gvJc4mgkSZ6NaP5VzYd2nEjpSGDSYvd+TfPuWisdhhwqtAnm5xmXfQcAludlPHGQwS8bSTiLEEWRrz+B67U3LaJbW3MG07VlxzPpsUayWSFCH9NobOmZJ4lxqUb3cpDhilvcdTPKmKQ7mZY96nXk2jiq1A0BouATTvXHlomHiff6ck44+J7pS9+aQ7+OWa6Bcyug/Z5vFf8A/bxT12tPRuP3mD7nFzZd45LdRuyVwGHHcxzXsddc0gtIyIzXZN2trNtUJkZsgTMPbOd147TfQjgQrkjMF7bDsR6fS83pOV8N3iNwOOw/fqpwU9EQoM0+panoKBNBCEvpTqn2MBAJCT8OOKQ+PdnhIZ8BiUIWa312gABBBkO0/wD2j59wXN9tbyNhza3rO08fBNb87zExH3T1nknk3AeUgOSrdhbqPiARI5c1prd++7i4/dxwx5KC5jIrjMRjRp/EZkD2zO3ML0bXPgMEtAFXgeYnBpOvWdWwZqBEtsaO6RLjP7rZmndWSvNmbtxjKbQyk61PgKea1NiscOEA1jWsEzh68TxU6FOQMjQ3TOnISWrtIlvlgNDRzPx671r+gtm1HcXnfQcM+VBsVVYd1wbt6ISD3Af41Hir2xbsQhi0XhLETpWVT7xT1nfVzJzmbzQz8cpjwJkpjYpkHyALaOvVccfRLmO+J+biePtgsFgh/wAYA4X7Lzfs3p2Bs+GGzDBlMOEpSHJSeq0dUGWjZYyTBjtBvAFwNPy3jwRPiyJa5wAE5SBnMj9zRZBDRQd/2uDg5xqalJjjAG4wtF9xzJ04g/JQY031Af0hnKsgGfSikvJPUlJ1Huc8zJGnHkq+12m9NxcS+ZDQMh/I4YLi8996tyagtNe+6HHHABMRnDgwslhiTr8+9VdstIA61HZk5DFMbW2s2G2RIbdzGJOvNY612yJaXZhp1xI/2jz5LeXlXx3eXDWm4sxDlW2n45DPvepe1tuue4th5UmMB9eQ8lW2ewEmZm5x7yeAGXvmrjZexSaNA6omSaNaKY6muA8leWeysYOpMvIkTmR8hwVV8SDItstFX946twvUpjI+kXWnGywd3a95uVBaNivEMkGT/utpLk52p1FBxVbs/aTobrwEyOq5jqTkag6OFZH5FbGNIgmQEqV1WX3h2dImLDqQOuAO2Nf1DzFNFwlp4xXFke8O6fXob9aamtHCE0RJa5zeNfv1F2paGz2prmhzXTaatkM9CMiDSSER3EzONFj9jbW6Nwmf6bpEyyMqPHlPUcQtHbLWGiZdU4aEZEapWZlXQIlnI4HvMYFPSc42YhW8xiNvwcQn3xBxkOzzUeJaG4EmX3uay+094A03QSTkBjzOipY214zpyk0eJ+i7QpCI8VwXCPpODDNK13LfG1NM+twrpqkl08JaU4Ln42vHb94Hm0fJT7FvLWURt3iKjvGI7pro/R8VouvXKHpWBEurTf8AN/Va538ctVpvs42uYNp6EnqRqDhFHZPeJt72rHwLUHAEEEHAjCXApwPIIc0yIM2nQioPMUXCE8wnh2pMxobYzCw591XfxFOqk9GNFXbEtbbRAhx2/fbM8HCjh3OBHcpXxB4L0QIIqF5IgtJBxCf6MaIkz8QeCCysJfxHBZ7fraIgWKLEniLo/ux/7Q5XvQOWM+1CB0sOzQZyb0pe/wDTDbh3lwHeuMw6zCcSaJiUaTHbQVvryv5a1zvdjZF4/Exu0TNgOX5j8uU1rAef8FN3qUIw+iO8M3ZkU96ry0aMYrrR4DUMhwXq4MAQm2RfmTmTmeKeBInKQqD+3zTzHAkirp4Twmc/FRGGcqGolXVO3851HVkNM1yWxaprYxkDO6WmQAE+ZmpcOLdIc0Ud1amfXzMiqyFEkbzBKfVnPzl7wTjXtmW9qVG/dMz71ktw5LuhA9956zrVkIwBLC4uAwDJ1J94IF57Mgwt6xJ7RJw/k6KD0rrsibvR11rzH7zmmo1pbIOq4ir9O8YD9itrXfe1c/Br3n6XjqVItNoDm4lzzV0smD5SzOZWX3i3hDRMmRFGtHoom828t2cndZ2DRKf7LM7OsT4z778ctANB9f2CclJJ0c2nXN9VzmZpkoLIvfkNVdfsOCchQolofedzA04nU+i1+ydgAMvuN0ZS7Tz+Uafm8NVabI2IyC0OiNBdIEQzp+J+grRueaPaFuL3F9GymAB74puanWwW+FA56t23bySMrJxJqJ4sb+9XDcmYzwZBrQy7KmU+GqiPik1nN2gQNaAEnEzTb3mrpgSpJRcV6VrQ0UHf0gTWYGGM9VEtUSlSBMz5I7RGAEySRi7H3/Cyu2dtyJlnQAYn6Diu8GC6IaBco8dkJtXGii7agCG8vYRdc4zH4XHMcHeR50rrTa4rmiHfNwYagfhB/D51THWiOvO4y0HL6p61sdDIDmuaSJiYkSDSY816SHDoxrIhBOXewdKLyUaNaiPiQQQDj3lU5a6otm7JiRXXIbZ6nAN4uOXqtVZt2YEMf1ZxX5ioYOQFT3nuTuwtpB8JrWgMkLrgML2o54qW52IGlZ5yUmam4z3lv4gZDHifYK3JyEuxgf8AkTfU4cB837lEiWCBgLPCAH5G1lxkqfaO7MF9Yc4bsgJlvga+BV8T/iMk2T54cEvDiPYatJCbiwocQUe0HvI4hYQdPY31HVJ5sfLQ5HzWp2Zb2xW3mngQcWmtD9VNtEJr2lrgC2VQc+KyVusL7JEEWHVmc8gcWu4HIp0ObM3G5+vI/an2Hyl7fNDzGbdo1jsrvn2WbQ/oxIJ+48Ob+l9P9TT/AJLb/DcVyD7JNph9oF3sxYbxLRzSHSPEXSO+a7F0zU9JkmEAcRUclM0g0COXDBwBHEdlI+G4oJfTNQTSSSr41CxO+8c9Ixgwa0uPNx+jfNapYTel07VEnlcHdcYfUlTdKvpAprIHqfYKpoeGHTFTkCfQe6rBPQe5j5pTXnQCgP8AimZjU/vT5zRzHE/+OfmvOr1FE6XYidcRLUpQfLrASy4z1TYBykJdYckV4Z1BqeaFrZTwcBNprSmVTyTt8ylQXO+p4qO2cpYXa6zSHRgJOxzd8kLWzVSYkdok8AmVXZieVMFk95t47k2tM3OrdH1yHFM70bxdGC1pm51ZD5lZXZ1mdEdedVx9yAVSRkfF87/x9VMnp4S/kh3v50+1N2VYHxX3nTc4nQ10AHyzXT9ibPZZmCK5t94rdHZh6TP4s1D2DYmWUB7pOiEGbRgyeAnqeCXaLQ7Bx6pJMhlPFbzk+CPDg4a/jZ67sV5PRrnHxI2d/wA8U7b7Y95Ly6V44BRJzM2jDX3Uopym5o4fxmmnVlIkk1ICkq+1oAoEHupO9U5BIe4CrRgM9Uu9i4ACQkqvbFouN7VTiFu1tTRDnWRVUW8m17okDMnLjkOWpWbsdmfFeJAve4gSAmSdANMfc03Gi9LELssG8teZx8F03YOy22KA2IQBaIgMziYcMijQMiQZnWgyV8WZODUjzHLvIZ8F5h5fPx7LT5R3Xjkomydgss4ESLJ8XJmTP/J3HAear957CYrS4dtpJaM64t7/AFkriLGJnnXEqNHlXM5cFKEaIYniuN/dw2K3+lhNgmCB5Tz37/RYXYu0BCiAnsO6rhwyceR8iVtWmY/LNY3eaxdHEvS6r/8AVWY78fFXO7tvvwxMzewgEaj7h40p3J+cYIjGx253HvpyU2Qe6C90s/K8e/PHmrdxzOGX7oia8fkgTnxw5pBNPeSQCqkoiMvFE+GHAhwBBFQcCEcsvNLHvksrWij/AGeMdZNqwoeMOJEFzmSGkcwHnwC9C3DofBcU3asofbbJMyLI7HA8su+Ul3lWJKIXtLjjW/fT4ovP6RhCE5rRhQ03Vw4Gqg3DofBBTkE6pyTdC5rvX/8Abiicqt84bF0Dpna+iwe+kKVpLpTvMY7yu/7VM0q2sEHUfYj4VjQppMO2tPq0+ypwTw18K/Moi6Wf8HFN/wBvv3NKBzDdT9QvPL01EfiTOnJKB7g5IJOuAmO9JJGQJBoOaEJTn97h5gLObzbwCG0yNXZDFPbxbaEJhmagSEs1ziLFdFeXuxOA04BUpGSMU2nYKXpGfEu2y38j0UmztdFfedVzjgPIDxXS93dltswD3yMQtMxXqA5UzOZ4Kv3T2J0DRFij+oRRv4Aadzjnor17yBI0aV0np21+1CwzOvYNnrux4aO0cR+7G/I5atp297nIkQgXSZNNZBNB0pkCmpKQHSmQJjUpJyEy7gFLCtozlIl2ZCDnGRcJDgkOcZTEhwSMTNow1W1FiqDiMpnMrH74W7qkChd1RLjOZ8AVqI0WhrU6YLAb0xpxWt0BMuJMh6eaekYdqMKqfpKLYgGm7mp+49hbEtDS+jIYvmk6jsN73S8Cthao95zi7rEnH3RUe5MINguiETLn3QPytH1J8FbvcZHJbT0S3HI1XfPVc9GQRDlw7N1/W7oiiE1mZfNJnoJUzSXETMpup4JLvzHLJLBOkqBtexCLDc3EkTB0cMD4rGbHtphRhOkzcdwrieR+a37qylQarEb1WK5EvjB+P6h9RI+KoyLw6sJ2BUjSLC2zHZi30+vdbEHHVH6qo2FbL8EE4jqu5jA+EirgCss9e5KPaWOLTkn2PD2hwwN6AHhmlAe+CJv070sD3xrRcyuoCn7CdK0QCMRHhnwe1drJXHN14Rda7OP/ANoZ/wAXBx8mrtvQt0VbRv4O3qHpiltm73UW8dUFK6FuiJUVIRfDjUrD/aDCAfCfUTa5k/0kET/yPgtv8QNCs9vvZS+yl4xY4P7uyfWfclJ6HbgOA38k9o2JYmmE53cwQuf3x+L37kgHDUk/PPxTTXHh77uPmja46gYft9F5mi9jVOg6DOYn5hV+1toiG0kkSxloeadtVpDQZk5zlkdVz7eHaRivuDsjGWZ0PqmZSWMZ9Ms0nOTTZeHazy3qu2jbXR33jO6MB8ytfudsKUo8QVoYbc5fjI9PHRVW6uwxGffeP6TT/m7JvLCfgt/EeeAIHin5+ZEMeBD4/G858tal6NlDGd+qjcPn456kbolCcATXVIvSqBMcfkkNOgwxmkl2c8cQo9Feqlk4VmNAheMiRIBIDsS2nNImKSqdPPBbUWKpQMyLuOJmm3Onj2icAie+cyTI6BJe7AEXaLYBYqmLdEoZ0IwAXONsxZ2h/CQ8AJ+c1v7a+ktTjmuZveYjyc3uMubjT1VbRjPMT33coWmX+RrRmfQfa6XsKEWWSCJymL51m5xd8wn4sq1mfeiXEa0BrQSboAlyEsO5NOdQyEgp1q0S45knmaqwGBgDBkAOQojJM/w0SARSVTKqJ5EzMzSC40yosgLQlGTrhpoqvbtj6SC4ATI6zeYE5eo71Y+s0ZFK4TwW7XFpDhkub2B7S04G5Yrdi0yiFk6OFOY/aa2kKo4LB2+H0FpMqBrw4fpNfQyW6sb5ildPDFOTzQSIgwI76USGjXENdCdi0nvnVPNGHIS4JYSQEsD+VPVQLUfZ1Zb9rByYx7zwMro7+v5LqnxB0CxX2YWS6yLFIq5wY08GgE+bgP7VtfhzqrkiyzBB11K83pOJamCNVB7+pQ6c6BBD4c6oJxT0joXaeiFohtex0N+DmlpHAiR9VKvDVRYgqUEA3FANDULjlogGG90NzesxxaeYMvCk+9ILvy+Mvf7rTfaDsy5EbHaCBE6r5ZPaKE/qb/oWLt1pDWE1Pv8AdeXjQDDiFnezovaQJgRYQia/XPqqXebahAutNTQSy58lndlbPdGiNhtpPE4yaMXHXHxPFFaovSRHOOAMhyBqfH0C2m7lg6GFedR8QAnUM+60aHM8TwVUn9JL3fkcO9g9VEsmfmqH8G497T0rqVtAgthQxDYLrGyHHieZMz3onHvrQpu9UEYzoTgUC7U51H0US/Er0VwFAnXurUyPDNJa6tBdIGJTRdQyw1OSJ7hmZ6ELNEVSiZ5kmeCJziZ4NkklxoDTimyZg0nXFbALUlLnQUl+YpBdj97joinX8XBNOdTGs8FkBakqs21Huw3kGcmO8TQeZCx+7cC/aYIlMB4cRwb1j6LQb2RZQj+ZzW00qfkq/chk47nHBsM+Li0el5VYHklXu3/HqVEmfPOw2bj1qegW3iOdMUAOqjuNKnOoRvcNSUieFKqYArDnVKMvFZCiTpMoyTVG3hVbrRBow9UG8MULutaJUtdKALCyAslvpZ5OhvGYLTzEiPU+CuN3o16Cw/llzI6vyTe98GdnJza5h87v+5RNz4n9MjR59AU6TalBsNO+anNFieI/6bXiLvYrThOMGnh75pIHcff1Wk3G2T09qaSOpCk86GR6re8+TSkmML3BoxKpRHiG0vdgO+uG9dF3f2Z0FnhQpVa2bsO043neZI7lb9K3X1Si4aqHdOhXpWtDQAMl45zi5xccTepPTN19UFGunQoLK1RKZCwHJC4NAo0RxmaoQou3bA2PDfCdQObQ/heKtd3GS4HvZfhX4bwQ5hLSMrw01ByOcwvRkETFarnf2t7mvtUPp7O29Ga2TmDGIwVF3V40zB4AJSYlw9wfmPRPSc2YTXQ8jhsP3hyXGtgWERIjGkTaOs7i1uXeSB3raviHgMDP5rPbsQyxsS+17X3gwtcC1zZC9Ig1B6w8ArYnh5+6qZPvL4xGQu9z3uVnRkPwpcHN1/x09Sni/jOuAz5JYOBGuOffmo9/kM/448EReK1J9ORSdFQtJ5z8Zms8sD+6F41kLvA5pouNQABw+iQXA6up4LNFguTrXCdK0zTbncazwyRF85T8BikF2IBkOOKKLBKdc6taUyTMQ0GnDFC9zFM02/AU8FvRa1WU3tjVYzQFx76D/SVY7kQpQ3vnIl8hyaPq4+Cz23o9+O85A3R/bQ+c1rdgQ7tmY3M1MxgTVU4/klWt10+VHlj4k69+qo9vSqsXOMsqlF3oeFErvCmqsg1vOaA9TgEAOfBKlpTJYWaIwO4HxR++KAGlMuKUB7zWq2UHbjJ2eKPyOPz+SotzP+IOLD5H6BaLao/oxf8Apv8A9JxKpd0YNHn8wHgCf9ybhH/Xfvb30SUZv+3Cpqd31WnY3v8Af1XX91tjfDWYNd/8jus/mZSb3CnispuFsK874p46rTKGDm/8XED15LoUI1Ca0fAoPFOeG7Xxy2b0lpWaqfAbljv1cPXcmwp6QWjQKJeOpVNRVOQUG8dSghCX0rtU6yGCJnEpPw41QMaVJYIQie66ZDBHC62NZIwy9XBEephWaELA/afsaQbaobcOrFInh9xzuXZnxGi5xPh5r0FEAiAsc0FrgQQagjMEHELlW+u5brNONABfAxcMXQ+ebmccs9VLnJY1MRvFWtHTgsiC7HLbs36u65O9wHv3ilGJq7w91TAPJC9xA+vyU6isEp0EUpPKvqNEC/XLxkmpz7/fejHLn7yRRYqlT9mhRXq6z1SedZe8UCMvD+UIR3/HQpq2RQxjnn7oLvoPFPtHcD3qk3qjyhhmbzXk0g+t1dITLbw3X2elVyjRPChufqH9daLJWeEYjw3NzpT54ldDsokJDDTTRZPd6zTiF0uyKc3U9JrYwWUlWXJN6QiVeG6vfsJDRcKkMu1+gu9apQHKnmlDnjjRKE+/kjlzkpxVaiIDnwSh5oS96JUssNFhZoiA8Upo07/5Rge/2Sx5rC2oqveOLdgO/NJvia+QKvvs33UdFDbwLYYN6I7Uur0beMpA6eCe2NudFt0Zj4jTDs0MzvGhiu/IDiBKV7Cpxz69s+wQ4cNsNjbrWiQA8yTmTmc1Vlpa3DAdhWp26hu18sQVFnZsQ4riw+alkbMyd5NABsqbiE5ZYYADAAGtEmtFAAKABPPhgCYxREXK45ICLepqqihpAjHVPdC3T1Sfhxqk/EnRCE50LdPVBN/EHRBCEr4gaFJMImuqR0TtE8yIAJE1QhE192h8kTuvhlqiitvGYqjg9Wc6IQg1l2pRmMDSWNEIrgRIVKbbDIMyEIWE3r+z4OnFsgAdiYNA0/8ATyafymnJc4jQHNcWuaWuBkQRIg8RqvRPTN1VLtrd6FahKLDm4CTXiQe3k7McDMJCPJB17Ljqy+lUltIuYLMS8a8/v1XDrvPyx1RXdfVa/be4UeCSYX9Zn5R/UHNmfNpPILKuZIkESIxBEiOBBwKmRIboZo4UVmHFZFFWGvfeKbH8yQAklS70YatF0RexqshtqP0kVxyb1RpTE+M/ALS7XtXRwyRiaN/Uc+MhM9yzNkst94blif0jHxoO9UJFoaHRXYC75+BtUrSby4tgNxN/x88Kq32BZbrAc3dc8AaDyA8Sr4N/mvkmbNCzl/Cky95j6JCK8vcXFU4MMQ2BoyRS96oxr77kd39kqXcVzXZEB4JTW+HvzRjzWh2RuhaY9bnRM1iAinAYnyHFZYxzzRoqtXvZDFp5oNvfpeqAD9ltd1t0CXNi2lsmirYf3nHIv0HDE58dPsPdqz2brDrxPxuqf7Rg3urxVu6GZ4KpLyAHmiX7MuOv0UWb0qXCxBuGvPhq9dyU5l6owRtNzHPRHDeAJGhRRhewqqajIOdfoOdUTYZbU5IQxdMzRLiPBEhihCL4gcUnoDwSBCOikdM3VCE10B4IJ3pm6oIQlzUSKKlIUyFgOSEJFnw70m05JNpx7kqy593zQhJs+KfiGh5JNp7Kjw8RzQhJkpwKNQChCXFFSott2NAtDZRoTX5AmjgODhJw7irKD2QmbTj3fVYIBFCstcWmoxWK2n9nMLGDFez8rhfHjMEd81Tt+zu03pX4UvxXn+lz5rp9mzS4/ZSzpKC7Km4p1mkZhoparvAXB95/sw2iCYjDBjtFAxjnB4b+lzZONATIz4UVTs7dyNCo6DEDvvThvBplIiYAXoWHiOYU5bRJcOYGA0AyWsGbsRDEc204593fVwXAoezIuAhP4SY76KXB3ftTuzZo3fDcB4uAC7K5xmpMDshK/wCNbm4pw6Ydkwc/6XJrHuNa34tawfnePRsyrux/Z2AAY0Yn8sMAf9zp+i3NpxHJCzYldWSEFuIrv+qLg/Skw7Agbh81VXsnYVngEdHCAP4nTc7D8Tpy7pK7caFIjdk+81GbiOaba1rRRookHvc82nGp23opKYw0HJLUF+J5rZapcYdYpyzYFLs/ZCatWIQhLtGHemYIqEuzY9ydjdkoQlkqDJAKehCgSQU9BCFAUyFgOSJBCEzace5Ksufd80EEIS7R2VHh4jmgghCmqAUEEIUuD2QmbTj3fVBBCEqzZpdo7KCCEKMzEcwpyCCEKC7FSoHZCJBCE3acRyQsuJQQQhORuyfeajNxHNBBCFOUF+J5o0EIUmz9kJq1YhBBCELNj3J2N2SgghCiBT0EEIQQQQQhf//Z'
        return new FeatureLayer({
          url: 'https://services6.arcgis.com/3T4q3twraXHKJdR1/arcgis/rest/services/Basketball_Layer/FeatureServer',
          id: 'basketballLayerId',
          visible: visibility,
          outFields: ['*'],
          popupTemplate: popupFootballFields,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              url: url_ball,
              width: '15px',
              height: '15px',
            },
          },
        });
      }

      const basketballLayer = createBasketballLayer(true);
      map.add(basketballLayer);

      mapView.current = new MapView({
        container: mapViewNode.current,
        center: [26.1025, 44.4268],
        zoom: 10,
        map: map,
      });

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

      const searchWidget = new Search({
        view: mapView.current,
      });
  
      mapView.current.ui.add(searchWidget, 'top-right');

      const legendWidget = new Legend({
        view: mapView.current,
      });
      
      mapView.current.ui.add(legendWidget, 'bottom-left');

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
          color: [227, 139, 79, 0.35], // Change the color and transparency as desired
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
    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
      <Button variant="contained" onClick={toggleFootballLayerVisibility}>
        {!footballLayerVisible ? 'Hide Football Layer' : 'Show Football Layer'}
      </Button>
    </div>
    <div style={{ position: 'absolute', top: '10px', left: '240px' }}>
      <Button variant="contained" onClick={toggleTennisLayerVisibility}>
        {!tennisLayerVisible ? 'Hide Tennis Layer' : 'Show Tennis Layer'}
      </Button>
    </div>
    <div style={{ position: 'absolute', top: '10px', left: '440px' }}>
      <Button variant="contained" onClick={toggleBasketballLayerVisibility}>
        {!basketballLayerVisible ? 'Hide Basketball Layer' : 'Show Basketball Layer'}
      </Button>
    </div>
  </div>
  );
};

export default EsriMapComponent;