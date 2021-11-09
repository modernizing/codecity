import {Camera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as Stats from "stats.js";

class CodecityApp {
  scene: Scene
  camera: Camera
  controls: OrbitControls
  renderer: WebGLRenderer
  isDebug: boolean
  stats: Stats

  constructor() {

  }
}
