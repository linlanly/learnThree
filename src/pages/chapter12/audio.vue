<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
let controls, clock = new THREE.Clock()
function createSomething() {
  let scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, .0035)
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = -130
  camera.position.y = 120
  camera.position.z = 130
  camera.lookAt(scene.position)

  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, .5, 1).normalize()
  scene.add(light)

  const cube = new THREE.BoxGeometry(40, 40, 40)

  const object = {};
  ['cow', 'dog', 'cat'].forEach(key => {
    object[`listener${key}`] = new THREE.AudioListener()
    camera.add(object[`listener${key}`])

    object[`material${key}`] = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.TextureLoader().load(`src/assets/animals/${key}.${key === 'cow' ? 'png' : 'jpg'}`)
    })

    object[`mesh${key}`] = new THREE.Mesh(cube, object[`material${key}`])
    object[`mesh${key}`].position.set(0, 20, key === 'cow' ? 100 : (key === 'dog' ? 0 : -100))
    scene.add(object[`mesh${key}`])

    object[`sound${key}`] = new THREE.Audio(object[`listener${key}`]);
    new THREE.AudioLoader().load(`src/assets/audio/${key}.ogg`, (buffer) => {
      console.log('more', object[`sound${key}`])
      object[`sound${key}`].setBuffer(buffer)
      object[`sound${key}`].setLoop(true)
      object[`mesh${key}`].add(object[`sound${key}`])
      object[`sound${key}`].setVolume(.9)
    })
  })

  const helper = new THREE.GridHelper(500, 10)
  console.log('show', helper)
  helper.position.y = .1
  scene.add(helper)

  controls = new FirstPersonControls(camera, renderer.domElement)
  controls.movementSpeed = .07
  controls.lookSpeed = .015
  controls.noFly = true
  controls.lookVertical = false
  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)

    let isPlay = false
    doc.addEventListener('click', function () {
      if (!isPlay) {
        ['cow', 'dog', 'cat'].forEach(key => {
          object[`sound${key}`].play()
        })
        isPlay = true
      }
      
      ['cow', 'dog', 'cat'].forEach(key => {
          console.log(object[`sound${key}`])
        })
    })
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  function renderThree() {
    let delta = clock.getDelta()
    controls.update(delta)
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