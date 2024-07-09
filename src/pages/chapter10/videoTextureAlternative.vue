<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, controls, cube, texture, ctx, pn

function dealVideo() {
  const videoBox = document.getElementById('videoBox')
  texture = new THREE.VideoTexture(videoBox)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat
  texture.generateMipmaps = false
}

function createMesh(geometry) {
  const materialArray = []
  for (let i = 0; i < 6; i++) {
    if (i === 4) {
      materialArray.push(new THREE.MeshBasicMaterial({ map: texture }))
    } else {
      materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    }
  }
  return new THREE.Mesh(geometry, materialArray)
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
  camera.position.z = 38;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = 1000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  cube = createMesh(new THREE.BoxGeometry(22, 16, .2))
  cube.position.y = 3
  scene.add(cube)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    controls = {
      showVideo: false,
      rotate: false,
      changeShowVideo() {
        if (controls.showVideo) {
          $('.fs-container').show()
        } else {
          $('.fs-container').hide()
        }
      }
    };
    const gui = new GUI();
    gui.add(controls, 'showVideo').onChange(controls.changeShowVideo)
    gui.add(controls, 'rotate')
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

    if (controls.rotate) {
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.01;
      cube.rotation.z += 0.01;
    }

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
  dealVideo()
  createSomething()
})
</script>
<template>
  <div id="threeDoc"></div>
  <div class="fs-container">
    <video id="videoBox" controls="true" autoplay="true">
      <source src="@/assets/videos/test1.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
  </div>
</template>
<style scoped>
.threeDoc {
  width: 100%;
  height: 100%;
}

.fs-container {
  position: absolute;
  bottom: 300px;
  left: 200px;
  width: 200px;
  height: 200px;
}

.fs-container>video {
  width: 100%;
  height: 100%;
}
</style>