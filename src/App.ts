import * as THREE from 'three';
import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as Stats from "stats.js";

export class App {
  isDebug: boolean
  static stats: Stats;
  static container: HTMLElement;
  static scene: Scene;
  static camera: PerspectiveCamera;
  static controls: OrbitControls;
  static width = 1000;
  static height = 1000;
  static renderer: WebGLRenderer;

  constructor() {

  }

  static createRender() {
    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;

    App.renderer = renderer;

    App.container.appendChild(renderer.domElement);
  }

  static createStats() {
    App.stats = new Stats();
    App.stats.showPanel(0);

    document.body.appendChild(App.stats.dom);
  }
}
