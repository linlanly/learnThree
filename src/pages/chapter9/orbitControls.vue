<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';

function createMesh(geometry) {
  let planeTexture = new THREE.TextureLoader().load("src/assets/mars_1k_color.jpg")
  let normalTexture = new THREE.TextureLoader().load("src/assets/mars_1k_normal.jpg")

  let planeMaterial = new THREE.MeshPhongMaterial({map: planeTexture, bumpMap: normalTexture})

  let wireframe = new THREE.MeshBasicMaterial({wireframe: true})

  return SceneUtils.createMultiMaterialObject(geometry, [planeMaterial])
}

let mesh, clock, orbitControl
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

  let sphere = createMesh(new THREE.SphereGeometry(20, 40, 40))
  scene.add(sphere)
  console.log('show ', sphere)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.autoRotate = true
  orbitControl.listenToKeyEvents(window)

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
    orbitControl.update(delta)
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