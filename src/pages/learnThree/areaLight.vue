<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import {RectAreaLightUniformsLib} from "three/addons/lights/RectAreaLightUniformsLib.js"
let sphereLightMesh, pointLight
function createSomething() {
  RectAreaLightUniformsLib.init()
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x000000)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let planeGeometry = new THREE.PlaneGeometry(70, 70, 1, 1)
  let planeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .2 })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 0
  plane.position.y = 0
  plane.position.z = 0
  scene.add(plane)

  camera.position.x = 20
  camera.position.y = 30
  camera.position.z = 21
  camera.lookAt(new THREE.Vector3(0, 0, -30))

  let ambiColor = '#cccccc'
  let ambientLight = new THREE.SpotLight(ambiColor)
  ambientLight.position.set(-40, 60, -10)
  ambientLight.intensity = 1000
  ambientLight.lookAt(plane)
  scene.add(ambientLight)

  let areaLight1 = new THREE.RectAreaLight(0xff0000, 1, 8, 20)
  areaLight1.position.set(-10, 4, -35)
  areaLight1.rotation.set(-Math.PI / 3, 0, 0)
  scene.add(areaLight1)

  let areaLight2 = new THREE.RectAreaLight(0x00ff00, 6, 4, 9.9)
  areaLight2.position.set(0, 10, -35)
  areaLight2.rotation.set(-Math.PI / 2, 0, 0)
  scene.add(areaLight2)

  let areaLight3 = new THREE.RectAreaLight(0x0000ff, 6, 4, 9.9)
  areaLight3.position.set(10, 10, -35)
  areaLight3.rotation.set(-Math.PI / 2, 0, 0)
  scene.add(areaLight3)

  let planeGeometry1 = new THREE.BoxGeometry(4, 10, 0)
  let planeGeometryMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  let plane1 = new THREE.Mesh(planeGeometry1, planeGeometryMat)
  plane1.position.copy(areaLight1.position)
  scene.add(plane1)

  let planeGeometry2 = new THREE.BoxGeometry(4, 10, 0)
  let planeGeometryMat2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  let plane2 = new THREE.Mesh(planeGeometry2, planeGeometryMat2)
  plane2.position.copy(areaLight2.position)
  scene.add(plane2)

  let planeGeometry3 = new THREE.BoxGeometry(4, 10, 0)
  let planeGeometryMat3 = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  let plane3 = new THREE.Mesh(planeGeometry3, planeGeometryMat3)
  plane3.position.copy(areaLight3.position)
  scene.add(plane3)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
    rotationSpeed: .2,
    color1: 0xff0000,
    intensity1: 2,
    color2: 0x00ff00,
    intensity2: 2,
    color3: 0x0000ff,
    intensity3: 2,
  }
    let gui = initGUI(controls)
    gui.addColor(controls, 'color1').onChange(function (e) {
      areaLight1.color = new THREE.Color(e)
      planeGeometryMat.color = new THREE.Color(e)
      scene.remove(plane1)
      plane1 = new THREE.Mesh(planeGeometry1, planeGeometryMat)
      plane1.position.copy(areaLight1.position)
      scene.add(plane1)
    })
    gui.add(controls, 'intensity1', 0, 5).onChange(function (e) {
      areaLight1.intensity = e
    })
    gui.addColor(controls, 'color2').onChange(function (e) {
      areaLight2.color = new THREE.Color(e)
      planeGeometryMat2.color = new THREE.Color(e)
      scene.remove(plane2)
      plane2 = new THREE.Mesh(planeGeometry2, planeGeometryMat2)
      plane2.position.copy(areaLight2.position)
      scene.add(plane2)
    })
    gui.add(controls, 'intensity2', 0, 5).onChange(function (e) {
      areaLight2.intensity = e
    })
    gui.addColor(controls, 'color3').onChange(function (e) {
      areaLight3.color = new THREE.Color(e)
      planeGeometryMat3.color = new THREE.Color(e)
      scene.remove(plane3)
      plane3 = new THREE.Mesh(planeGeometry1, planeGeometryMat3)
      plane3.position.copy(areaLight3.position)
      scene.add(plane3)
    })
    gui.add(controls, 'intensity3', 0, 5).onChange(function (e) {
      areaLight3.intensity = e
    })
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  function renderThree() {
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