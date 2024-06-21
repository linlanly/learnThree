<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, numberOfObject = ref(0), groud
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xffffff)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  let planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.receiveShadow = true

  plane.rotation.x = -.5 * Math.PI
  plane.position.x = 0
  plane.position.y = -2
  plane.position.z = 0
  scene.add(plane)

  camera.position.x = -40
  camera.position.y = 40
  camera.position.z = 40
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.castShadow = true
  spotLight.intensity = 1000
  scene.add(spotLight)

  groud = new THREE.Mesh()
  let colors = [0x009e60, 0x0051ba, 0xffd500, 0xff5800, 0xC41E3A, 0xffffff]
  let mats = []
  colors.forEach(item => {
    mats.push(new THREE.MeshBasicMaterial({ color: item }))
  })

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        let cubeGeometry = new THREE.BoxGeometry(2.9, 2.9, 2.9)
        let cube = new THREE.Mesh(cubeGeometry, mats)
        cube.position.set(i * 3 - 3, j * 3, k * 3 - 3)
        groud.add(cube)
      }
    }
  }
  scene.add(groud)


  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = {
      rotationSpeed: .02,
      numberOfObject: numberOfObject.value,
    }

    let gui = initGUI()
    gui.add(controls, 'rotationSpeed', 0, .5)

    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    groud.rotation.y = step += controls.rotationSpeed
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