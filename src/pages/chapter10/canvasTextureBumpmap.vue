<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import Perlin from "@/utils/perlin.js"
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, controls, cube, canvas, ctx, pn

function dealPerlin() {
  canvas = document.createElement('canvas')
  canvas.setAttribute('width', 256)
  canvas.setAttribute('height', 256)
  const box = $('#literallyBox')
  box.append(canvas)
  ctx = canvas.getContext('2d')
  const date = new Date()
  pn = new Perlin('rnd' + date.getTime())
  fillWithPerlin(pn, ctx)
}

function fillWithPerlin(perlin, ctx) {
  for(let i = 0; i < 512; i++) {
    for(let j = 0; j< 512; j++) {
      const base = new THREE.Color(0xffffff)
      const value = perlin.noise(i / 10, j / 10, 0)
      base.multiplyScalar(value)
      ctx.fillStyle = '#' + base.getHexString()
      ctx.fillRect(i, j, 1, 1)
    }
  }
}

function createMesh(geometry) {
  const texture = new THREE.Texture(canvas)
  geometry.computeVertexNormals()

  const material = new THREE.MeshPhongMaterial()
  material.bumpMap = texture
  material.color = new THREE.Color(0x77ff77)
  texture.needsUpdate = true

  return new THREE.Mesh(geometry, material)
}

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 0;
  camera.position.y = 12;
  camera.position.z = 8;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = 1000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  cube = createMesh(new THREE.BoxGeometry(6, 6, 6))
  cube.position.x = 3
  scene.add(cube)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    controls = {
      bumpScale: cube.material.bumpScale,
      regenerateMap() {
        const date = new Date()
        pn = new Perlin('rnd' + date.getTime())
        fillWithPerlin(pn, ctx)
        cube.material.bumpMap.needsUpdate = true
      },
      updateScale() {
        cube.material.bumpScale = controls.bumpScale
      }
    };
    const gui = new GUI();
    gui.add(controls, 'bumpScale', -40, 40).onChange(controls.updateScale)
    gui.add(controls, 'regenerateMap')
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)

    cube.rotation.y += 0.01;
    cube.rotation.x += 0.01;

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
onMounted(() => {
  dealPerlin()
  createSomething()
})
</script>
<template>
  <div id="threeDoc"></div>
  <div class="fs-container">
    <div id="literallyBox"></div>
  </div>
</template>
<style scoped>
.threeDoc {
  width: 100%;
  height: 100%;
}

.fs-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 400px;
  height: 400px;
}

.fs-container>div {
  width: 100%;
  height: 100%;
}
</style>