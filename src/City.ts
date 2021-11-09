import * as THREE from "three";
import {BoxLineGeometry} from "three/examples/jsm/geometries/BoxLineGeometry";

export function createCity() {
  const city = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
    new THREE.LineBasicMaterial({color: 0x808080})
  );

  for (let i = 0; i < 200; i++) {
    const height = Math.random() * 4;

    const geometry = new THREE.BoxGeometry(0.15, height, 0.15);

    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));

    object.position.x = Math.random() * 4 - 2;
    object.position.y = 0;
    object.position.z = Math.random() * 4 - 2;

    // object.rotation.x = Math.random() * 2 * Math.PI;
    // object.rotation.y = Math.random() * 2 * Math.PI;
    // object.rotation.z = Math.random() * 2 * Math.PI;

    // object.scale.x = Math.random() + 0.5;
    // object.scale.y = Math.random() + 0.5;
    // object.scale.z = Math.random() + 0.5;

    // object.userData.velocity = new THREE.Vector3();
    // object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    // object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    // object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    city.add(object);
  }

  return city;
}
