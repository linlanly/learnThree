<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { MD2Character } from 'three/addons/misc/MD2Character.js';
import {MD2Loader} from "three/addons/loaders/MD2Loader.js"
import * as TWEEN from "@tweenjs/tween.js"
let skin = new THREE.TextureLoader().load("src/assets/skins/skin.jpg")
let character, scene, mixer, clock
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
  spotLight.position.set(-40, 60, 50)
  spotLight.intensity = 14000
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
  
  let configOgro = {
    baseUrl: 'src/assets/',
    body: 'ogro.md2',
    skins: ['skin.jpg', 'ratamahatta.png', 'monster.jpg'],
    weapons: [['weapon.md2', 'weapon.png']]
  }
  character = new MD2Character()
  character.onLoadComplete = function() {
    character.setAnimation(character.meshBody.geometry.animations[1].name)
    character.setWeapon(0)
    character.setSkin(2)
  }
  character.loadParts(configOgro)
  scene.add(character.root)

  let loader = new MD2Loader()
  loader.load('src/assets/ogro.md2', function(geometry) {
    let material = new THREE.MeshLambertMaterial({map: skin})
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.z += -90
    mesh.position.x += 50
    mesh.scale.set(1.5, 1.5, 1.5)
    scene.add(mesh)

    mixer = new THREE.AnimationMixer(mesh)
    let clip = geometry.animations[3]
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
    character && character.update(clock.getDelta())
    mixer && mixer.update(clock.getDelta() * 100)
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