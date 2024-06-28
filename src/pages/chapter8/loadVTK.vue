<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { VTKLoader } from 'three/addons/loaders/VTKLoader.js';
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

  camera.position.x = 10
  camera.position.y = 10
  camera.position.z = 10
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-20, -20, 60)
  spotLigth.intensity = 150000
  scene.add(spotLigth)

  let ambientLight = new THREE.DirectionalLight(0x0c0c0c)
  scene.add(ambientLight)

  let cube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshPhongMaterial({color: 0x223344}))
  scene.add(cube)

  mesh = new THREE.Object3D()
  let loader = new VTKLoader()
  loader.load('/src/assets/moai_fixed.vtk', function(geometry) {
    geometry.computeVertexNormals()
    let material = new THREE.MeshPhongMaterial({color: 0xff44ff})
    mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(9, 9, 9)
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
      mesh.rotation.y += .01
      // mesh.rotation.y += .01
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