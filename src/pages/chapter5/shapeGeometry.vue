<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, plane
function drawShape() {
  var shape = new THREE.Shape();

  shape.moveTo(10, 10);

  shape.lineTo(10, 40);

  shape.bezierCurveTo(15, 25, 25, 25, 30, 40);

  shape.splineThru(
    [new THREE.Vector2(32, 30),
    new THREE.Vector2(28, 20),
    new THREE.Vector2(30, 10),
    ]);

  shape.quadraticCurveTo(20, 15, 10, 10);

  var hole1 = new THREE.Path();
  hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole1);

  var hole2 = new THREE.Path();
  hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole2);

  var hole3 = new THREE.Path();
  hole3.absarc(20, 16, 2, 0, Math.PI, true);
  shape.holes.push(hole3);
  return shape;
}

function createMesh(geom) {

  // assign two materials
  var meshMaterial = new THREE.MeshNormalMaterial();
  meshMaterial.side = THREE.DoubleSide;
  var wireFrameMat = new THREE.MeshBasicMaterial();
  wireFrameMat.wireframe = true;

  // create a multimaterial
  var mesh = SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);

  return mesh;
}

function createLine(shape, spaced) {
  console.log(shape);
  if (!spaced) {
    let points = shape.extractPoints(10)
    let dataList = []
    points.shape.forEach(item => {
      dataList.push(item.x, item.y, 0)
    })
    points.holes[0].forEach(point => {
      // Array.isArray(item) && item.forEach(point => {
        dataList.push(point.x, point.y, 0)
      // })
    })
    let lines = new THREE.BufferGeometry()
    lines.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dataList), 3))
    var mesh = new THREE.Line(lines, new THREE.LineBasicMaterial({
      color: 0xff3333,
      linewidth: 2
    }));
    return mesh;
  } else {
    var mesh = new THREE.Line(shape.createSpacedPointsGeometry(3), new THREE.LineBasicMaterial({
      color: 0xff3333,
      linewidth: 2
    }));
    return mesh;
  }

}
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -50
  camera.position.y = 40
  camera.position.z = 90
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  plane = createMesh(new THREE.ShapeGeometry(drawShape()))
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    controls = {
      asGeom() {
        scene.remove(plane)
        plane = createMesh(new THREE.ShapeGeometry(drawShape()))
        scene.add(plane)
      },
      asPoints() {
        scene.remove(plane)
        plane = createLine(drawShape(), false)
        scene.add(plane)
      },
      asSpacePoints() {
        scene.remove(plane)
        plane = createLine(drawShape(), true)
        scene.add(plane)
      }
    }

    let gui = initGUI()
    gui.add(controls, 'asGeom')
    gui.add(controls, 'asPoints')
    gui.add(controls, 'asSpacePoints')
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    plane.rotation.y = step += .01
    stats.update()
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)
  }
  renderThree()
}
function initStats() {
  let statsObj = new Stats()
  statsObj.setMode(0)
  statsObj.domElement.style.position = 'absolute'
  statsObj.domElement.style.left = '0'
  statsObj.domElement.style.top = '0'
  let doc = document.getElementById('threeDoc')
  if (doc) {
    doc.append(statsObj.domElement)
  }
  return statsObj
}

function initGUI() {
  let gui = new GUI()
  return gui
}
onMounted(() => createSomething())
</script>
<template>
  <div id="threeDoc"></div>
</template>
<style scoped>
.threeDoc {
  width: 100%;
  height: 100%;
}
</style>