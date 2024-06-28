<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, controls, cube, canvas

function dealLiterally() {
  canvas = document.createElement('canvas')
  const box = $('#literallyBox')
  console.log('show daian', box)
  box.append(canvas)
  box.literallycanvas({ imageURLPrefix: 'src/utils/literally/img' })
}

function createMesh(geometry) {
  const texture = new THREE.Texture(canvas)
  const material = new THREE.MeshPhongMaterial()
  material.map = texture
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
  camera.position.z = 28;
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
  scene.add(cube)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    controls = {
      repeatX: 1,
      repeatY: 1,
      showTexture: true,
      showCanvas() {
        if (controls.showTexture) {
          controls.regenerateMap()
          $('.fs-container').show()
        } else {
          $('.fs-container').hide()
        }
      }
    };
    const gui = new GUI();
    gui.add(controls, 'showTexture', -4, 4).onChange(controls.showCanvas)
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

    cube.material.map.needsUpdate = true;

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
  dealLiterally()
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