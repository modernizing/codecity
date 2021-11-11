import * as THREE from "three";
import * as d3 from "d3";
import {BoxLineGeometry} from "three/examples/jsm/geometries/BoxLineGeometry";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

let CityInfo = {
  maxLines: 0,
  maxChanges: 0,
}

export function createBuildingData(data) {
  const rootNode = d3.hierarchy(data);
  rootNode.descendants().forEach((node) => {
    node.data.hierarchNode = node;
  });

  let maxDepth = 10;
  const allNodes = rootNode
    .descendants()
    .map((d) => {
      (d as any).changes = d.data.data?.git?.details?.length;
      (d as any).lines = d.data.data?.loc?.code;
      (d as any).name = d.data.name;
      if (CityInfo.maxLines < (d as any).lines) {
        CityInfo.maxLines = (d as any).lines
      }
      if (CityInfo.maxChanges < (d as any).changes) {
        CityInfo.maxChanges = (d as any).changes
      }
      return d;
    })
    .filter((d) => d.depth <= maxDepth)
    .filter(
      (d) => d.children === undefined || d.depth === maxDepth
    );

  return allNodes;
}

function loadData(): Promise<any> {
  return d3.json("data.json")
}

function displayText(building: any, font: Font, color: number, x: number, height: number, y: number) {
  const textGeo = new TextGeometry(building.name, {
    font: font,
    size: 0.01,
    height: 0.01,
    curveSegments: 0.1,
  });

  let textMaterial = new THREE.MeshPhongMaterial({color: color});
  let mesh = new THREE.Mesh(textGeo, textMaterial);
  mesh.position.set(x, height * 1.1, y);
  return mesh;
}

export function createCity(font: Font) {
  return loadData().then((data) => {
    let buildings = createBuildingData(data);

    const colors = d3.scaleQuantize()
      .domain([0, CityInfo.maxChanges])
      .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
        "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"] as any);

    const city = new THREE.LineSegments(
      new BoxLineGeometry(10, 10, 10, 10, 10, 10).translate(0, 0, 0),
      new THREE.LineBasicMaterial({color: 0x808080})
    );

    for (let building of buildings) {
      let size = (building as any).lines / CityInfo.maxLines;
      if (size === 0) {
        size = 0.1;
      }

      let height = (building as any).changes / CityInfo.maxChanges;
      const geometry = new THREE.BoxGeometry(size, height, size);

      let color = colors((building as any).changes);
      const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));


      let y = (Math.random() * 4 - 2);
      let x = (Math.random() * 4 - 2);

      object.position.x = x;
      object.position.y = height / 2;
      object.position.z = y;

      object.castShadow = true

      city.add(object);
      //
      let mesh = displayText(building, font, color, x, height, y);
      city.add(mesh);
    }

    return city;
  });
}
