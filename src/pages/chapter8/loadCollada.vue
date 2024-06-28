<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
let mesh
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1030)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = 150
  camera.position.y = 150
  camera.position.z = 150
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 15000
  scene.add(spotLigth)

  let ambientLight = new THREE.AmbientLight(0x0c0c0c)
  scene.add(ambientLight)

  let loader = new ColladaLoader()
  loader.load('/src/assets/Truck_dae.dae', function(result) {
    mesh = result.scene.children[0].children[0].clone()
    console.log('show datainfo', result)
    scene.add(mesh)
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
    if (mesh && mesh.rotation) {
      // mesh.rotation.x += .01
      mesh.rotation.y += .01
    }
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