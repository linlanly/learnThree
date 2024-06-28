<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
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

  camera.position.x = -80;
        camera.position.y = 50;
        camera.position.z = 50;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 160, -10)
  spotLight.intensity = 140000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#ffffff'
  let ambientLight = new THREE.AmbientLight(ambiColor, 1)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  let pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)
  
  let dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/examples/jsm/libs/draco/')
  let loader = new GLTFLoader()
  // loader.setDRACOLoader(dracoLoader)
  
  // loader.load('src/assets/gltf/DamagedHelmet.gltf', (result) => {
  //   scene.add(result.scene)
  // })
'src/assets/gltf/Flamingo.glb'
  loader.load('src/assets/Bee.glb', (result) => {
    let mesh = result.scene.children[0].children[1].children[0].children[0]
    scene.add(result.scene)
    console.log('show datain', result, mesh)

    mixer = new THREE.AnimationMixer(result.scene)
    let clip = result.animations[0]
    let action = mixer.clipAction(clip)
    
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()
  })


  console.log(loader, loader.load)
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