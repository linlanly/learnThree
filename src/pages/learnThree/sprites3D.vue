<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let stats, mesh, scene, group

function createParticles() {
  group = new THREE.Object3D()
  for (let i = 0; i < 400; i++) {
    group.add(single(i))
  }
  scene.add(group)
}

function single(i) {
let spriteImg = new THREE.TextureLoader().load("src/assets/sprite-sheet.png")
  let range = 200
  let material = new THREE.SpriteMaterial({map: spriteImg, color: 0xffffff, opacity: .6, transparent: true})
  material.map.repeat = new THREE.Vector2(.2, 1)
  material.depthTest = false
  material.map.offset = new THREE.Vector2((i % 5) / 5, 0)
  let sprite = new THREE.Sprite(material)
  sprite.position.set(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2)
  sprite.scale.set(10, 10, 10)
  return sprite
}

function createSomething() {
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -0
  camera.position.y = 0
  camera.position.z = 150

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  // let material = new THREE.MeshNormalMaterial()
  // let geom = new THREE.SphereGeometry(15, 20, 20)
  // mesh = new THREE.Mesh(geom, material)
  // scene.add(mesh)

  createParticles()

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  function renderThree() {
    group.rotation.x += .01
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