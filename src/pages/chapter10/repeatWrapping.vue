<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
let orbitControl, scene, clock, controls, cube, sphere

function createMesh(geometry, imageSrc) {
  const texture = new THREE.TextureLoader().load("src/assets/general/" + imageSrc)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  geometry.computeVertexNormals()
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

  sphere = createMesh(new THREE.SphereGeometry(5, 20, 20), 'floor-wood.jpg')
  scene.add(sphere)
  sphere.position.x = 7

  cube = createMesh(new THREE.BoxGeometry(6, 6, 6), 'brick-wall.jpg')
  cube.position.x = -7
  scene.add(cube)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    controls = {
      repeatX: 1,
      repeatY: 1,
      repeatWrapping: true,
      updateRepeat(e) {
        cube.material.map.repeat.set(controls.repeatX, controls.repeatY)
        sphere.material.map.repeat.set(controls.repeatX, controls.repeatY)

        if (controls.repeatWrapping) {
          cube.material.map.wrapS = THREE.RepeatWrapping
          cube.material.map.wrapT = THREE.RepeatWrapping
          sphere.material.map.wrapS = THREE.RepeatWrapping
          sphere.material.map.wrapT = THREE.RepeatWrapping
        } else {
          cube.material.map.wrapS = THREE.ClampToEdgeWrapping
          cube.material.map.wrapT = THREE.ClampToEdgeWrapping
          sphere.material.map.wrapS = THREE.ClampToEdgeWrapping
          sphere.material.map.wrapT = THREE.ClampToEdgeWrapping
        }
        cube.material.map.needsUpdate = true
        sphere.material.map.needsUpdate = true
      }
    };
    const gui = new GUI();
    gui.add(controls, 'repeatX', -4, 4).onChange(controls.updateRepeat)
    gui.add(controls, 'repeatY', -4, 4).onChange(controls.updateRepeat)
    gui.add(controls, 'repeatWrapping', -4, 4).onChange(controls.updateRepeat)
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