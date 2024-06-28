<script setup>
import * as chroma from 'chroma-js';
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
import { HorizontalTiltShiftShader } from 'three/addons/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/addons/shaders/VerticalTiltShiftShader.js';
import { TriangleBlurShader } from 'three/addons/shaders/TriangleBlurShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, controls, composer

function createSomething() {
  const scale = chroma.scale(['white', 'blue'])
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  scene.background = new THREE.TextureLoader().load('src/assets/texture/starry-deep-outer-space-galaxy.jpg')
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

  const dirLight = new THREE.DirectionalLight(0xffffff)
  dirLight.position.set(30, 30, 30)
  dirLight.intensity = 2
  scene.add(dirLight)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-30, 30, -100)
  spotLight.intensity = 5000
  spotLight.castShadow = true;
  spotLight.target.position.x = -10
  spotLight.target.position.z = -10
  spotLight.shadow.camera.fov = 120
  spotLight.shadow.camera.near = 1
  spotLight.shadow.camera.far = 200
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)
  

  const plane = new THREE.BoxGeometry(1600, 1600, .1, 40, 40)
  const cube = new THREE.Mesh(plane, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: new THREE.TextureLoader().load('src/assets/general/floor-wood.jpg'),
    normalScale: new THREE.Vector2(.6, .6)
  }))

  cube.material.map.wrapS = THREE.RepeatWrapping
  cube.material.map.wrapT = THREE.RepeatWrapping
  cube.rotation.x = Math.PI / 2
  cube.material.map.repeat.set(80, 80)
  cube.receiveShadow = true
  cube.position.z = -150
  cube.position.x = -150
  scene.add(cube)

  const range = 3
  const stepX = 8
  const stepZ = 8
  for (let i = -25; i < 5; i++) {
    for (let j = -5; j < 15; j++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 3), new THREE.MeshPhongMaterial({
        color: scale(Math.random()).hex(),
        opacity: .8,
        transparent: true
      }))
      cube.position.x = i * stepX + (Math.random() - .5) * range
      cube.position.z = j * stepZ + (Math.random() - .5) * range
      cube.position.y = (Math.random() - .5) * 2
      cube.castShadow = true
      scene.add(cube)
    }
  }

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    const hBlur = new ShaderPass(HorizontalBlurShader)
    hBlur.enabled = false
    hBlur.uniforms.h.value = 1 / window.innerHeight

    const vBlur = new ShaderPass(VerticalBlurShader)
    vBlur.enabled = false
    vBlur.uniforms.v.value = 1 / window.innerWidth

    const hTilt = new ShaderPass(HorizontalTiltShiftShader)
    hTilt.enabled = false
    hTilt.uniforms.h.value = 1 / window.innerHeight

    const vTilt = new ShaderPass(VerticalTiltShiftShader)
    vTilt.enabled = false
    vTilt.uniforms.v.value = 1 / window.innerWidth

    const tri = new ShaderPass(TriangleBlurShader)
    tri.enabled = false
    tri.uniforms.delta.value = new THREE.Vector2(.05, .05)

    const renderPass = new RenderPass(scene, camera)
    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(tri)
    composer.addPass(hBlur)
    composer.addPass(vBlur)
    composer.addPass(hTilt)
    composer.addPass(vTilt)
    composer.addPass(effectCopy)

    controls = {
      hBlur: false,
      vBlur: false,
      hTilt: false,
      vTilt: false,
      tri: false,
      hTiltR: .35,
      vTiltR: .35,
      deltaX: .05,
      deltaY: .05,
      changePass() {
        hBlur.enabled = controls.hBlur
        vBlur.enabled = controls.vBlur
        hTilt.enabled = controls.hTilt
        vTilt.enabled = controls.vTilt
        tri.enabled = controls.tri
        hTilt.uniforms.r.value = controls.hTiltR
        vTilt.uniforms.r.value = controls.vTiltR
        tri.uniforms.delta.value = new THREE.Vector2(controls.deltaX, controls.deltaY)
      }
    };
    const gui = new GUI();
    ['hBlur', 'vBlur', 'hTilt', 'vTilt', 'tri', 'hTiltR', 'vTiltR', 'deltaX', 'deltaY'].forEach((key, index) => {
      gui.add(controls, key, index < 5 ? null : -100, index < 5 ? null : 100).onChange(controls.changePass)
    })
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

    composer.render(delta)
    requestAnimationFrame(renderThree)
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