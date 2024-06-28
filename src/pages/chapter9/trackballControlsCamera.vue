<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import * as chroma from 'chroma-js'

function setRandomColors(object, scale) {
  let children = object.children

  if (children && children.length > 0) {
    children.forEach(e => {
      setRandomColors(e, scale)
    })
  } else {
    if (object instanceof THREE.Mesh) {
      // object.material.color = new THREE.Color(scale(Math.random()).hex())
      if (object.material.name && object.material.name.indexOf('building') == 0) {
        object.material.emissive = new THREE.Color(0x444444)
        object.material.transparent = true
        object.material.opacity = .8
      }
    }
  }
}

let mesh, clock, trackballControl, flyControl, firstPersonControl
function createSomething() {
  clock = new THREE.Clock()

  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1030)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = 100
  camera.position.y = 100
  camera.position.z = 300
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(300, 300, 300)
  spotLigth.intensity = 150000
  scene.add(spotLigth)

  let ambientLight = new THREE.DirectionalLight(0x383838)
  scene.add(ambientLight)

  trackballControl = new TrackballControls(camera, renderer.domElement)
  trackballControl.screen.width = window.innerWidth
  trackballControl.screen.height = window.innerHeight
  trackballControl.rotateSpeed = 1
  trackballControl.zoomSpeed = 1
  trackballControl.panSpeed = 1
  trackballControl.staticMoving = true

  flyControl = new FlyControls(camera, renderer.domElement)
  flyControl.movementSpeed = 25
  flyControl.rollSpeed = Math.PI / 24
  flyControl.autoForward = true
  flyControl.dragToLook = false

  firstPersonControl = new FirstPersonControls(camera, renderer.domElement)
  firstPersonControl.lookSpeed = 0
  firstPersonControl.movementSpeed = 20
  firstPersonControl.verticalMin = 1
  firstPersonControl.verticalMax = 2
  firstPersonControl.constrainVertical = true

  mesh = new THREE.Object3D()
  let mtlloader = new MTLLoader()
  mtlloader.load('src/assets/city.mtl', material => {
    let loader = new OBJLoader()
    loader.setMaterials(material)
    loader.load('/src/assets/city.obj', function (loadMesh) {
      let scale = chroma.scale(['red', 'green', 'blue'])
      setRandomColors(loadMesh, scale)
      mesh = loadMesh
      scene.add(mesh)
    })
  })

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let gui = initGUI()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    let delta = clock.getDelta()
    firstPersonControl.update(delta)
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