<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let raindrop = new THREE.TextureLoader().load("src/assets/raindrop-1.png")
let controls, stats, cloud, scene, speed = []

function createParticles() {
  let key = ['transparent', 'sizeAttenuation', 'color']
  let options = {}
  key.forEach(key => {
    options[key] = controls[key]
  })
  options.map = raindrop
  options.blending = THREE.AdditiveBlending
  let material = new THREE.SpriteMaterial(options)

  let range = 500
  cloud = new THREE.Group()
  cloud.name = 'particles'
  for (let i = 0; i < 15000; i++) {
    let sprite = new THREE.Sprite(material)
    cloud.add(sprite)
    sprite.position.set(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2)
    speed.push(new THREE.Vector2((Math.random() - .5) / 3, .1 + Math.random() / 5))
  }
  scene.add(cloud)
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

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats()
    controls = {
      transparent: true,
      opacity: .5,
      color: 0xffffff,
      sizeAttenuation: true,
      redraw() {
        if (scene.getObjectByName('particles')) {
          scene.remove(scene.getObjectByName('particles'))
        }
        createParticles()
      }
    }
    let gui = new GUI()
    gui.add(controls, 'opacity', -1, 1).onChange(controls.redraw)
    gui.add(controls, 'transparent').onChange(controls.redraw)
    gui.add(controls, 'sizeAttenuation').onChange(controls.redraw)
    gui.addColor(controls, 'color').onChange(controls.redraw)

    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  function renderThree() {
    cloud.children.forEach((sprite, i) => {
      sprite.position.x -= speed[i].x
      sprite.position.y -= speed[i].y
      
      if (sprite.position.x <= -20 || sprite.position.x >= 20) {
        speed[i].x *= -1
      }
      if (sprite.position.y <= -window.innerHeight / 2) {
        speed[i].y = window.innerHeight
      }
    })
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