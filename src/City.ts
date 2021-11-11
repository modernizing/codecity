import * as THREE from "three";
import {Scene} from "three";
import * as d3 from "d3";
import {Font} from "three/examples/jsm/loaders/FontLoader";

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

function addCuboid(w, h, d, x, y, z, color, scene, pool, node) {
  const cuboid = new THREE.Mesh(pool.geometry, pool.materials[color]);
  cuboid.position.set(x + w / 2 - 500, y, z + d / 2 - 500);
  cuboid.scale.set(w, h, d);

  const frame = new THREE.LineSegments(pool.edgeGeometry, pool.lineMaterials[color]);
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

export function createCity(font: Font, scene: Scene) {
  return loadData().then((data) => {
    let buildings = treemap(data);

    const pool = createpool(buildings);

    buildings.forEach(layer => layer[1].forEach(node => {
      const h = 6, hh = h / 2,
        w = node.x1 - node.x0,
        d = node.y1 - node.y0,
        cl = buildings.length - node.height - 1;

      const cuboid = addCuboid(w, h, d, node.x0, cl * h, node.y0, cl, scene, pool, node);

    }))
  });
}
