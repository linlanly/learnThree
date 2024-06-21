<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { PVRLoader } from 'three/addons/loaders/PVRLoader.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
let mesh, scene, meshList
function createMesh(geometry, type, imageFile) {
  let texture
  if (type === 'dds') {
    const loader = new DDSLoader()
    texture = loader.load(`src/assets/texture/seafloor.dds`)
  } else if (type === 'pvr') {
    const loader = new PVRLoader()
    texture = loader.load(`src/assets/texture/tex_base.pvr`)
    texture.minFilter = texture.magFilter = THREE.LinearFilter
    texture.encoding = THREE.SRGBColorSpace
    texture.mapping = THREE.CubeReflectionMapping
    texture.colorSpace = THREE.SRGBColorSpace
  } else if (type === 'tga') {
    const loader = new TGALoader()
    texture = loader.load(`src/assets/texture/crate_color8.tga`)
  } else if (type === 'normal' && imageFile) {
    texture = new THREE.TextureLoader().load(`src/assets/general/${imageFile}`)
  }
  const material = new THREE.MeshPhongMaterial({ map: texture })
  return new THREE.Mesh(geometry, material)
}
function createSomething() {
  mesh = new THREE.Object3D()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 30;
  camera.position.y = 50;
  camera.position.z = 100;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-4, 200, -10)
  spotLight.intensity = 14000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  let pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight);

  ['normal', 'dds', 'pvr', 'tga'].forEach((type, index) => {
    const polyhedron = createMesh(new THREE.IcosahedronGeometry(5, 0), type, !index ? 'metal-rust.jpg' : null)
    polyhedron.position.x = 12
    polyhedron.position.y = index * 20
    mesh.add(polyhedron)

    const sphere = createMesh(new THREE.SphereGeometry(5, 20, 20), type, !index ? 'floor-wood.jpg' : null)
    sphere.position.y = index * 20
    mesh.add(sphere)

    const cube = createMesh(new THREE.BoxGeometry(5, 5, 5), type, !index ? 'brick-wall.jpg' : null)
    cube.position.y = index * 20
    cube.position.x = -12
    mesh.add(cube)
  })



  scene.add(mesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = .01
  function renderThree() {
    mesh.rotation.x += step
    mesh.rotation.y += step
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