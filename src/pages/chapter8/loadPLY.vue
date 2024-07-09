<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

function generateSprite() {
  let canvas = document.createElement("canvas")
  canvas.width = 16
  canvas.height = 16

  let context = canvas.getContext('2d')
  let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(0, 255, 255, 1)')
  gradient.addColorStop(0.4, 'rgba(0, 0, 64, 1)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')


  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  let texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}


function createTexture() {
  var canvas = document.createElement("canvas");
  canvas.width = 16
  canvas.height = 16
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = 'transparent'
  ctx.beginPath()
  var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
  gradient.addColorStop(1, 'rgba(0,0,64, 0)');
  ctx.fillStyle = gradient;
  // ctx.arc(8, 8, 8, 0, 2 * Math.PI, false);
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fill();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

let mesh
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1030)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = 10
  camera.position.y = 10
  camera.position.z = 10
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-20, -20, 60)
  spotLigth.intensity = 150000
  scene.add(spotLigth)

  let ambientLight = new THREE.DirectionalLight(0x0c0c0c)
  scene.add(ambientLight)

  mesh = new THREE.Object3D()
  let loader = new PLYLoader()
  loader.load('/src/assets/test.ply', function(geometry) {
    let material = new THREE.PointsMaterial({
      color: 0xff44ff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      map: generateSprite(),
      size: .4
    })
    mesh = new THREE.Points(geometry, material)
    scene.add(mesh)
  })

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let gui = initGUI()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    if (mesh && mesh.rotation) {
      mesh.rotation.y += .01
      // mesh.rotation.y += .01
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