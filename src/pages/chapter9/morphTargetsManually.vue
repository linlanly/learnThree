<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
let cube, pointLight, controls
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })

  let cubeTarget1 = new THREE.BoxGeometry(2, 10, 2).attributes.position
  let cubeTarget2 = new THREE.BoxGeometry(8, 4, 8).attributes.position

  cubeGeometry.morphAttributes.position = [cubeTarget1, cubeTarget2]

  cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true;
  cube.position.x = -4
  cube.position.y = 3
  cube.position.z = 0
  scene.add(cube)

  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    controls = {
      influence1: .01,
      influence2: .01,
      update() {
        cube.morphTargetInfluences[0] = controls.influence1
        // cube.morphTargetInfluences[1] = controls.influence2
      }
    }
    let gui = new GUI()
    gui.add(controls, 'influence1', -10, 10).onChange(controls.update)
    gui.add(controls, 'influence2', -10, 10).onChange(controls.update)
    let stats = initStats()
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