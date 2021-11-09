import {Camera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

class CodecityApp {
  scene: Scene
  camera: Camera
  controls: OrbitControls
  renderer: WebGLRenderer
}
