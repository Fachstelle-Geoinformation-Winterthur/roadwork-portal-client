import { Component, Input, OnInit } from '@angular/core';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import Tile from 'ol/layer/Tile';
import View from 'ol/View';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { Extent } from 'ol/extent';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { MatSnackBar } from '@angular/material/snack-bar';
import { register } from 'ol/proj/proj4';
import { RoadWorkNeedService } from 'src/services/roadwork-need.service';
import proj4 from 'proj4';
import { RoadWorkNeedFeature } from 'src/model/road-work-need-feature';

@Component({
  selector: 'app-edit-need-map',
  templateUrl: './edit-need-map.component.html',
  styleUrls: ['./edit-need-map.component.css']
})
export class EditNeedMapComponent implements OnInit {

  @Input()
  roadWorkNeedFeat?: RoadWorkNeedFeature;

  isInEditingMode: boolean = false;

  map: Map = new Map();

  userDrawSource: VectorSource = new VectorSource();
  loadSource: VectorSource = new VectorSource();
  polygonDraw?: Draw;

  private roadWorkNeedService: RoadWorkNeedService;
  private snackBar: MatSnackBar;

  public constructor(snackBar: MatSnackBar,
    roadWorkNeedService: RoadWorkNeedService) {
    this.roadWorkNeedService = roadWorkNeedService;
    this.snackBar = snackBar;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");
    register(proj4);
    this.initializeMap();
  }


  initializeMap() {

    let loadLayerStyle: Style = new Style({
      fill: new Fill({
        color: 'rgba(255, 145, 19,0.4)'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 145, 19,1.0)'
      })
    });

    this.loadSource = new VectorSource({ wrapX: false });
    let loadLayer = new VectorLayer({
      source: this.loadSource,
      style: loadLayerStyle
    });

    let userDrawLayerStyle: Style = new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0,0.4)'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0,1.0)'
      })
    });

    this.userDrawSource = new VectorSource({ wrapX: false });
    let userDrawLayer = new VectorLayer({
      source: this.userDrawSource,
      style: userDrawLayerStyle
    });

    this.map = new Map({
      target: 'edit_project_map',
      layers: [
        new Tile({
          source: new TileWMS({
            url: 'http://wms.zh.ch/upwms',
            params: { 'LAYERS': 'upwms', 'TILED': true },
            serverType: 'geoserver',
          })
        }),
        new Tile({
          source: new TileWMS({
            url: 'http://wms.zh.ch/OGDCMS3ZH',
            params: { 'LAYERS': 'OGDCMS3ZH', 'TILED': true },
            serverType: 'geoserver',
          })
        }),
        loadLayer,
        userDrawLayer
      ],
      view: new View({
        center: [972000.5, 6023000.72],
        zoom: 14
      })
    });

    this.polygonDraw = new Draw({
      source: this.userDrawSource,
      type: "Polygon",
    });

    this.userDrawSource.on('addfeature', (event) => {
      if (this.userDrawSource.getState() === 'ready') {
        this.sendGeometry();
        this.userDrawSource.clear();
        // this.endEditing();
      }
    });

    this.loadGeometry(true);

  }

  loadGeometry(refreshExtent: boolean) {
    if(this.roadWorkNeedFeat !== undefined)
    {
      let needPoly: Polygon = this.roadWorkNeedFeat.geometry.clone();
      needPoly.transform("EPSG:2056", 'EPSG:3857');

      let testFeature: Feature = new Feature({
        type: "Feature",
        name: "testFeature",
        id: 231243,
        geometry: needPoly
      });

      this.loadSource.clear();
      this.loadSource.addFeature(testFeature);
      this.loadSource.changed();

      if (refreshExtent) {
        let polyExtent: Extent = needPoly.getExtent();
        this.setViewToPolyExtent(polyExtent);
      }
    }
  }

  sendGeometry() {
    if(this.roadWorkNeedFeat != undefined){

      let features = this.userDrawSource.getFeatures();
      let feature1 = features[0];
      let geom1: Polygon = feature1.getGeometry() as Polygon;
      let geom2: Polygon = geom1.clone();
      geom2.transform('EPSG:3857', "EPSG:2056");
      this.roadWorkNeedService
        .updateRoadWorkNeed(this.roadWorkNeedFeat)
        .subscribe({
          next: (success) => {
            this.snackBar.open("Baustellengeometrie ist gespeichert", "", {
              duration: 4000,
            });
            if(this.roadWorkNeedFeat)
                this.roadWorkNeedFeat.geometry = geom2;
            this.loadGeometry(false);
          },
          error: (error) => {
            this.snackBar.open("Baustellengeometrie konnte NICHT gespeichert werden", "", {
              duration: 4000,
            });
          }
        });
    }
  }

  startEditing(){
    if(this.polygonDraw !== undefined){
      this.map.addInteraction(this.polygonDraw);
      this.isInEditingMode = true;
    }
  }

  endEditing(){
    if(this.polygonDraw !== undefined){
      this.map.removeInteraction(this.polygonDraw);
      this.isInEditingMode = false;
    }
  }

  showEditHelp(){
    alert("Klicken Sie in die Karte, um mit dem Zeichnen der Projektfl??che zu beginnen. "+
    "Mit einem Doppelklick beenden Sie den Zeichenvorgang und schliessen die Fl??che damit ab. "+
    "Der Doppelklick zum Abschliessen erfolgt dabei nicht auf den Startpunkt der Fl??che.");
  }

  private setViewToPolyExtent(polyExtent: Extent) {
    // extent: [minx, miny, maxx, maxy]
    let extentCenterX: number = polyExtent[0] + ((polyExtent[2] - polyExtent[0]) / 2.0);
    let extentCenterY: number = polyExtent[1] + ((polyExtent[3] - polyExtent[1]) / 2.0);
    var extentCenter: Point = new Point([extentCenterX, extentCenterY]);

    let view = new View({
      center: extentCenter.getCoordinates(),
      zoom: 15
    });
    view.fit(polyExtent);

    this.map.setView(view);
  }

  refresh(){
    this.map.getLayers().changed();
  }

}
