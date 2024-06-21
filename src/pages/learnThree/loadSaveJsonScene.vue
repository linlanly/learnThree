<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, plane, loadMesh, scene
function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return new THREE.Mesh(geom, wireFrameMat)
}
function createSomething() {
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let PlaneGeometry = new THREE.PlaneGeometry(60, 20, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff})
  plane = new THREE.Mesh(PlaneGeometry, planeMaterial)
  plane.castShadow = true
  plane.rotation.x = -.5 * Math.PI
  plane.position.x = 15
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  let cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000})
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.x = -4
  cube.position.y = 3
  scene.add(cube)

  let sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  let sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff})
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.x = 20
  sphere.position.z = 2
  scene.add(sphere)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 15000
  scene.add(spotLigth)

  let ambientLight = new THREE.AmbientLight(0x0c0c0c)
  scene.add(ambientLight)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = Object.assign(controls, {
      exportScene() {
        let json = JSON.stringify(scene.toJSON())
        localStorage.setItem('scene', json)
      },
      clearScene() {
        scene.clear()
      },
      importScene() {
        let json = localStorage.getItem('scene')
        if (json) {
          let sceneJson = JSON.parse(json)
          let loader = new THREE.ObjectLoader()
          scene.add(loader.parse(sceneJson))
        }
      }
    })

    let gui = initGUI()
    gui.add(controls, 'exportScene')
    gui.add(controls, 'clearScene')
    gui.add(controls, 'importScene')
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
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