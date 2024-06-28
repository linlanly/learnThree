<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import * as TWEEN from "@tweenjs/tween.js"
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let mesh, scene, mixer, clock
function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 40;
        camera.position.y = 50;
        camera.position.z = 150;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 140000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  let pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)
  
  let colladaloader = new ColladaLoader()
  colladaloader.load('src/assets/monster.dae', collada => {
    let monster = collada.scene.children[1].geometry
    monster.setAttribute('uv', monster.attributes.uv1)
    scene.add(collada.scene)
    mixer = new THREE.AnimationMixer(collada.scene)
    let clip = collada.scene.animations[0]
    let action = mixer.clipAction(clip)
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
  })
  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = .1
  function renderThree() {
    stats.update()
    mixer && mixer.update(clock.getDelta())
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