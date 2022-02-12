import * as THREE from 'three';
import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as Stats from "stats.js";
import {Font} from "three/examples/jsm/loaders/FontLoader";

export class App {
  static isDebug: boolean = false;
  static stats: Stats;
  static container: HTMLElement;
  static scene: Scene;
  static camera: PerspectiveCamera;
  static controls: OrbitControls;
  // x
  static height = 600;
  // z
  static width = 1800;
  // y
  static depth = 1000;

  static renderer: WebGLRenderer;
  static font: Font;
  static config = {
    fontSize: 10
  }

  constructor() {
  }

  static createRender() {
    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType( 'local' );
    renderer.xr.addEventListener( 'sessionstart', function ( event ) {
      App.controls.enabled = false;
    } );

    renderer.xr.addEventListener( 'sessionend', function ( event ) {
      App.controls.enabled = true;
    } );

    App.renderer = renderer;

    App.container.appendChild(renderer.domElement);
  }

  static createStats() {
    App.stats = new Stats();
    App.stats.showPanel(0);

    document.body.appendChild(App.stats.dom);
  }

  static createControls() {
    App.controls = new OrbitControls(App.camera, App.container);
    App.controls.enableDamping = true;
    App.controls.dampingFactor = 0.25;
    App.controls.enableZoom = true;
    App.controls.target.set(0, 0, 0);
    App.controls.update();
  }

  static debugPoint(x, y, z) {
    const geometry = new THREE.SphereGeometry( 15, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    App.scene.add( sphere );
  }
}
