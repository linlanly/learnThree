<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let cloud, controls, stats, scene
function createParticles() {
  let range = 500
  let points = [], colors = []
  for (let i = 0; i < 15000; i++) {
    points.push(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2)
    let color = new THREE.Color(Math.random() * 0xffffff)
    colors.push(color.r, color.g, color.b)
  }

  let buffer = new THREE.BufferGeometry()
  buffer.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3))
  buffer.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

  let key = ['size', 'transparent', 'vertexColors', 'sizeAttenuation', 'color']
  let options = {}
  key.forEach(key => {
    options[key] = controls[key]
  })
  let material = new THREE.PointsMaterial(options)
  cloud = new THREE.Points(buffer, material)
  cloud.name = 'particles'
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
      size: 4,
      transparent: true,
      opacity: .5,
      vertexColors: true,
      color: 0xffffff,
      sizeAttenuation: true,
      rotateSystem: true,
      redraw() {
        if (scene.getObjectByName('particles')) {
          scene.remove(scene.getObjectByName('particles'))
        }
        createParticles()
      }
    }
    let gui = new GUI()
    gui.add(controls, 'size', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'transparent').onChange(controls.redraw)
    gui.add(controls, 'opacity', -1, 1).onChange(controls.redraw)
    gui.add(controls, 'vertexColors').onChange(controls.redraw)
    gui.add(controls, 'sizeAttenuation').onChange(controls.redraw)
    gui.addColor(controls, 'color').onChange(controls.redraw)
    gui.add(controls, 'rotateSystem').onChange(controls.redraw)

    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  let step = 0
  function renderThree() {
    if (controls && controls.rotateSystem) {
      cloud.rotation.z = cloud.rotation.x = step += .001
    }
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