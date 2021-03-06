import "../style.css"
import * as THREE from 'three';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import {XRHandModelFactory} from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";

import {createCity} from "./City";
import {App} from "./App";

let hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

const tmpVector1 = new THREE.Vector3();
const tmpVector2 = new THREE.Vector3();

let grabbing = false;
const scaling = {
  active: false,
  initialDistance: 0,
  object: null,
  initialScale: 1
};

const spheres = [];

init();
animate();

function createControllers() {
  function onSelectStart() {
    console.log("onSelectStart");
  }

  function onSelectEnd() {
    console.log("onSelectEnd");
  }

  function buildController( data ) {
    let geometry, material;
    switch ( data.targetRayMode ) {
      case 'tracked-pointer':
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

        material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
        return new THREE.Line( geometry, material );

      case 'gaze':
        geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
        material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
        return new THREE.Mesh( geometry, material );
    }
  }

  controller1 = App.renderer.xr.getController(0);
  controller1.addEventListener( 'selectstart', onSelectStart );
  controller1.addEventListener( 'selectend', onSelectEnd );
  controller1.addEventListener( 'connected', function ( event ) {
    this.add( buildController( event.data ) );
  });
  controller1.addEventListener( 'disconnected', function () {
    this.remove( this.children[ 0 ] );
  } );

  App.scene.add(controller1);

  controller2 = App.renderer.xr.getController(1);
  App.scene.add(controller2);

  // The XRControllerModelFactory will automatically fetch controller models
  // that match what the user is holding as closely as possible. The models
  // should be attached to the object returned from getControllerGrip in
  // order to match the orientation of the held device.

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = App.renderer.xr.getControllerGrip( 0 );
  controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
  App.scene.add( controllerGrip1 );

  controllerGrip2 = App.renderer.xr.getControllerGrip( 1 );
  controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
  App.scene.add( controllerGrip2 );
}

function createLights() {
  const light = new THREE.DirectionalLight(0xffff00, 0.8);
  light.position.set(App.width / 2, App.depth / 2, App.height / 2);
  light.castShadow = true;
  light.shadow.mapSize.set(4096, 4096);
  App.scene.add(light);

  if (App.isDebug) {
    const base = new THREE.CameraHelper(light.shadow.camera);
    App.scene.add(base);
  }

  const dlight = new THREE.SpotLight(0xffffff);
  dlight.castShadow = true;
  dlight.position.set(App.width / 2, App.depth, App.height / 2);
  App.scene.add(dlight);

  dlight.shadow.mapSize.set(4096, 4096);
  dlight.shadow.camera.near = 0.5;
  dlight.shadow.camera.far = 2400;
  dlight.shadow.focus = 1;

  if (App.isDebug) {
    const helper = new THREE.CameraHelper(dlight.shadow.camera);
    App.scene.add(helper);
  }
}

function init() {
  App.container = document.createElement('div');
  document.body.appendChild(App.container);

  App.scene = new THREE.Scene();
  App.scene.background = new THREE.Color(0x444444);

  App.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
  App.camera.position.set(0, App.depth * 2, App.height);

  if (App.isDebug) {
    const axesHelper = new THREE.AxesHelper(1000);
    App.scene.add(axesHelper);
  }

  App.createControls();

  const floorGeometry = new THREE.PlaneGeometry(App.width * 2, App.height * 2);
  const floorMaterial = new THREE.MeshStandardMaterial({color: 0x222222});
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.position.set(0, 0, 0);
  App.scene.add(floor);

  createLights();

  const loader = new FontLoader();
  loader.load('fonts/droid_sans_regular.typeface.json', function (font) {
    App.font = font;
    createCity().then(() => {

    })
  });

  App.scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

  App.createRender();

  document.body.appendChild(VRButton.createButton(App.renderer));

  createControllers();
  App.createStats();

  window.addEventListener('resize', onWindowResize);
}


function onWindowResize() {
  App.camera.aspect = window.innerWidth / window.innerHeight;
  App.camera.updateProjectionMatrix();

  App.renderer.setSize(window.innerWidth, window.innerHeight);
}

const SphereRadius = 0.05;

function onPinchStartLeft(event) {
  const controller = event.target;
  if (grabbing) {
    const indexTip = controller.joints['index-finger-tip'];
    const sphere = collideObject(indexTip);

    if (sphere) {
      const sphere2 = hand2.userData.selected;
      console.log("sphere1", sphere, "sphere2", sphere2);
      if (sphere === sphere2) {
        scaling.active = true;
        scaling.object = sphere;
        scaling.initialScale = sphere.scale.x;
        scaling.initialDistance = indexTip.position.distanceTo(hand2.joints['index-finger-tip'].position);
        return;
      }
    }
  }

  const geometry = new THREE.BoxGeometry(SphereRadius, SphereRadius, SphereRadius);
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffffff,
    roughness: 1.0,
    metalness: 0.0
  });
  const spawn = new THREE.Mesh(geometry, material);
  spawn.geometry.computeBoundingSphere();

  const indexTip = controller.joints['index-finger-tip'];
  spawn.position.copy(indexTip.position);
  spawn.quaternion.copy(indexTip.quaternion);

  spheres.push(spawn);

  App.scene.add(spawn);
}

function collideObject(indexTip) {
  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    const distance = indexTip.getWorldPosition(tmpVector1).distanceTo(sphere.getWorldPosition(tmpVector2));

    if (distance < sphere.geometry.boundingSphere.radius * sphere.scale.x) {
      return sphere;
    }

  }
  return null;
}

function onPinchStartRight(event) {
  const controller = event.target;
  const indexTip = controller.joints['index-finger-tip'];
  const object = collideObject(indexTip);

  if (object) {
    grabbing = true;
    indexTip.attach(object);
    controller.userData.selected = object;
    console.log("Selected", object);
  }
}

function onPinchEndRight(event) {
  const controller = event.target;

  if (controller.userData.selected !== undefined) {

    const object = controller.userData.selected;
    object.material.emissive.b = 0;
    App.scene.attach(object);

    controller.userData.selected = undefined;
    grabbing = false;

  }

  scaling.active = false;
}

function animate() {
  App.renderer.setAnimationLoop(render);
}

function render() {
  if (scaling.active) {
    const indexTip1Pos = hand1.joints['index-finger-tip'].position;
    const indexTip2Pos = hand2.joints['index-finger-tip'].position;
    const distance = indexTip1Pos.distanceTo(indexTip2Pos);
    const newScale = scaling.initialScale + distance / scaling.initialDistance - 1;
    scaling.object.scale.setScalar(newScale);
  }

  App.renderer.setAnimationLoop( function () {
    App.renderer.render( App.scene, App.camera );
  } );
  App.stats.update();
}
