import * as THREE from "three";
import {Scene} from "three";
import * as d3 from "d3";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {App} from "./App";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

let CityInfo = {
  maxLines: 0,
  maxChanges: 0,
  pool: undefined
}

function treemap(data) {
  let root = d3.treemap()
    .size([1000, 1000])
    .paddingOuter(5)
    .paddingInner(5)
    .paddingTop(20)
    .round(true)
    (d3.hierarchy(data)
      .sum(d => {
        d.value = d.data?.loc?.lines
        d.changes = d.data?.git?.details?.length ? d.data?.git?.details?.length : 0;

        if (CityInfo.maxLines < (d as any).value) {
          CityInfo.maxLines = (d as any).value
        }
        if (CityInfo.maxChanges < d.changes) {
          CityInfo.maxChanges = d.changes
        }
        return d.value
      })
      .sort((a, b) => b.value - a.value))

  return Array.from(d3.group(root, d => d.height));
}

function loadData(): Promise<any> {
  return d3.json("data.json")
}

function addCuboid(w, h, d, x, y, z, color, scene, node) {
  const cuboid = new THREE.Mesh(CityInfo.pool.geometry, CityInfo.pool.materials[color]);
  cuboid.position.set(x + w / 2 - App.width / 2, y, z + d / 2 - App.width / 2);
  cuboid.scale.set(w, h, d);

  const frame = new THREE.LineSegments(CityInfo.pool.edgeGeometry, CityInfo.pool.lineMaterials[color]);
  cuboid.add(frame);

  scene.add(cuboid);
  return cuboid;
}

function createpool(chartData) {
  const color = d3.scaleSequential([8, 0], d3.interpolateMagma);
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1),
    colors = chartData.map(layer => color(layer[0]));

  return {
    geometry,
    materials: colors.map(color => new THREE.MeshBasicMaterial({
      color,
      opacity: 0.9,
      transparent: true
    })),
    edgeGeometry: new THREE.EdgesGeometry(geometry),
    lineMaterials: colors.map(color => new THREE.LineBasicMaterial({
      color: d3.color(color).darker(0.5).formatHex(),
      linewidth: 1
    })),
    textMaterial: new THREE.MeshBasicMaterial({color: 0x333333})
  }

}

export function createCity(scene: Scene) {
  return loadData().then((data) => {
    let buildings = treemap(data);

    CityInfo.pool = createpool(buildings);


    buildings.forEach(layer => layer[1].forEach((node: any) => {
      const h = 6, hh = h / 2,
        w = node.x1 - node.x0,
        d = node.y1 - node.y0,
        cl = buildings.length - node.height - 1;
      const format = d3.format(",d"),
        fontSize = 10,
        tolerance = 0.6;

      function estimate(text) {
        return text.length * fontSize * tolerance;
      }

      const cuboid = addCuboid(w, h, d, node.x0, cl * h, node.y0, cl, scene, node);
      const rx = Math.PI * 1.5;

      if (node.children) {
        let label = `${node.data.name} ${format(node.value)}`;
        if (estimate(label) > w) label = node.data.name;
        if (estimate(label) < w)
          addText(label, fontSize, 0.3, node.x0 + 2, cl * h + hh, node.y0 + 12, rx, 0, 0);
      } else {
        const labels = node.data.name.split(/(?=[A-Z][^A-Z])/g).concat(format(node.value)),
          max = Math.max(...labels.map(label => label.length * fontSize * tolerance));

        if (max < w) {
          if (labels.length * fontSize > d) labels.pop();
          if (labels.length * fontSize < d) {
            labels.forEach((label, i) => {
              addText(
                label, fontSize, 0.3,
                node.x0 + 2, cl * h + hh, node.y0 + (i * 12) + 12,
                rx, 0, 0);
            });
          }
        }
      }


    }))
  });
}

function addText(text, size, h, x, y, z, rx, ry, rz) {
  const geometry = new TextGeometry(
    text,
    {font: App.font, size, height: h});
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, CityInfo.pool.textMaterial);
  mesh.position.set(x - App.width / 2, y, z - App.width / 2);
  mesh.rotation.set(rx, ry, rz);
  App.scene.add(mesh);
  return mesh;
}
