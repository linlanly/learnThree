<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { CustomGrayScaleShader, CustomBitShader } from '@/utils/custom-shader.js';
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
    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true

    const shaderPass = new ShaderPass(CustomGrayScaleShader)
    shaderPass.enabled = false

    const bitPass= new ShaderPass(CustomBitShader)
    bitPass.enabled = false

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(shaderPass)
    composer.addPass(bitPass)
    composer.addPass(effectCopy)

    controls = {
      grayscale: false,
      rPower: .2126,
      gPower: .7152,
      bPower: .0722,
      bitShader: false,
      bitSize: 8,
      updateEffectFilm() {
        shaderPass.enabled = controls.grayscale
        shaderPass.uniforms.rPower.value = controls.rPower
        shaderPass.uniforms.gPower.value = controls.gPower
        shaderPass.uniforms.bPower.value = controls.bPower
      },
      updateBit() {
        bitPass.enabled = controls.bitShader
        bitPass.uniforms.bitSize.value = controls.bitSize
      }
    };
    const gui = new GUI();
    gui.add(controls, 'grayscale').onChange(controls.updateEffectFilm);
    ['rPower', 'gPower', 'bPower'].forEach(key => {
      gui.add(controls, key, -30, 30).onChange(controls.updateEffectFilm)
    })
    
    gui.add(controls, 'bitShader').onChange(controls.updateBit)
    gui.add(controls, 'bitSize', -10, 10).onChange(controls.updateBit)
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