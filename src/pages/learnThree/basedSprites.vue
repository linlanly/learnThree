<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let controls, stats, cloud, scene
function dot() {
  let canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  let ctx = canvas.getContext('2d')
  ctx.translate(-81, -84)
  
  ctx.fillStyle = 'orange'
  ctx.beginPath()
  ctx.moveTo(83, 116)
  ctx.lineTo(83, 102)
  ctx.bezierCurveTo(83, 94, 89, 88, 97, 88)
  ctx.bezierCurveTo(105, 88, 111, 94, 111, 102)
  ctx.lineTo(111, 116)
  ctx.lineTo(106.666, 111.333)
  ctx.lineTo(101.666, 116)
  ctx.lineTo(97, 111.333)
  ctx.lineTo(92.333, 116)
  ctx.lineTo(87.666, 111.333)
  ctx.lineTo(83, 116)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(91, 96)
  ctx.bezierCurveTo(88, 96, 87, 99, 87, 101)
  ctx.bezierCurveTo(87, 103, 88, 106, 91, 106)
  ctx.bezierCurveTo(94, 106, 95, 103, 95, 101)
  ctx.bezierCurveTo(95, 99, 94, 96, 91, 96)
  ctx.moveTo(103, 96)
  ctx.bezierCurveTo(100, 96, 99, 99, 99, 101)
  ctx.bezierCurveTo(99, 103, 100, 106, 103, 106)
  ctx.bezierCurveTo(106, 106, 107, 103, 107, 101)
  ctx.bezierCurveTo(107, 99, 106, 96, 103, 96)
  ctx.fill()

  ctx.fillStyle = 'blue'
  ctx.beginPath()
  ctx.arc(101, 102, 2, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(89, 102, 2, 0, Math.PI * 2, true)
  ctx.fill()

  let texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

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

  let key = ['size', 'transparent', 'vertexColors', 'sizeAttenuation', 'color', 'opacity']
  let options = {}
  key.forEach(key => {
    options[key] = controls[key]
  })
  options.map = dot()
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

  let range = 500
  let material = new THREE.SpriteMaterial({color: 0xffffff, map: dot()})
  for(let i = 0; i < 15000; i++) {
      let sprit = new THREE.Sprite(material)
      sprit.position.set(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2)
      scene.add(sprit)
  }

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