<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 0;
  camera.position.y = 12;
  camera.position.z = 28;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = .1
  spotLight.castShadow = true;
  // scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  // scene.add(ambientLight)

  const groundGeom = new THREE.PlaneGeometry(95, 95, 1, 1)
  const lm = new THREE.TextureLoader().load('src/assets/general/lm-1.png')
  const wood = new THREE.TextureLoader().load('src/assets/general/floor-wood.jpg')
  const groundMaterial = new THREE.MeshBasicMaterial({
    color: 0x777777,
    lightMap: lm,
    map: wood
  })

  console.log('show dat', groundGeom.faceVertexUvx)
  // groundGeom.faceVertexUvx[1] = groundGeom.faceVertexUvx[0]

  const groundMesh = new THREE.Mesh(groundGeom, groundMaterial)
  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.position.y = 0
  scene.add(groundMesh)

  const cubeGeometry = new THREE.BoxGeometry(12, 12, 12)
  const cubeGeometry2 = new THREE.BoxGeometry(6, 6, 6)

  const meshMaterial = new THREE.MeshBasicMaterial()
  meshMaterial.map = new THREE.TextureLoader().load('src/assets/general/stone.jpg')

  const cube = new THREE.Mesh(cubeGeometry, meshMaterial)
  const cube2 = new THREE.Mesh(cubeGeometry2, meshMaterial)
  cube.position.set(.9, 6, -12)
  cube2.position.set(-13.2, 3, -6)

  scene.add(cube)
  scene.add(cube2)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0, invert = 1
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)
    
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