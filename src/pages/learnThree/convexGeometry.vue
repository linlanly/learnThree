<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import {ConvexGeometry} from "three/addons/geometries/ConvexGeometry.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, spGroup, hullMesh, scene

function createMesh(geom) {
  let meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: .4})
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat])
}

function generatePoints() {
  let points = []
  for(let i = 0; i < 20; i++) {
    let randomX = -15 + Math.round(Math.random() * 30)
    let randomY = -15 + Math.round(Math.random() * 30)
    let randomZ = -15 + Math.round(Math.random() * 30)
    points.push(new THREE.Vector3(randomX, randomY, randomZ))
  }
  
  spGroup = new THREE.Object3D()
  let mater = new THREE.MeshBasicMaterial({color: 0xff0000})
  points.forEach(point => {
    let spGeom = new THREE.SphereGeometry(.2)
    let spMesh = new THREE.Mesh(spGeom, mater)
    spMesh.position.copy(point)
    spGroup.add(spMesh)
  })

  let hullGeometry = new ConvexGeometry(points)
  hullMesh = createMesh(hullGeometry)
  scene.add(hullMesh)
  scene.add(spGroup)
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

  generatePoints()

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    controls = {
      redraw() {
        scene.remove(spGroup)
        scene.remove(hullMesh)
        generatePoints()
      }
    }

    let gui = initGUI()
    gui.add(controls, 'redraw')
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