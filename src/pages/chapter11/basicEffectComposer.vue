<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, controls, sphere, composer

function createMesh(geometry) {
  const planetTexture = new THREE.TextureLoader().load('src/assets/planets/Earth.png')
  const specularTexture = new THREE.TextureLoader().load('src/assets/planets/EarthSpec.png')
  const normalTexture = new THREE.TextureLoader().load('src/assets/planets/EarthNormal.png')

  const planetMaterial = new THREE.MeshPhongMaterial()
  planetMaterial.specularMap = specularTexture
  planetMaterial.specular = new THREE.Color(0xffffff)
  planetMaterial.map = planetTexture
  planetMaterial.normalMap = normalTexture
  return new THREE.Mesh(geometry, planetMaterial)
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

  sphere = createMesh(new THREE.SphereGeometry(10, 40, 40))
  scene.add(sphere)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    const renderPass = new RenderPass(scene, camera)
    const effectFilm = new FilmPass(.8, false, 256, .325)
    effectFilm.renderToScreen = true

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(effectFilm)

    controls = {
      scanlinesCount: 256,
      grayscale: false,
      scanlinesIntensity: .3,
      noiseIntensity: .8,
      updateEffectFilm() {
        effectFilm.uniforms.grayscale.value = controls.grayscale
        effectFilm.uniforms.intensity.value = controls.noiseIntensity
        effectFilm.uniforms.tDiffuse.value = controls.scanlinesIntensity
        effectFilm.uniforms.time.value = controls.scanlinesCount
      }
    };
    const gui = new GUI();
    gui.add(controls, 'scanlinesIntensity', -3, 3).onChange(controls.updateEffectFilm)
    gui.add(controls, 'noiseIntensity', -30, 30).onChange(controls.updateEffectFilm)
    gui.add(controls, 'grayscale').onChange(controls.updateEffectFilm)
    gui.add(controls, 'scanlinesCount', -10, 10).onChange(controls.updateEffectFilm)
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

    sphere.rotation.y += .002

    composer.render(delta)
    requestAnimationFrame(renderThree)
    // renderer.render(scene, camera)
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
  createSomething()
})
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