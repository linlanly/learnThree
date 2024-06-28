<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, spGroup, hullMesh, scene, segments = 12, phiStart = 0, phiLength = 2 * Math.PI

function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat])
}

function generatePoints() {
  var points = [];
  var height = 5;
  var count = 30;
  for (var i = 0; i < count; i++) {
    points.push(new THREE.Vector3((Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12, (i - count) + count / 2));
  }

  spGroup = new THREE.Object3D();
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false });
  points.forEach(function (point) {

    var spGeom = new THREE.SphereGeometry(0.2);
    var spMesh = new THREE.Mesh(spGeom, material);
    spMesh.position.copy(point);
    spGroup.add(spMesh);
  });
  // add the points as a group to the scene
  scene.add(spGroup);

  // use the same points to create a LatheGeometry
  var latheGeometry = new THREE.LatheGeometry(points, controls.segments, controls.phiStart, controls.phiLength);
  hullMesh = createMesh(latheGeometry);

  scene.add(hullMesh);
}
function createSomething() {
  scene = new THREE.Scene()
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
  camera.position.z = 50
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    controls = {
      segments,
      phiStart,
      phiLength,
      redraw() {
        scene.remove(spGroup)
        scene.remove(hullMesh)
        generatePoints()
      }
    }

    generatePoints()
    let gui = initGUI()
    gui.add(controls, 'segments', -10, 10).step(1).onChange(controls.redraw)
    gui.add(controls, 'phiStart', -4 * Math.PI, 4 * Math.PI).onChange(controls.redraw)
    gui.add(controls, 'phiLength', -4 * Math.PI, 4 * Math.PI).onChange(controls.redraw)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    hullMesh.rotation.z = step += .01
    spGroup.rotation.z = step
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