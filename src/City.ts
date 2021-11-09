import * as THREE from "three";
import {BoxLineGeometry} from "three/examples/jsm/geometries/BoxLineGeometry";

export function createCity() {
  const city = new THREE.LineSegments(
    new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 0, 0),
    new THREE.LineBasicMaterial({color: 0x808080})
  );

  for (let i = 0; i < 200; i++) {
    const height = Math.random() * 4;

    const geometry = new THREE.BoxGeometry(0.15, height, 0.15);

    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0xD3D6E8}));

    object.position.x = Math.random() * 4 - 2;
    object.position.y = height / 2;
    object.position.z = Math.random() * 4 - 2;

    object.castShadow = true

    city.add(object);
  }

  return city;
}
