<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let raindrop = new THREE.TextureLoader().load("src/assets/sprite-sheet.png")
let controls, stats, mesh, scene, group, sceneOtr, cameraOtr

function createParticles() {
  let key = ['transparent', 'opacity', 'color']
  let options = {}
  key.forEach(key => {
    options[key] = controls[key]
  })
  options.map = raindrop
  options.blending = THREE.AdditiveBlending
  let material = new THREE.SpriteMaterial(options)
  material.map.offset = new THREE.Vector2(0.2 * controls.sprite, 0)
  material.map.repeat = new THREE.Vector2(.2, 1)
  material.depthTest = false
  console.log('show', material)

  let sprite = new THREE.Sprite(material)
  sprite.position.set(100, 150, -10)
  sprite.velocityX = 5
  sprite.scale.set(controls.size, controls.size, controls.size)
  sceneOtr.add(sprite)
}
function createSomething() {
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  sceneOtr = new THREE.Scene()
  cameraOtr = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10)
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

  let material = new THREE.MeshNormalMaterial()
  let geom = new THREE.SphereGeometry(15, 20, 20)
  mesh = new THREE.Mesh(geom, material)
  scene.add(mesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats()
    controls = {
      size: 150,
      sprite: 0,
      transparent: true,
      opacity: .6,
      color: 0xffffff,
      rotateSystem: true,
      redraw() {
        sceneOtr.children.forEach(function(child) {
          if (child instanceof THREE.Sprite) sceneOtr.remove(child)
        })
        createParticles()
      }
    }
    let gui = new GUI()
    gui.add(controls, 'size', -120, 120).onChange(controls.redraw)
    gui.add(controls, 'sprite', -8, 8).step(1).onChange(controls.redraw)
    gui.add(controls, 'opacity', -1, 1).onChange(controls.redraw)
    gui.add(controls, 'transparent').onChange(controls.redraw)
    gui.addColor(controls, 'color').onChange(controls.redraw)

    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  function renderThree() {
    sceneOtr.children.forEach(function(e) {
      if (e instanceof THREE.Sprite) {
        e.position.x += e.velocityX
        if (e.position.x > window.innerWidth) {
          controls.sprite++
          controls.sprite %= 5
          e.velocityX = -5
          e.material.map.offset = new THREE.Vector2(1 / 5 * controls.sprite, 0)
        }
        if (e.position.x < 0) {
          e.velocityX = 5
        }
      }
    })
    stats.update()
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)
    renderer.autoClear = false
    renderer.render(sceneOtr, cameraOtr)
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