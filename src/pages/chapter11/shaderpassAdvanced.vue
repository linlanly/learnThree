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
import { BleachBypassShader } from 'three/addons/shaders/BleachBypassShader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
let orbitControl, scene, clock, controls, composer, renderer, camera
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2()

function createEdge() {
  const outline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera)

  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.addEventListener('pointermove', onPointMove)

  function onPointMove(event) {
    if (event.isPrimary === false) return;
    mouse.x = event.clientX * 2 / window.innerWidth - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    checkIntersection()
  }

  function checkIntersection() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(scene, true)
    if (intersects.length > 0) {
      outline.selectedObjects = [intersects[0].object];
    }
  }
  return outline
}

function createSomething() {
  const scale = chroma.scale(['white', 'blue'])
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  scene.background = new THREE.TextureLoader().load('src/assets/texture/starry-deep-outer-space-galaxy.jpg')
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  renderer = new THREE.WebGLRenderer()
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
    const bleachFilter = new ShaderPass(BleachBypassShader)
    bleachFilter.enabled = false

    const outline = createEdge()
    outline.enabled = false

    const fxaaShader = new ShaderPass(FXAAShader)
    fxaaShader.enabled = false

    const focusShader = new ShaderPass(FocusShader)
    focusShader.enabled = false

    const renderPass = new RenderPass(scene, camera)
    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(outline)
    composer.addPass(bleachFilter)
    composer.addPass(fxaaShader)
    composer.addPass(focusShader)
    composer.addPass(effectCopy)

    controls = {
      bleachOpacity: 1,
      bleach: false,
      edgeDetect: false,
      edgeAspect: 512,
      fxaa: false,
      focus: false,
      sampleDistance: .94,
      waveFactor: 0.00125,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      changePass() {
        bleachFilter.enabled = controls.bleach
        bleachFilter.uniforms.opacity.value = controls.bleachOpacity

        outline.enabled = controls.edgeDetect

        fxaaShader.enabled = controls.fxaa
        fxaaShader.uniforms.resolution.value = new THREE.Vector2(1 / window.innerWidth, 1 / window.innerHeight)

        focusShader.enabled = controls.focus
        focusShader.uniforms.screenWidth.value = controls.screenWidth
        focusShader.uniforms.screenHeight.value = controls.screenHeight
        focusShader.uniforms.waveFactor.value = controls.waveFactor
        focusShader.uniforms.sampleDistance.value = controls.sampleDistance
      }
    };
    const gui = new GUI();
    ['bleach', 'edgeDetect', 'fxaa', 'focus', 'bleachOpacity', 'edgeAspect', 'sampleDistance', 'waveFactor', 'screenWidth', 'screenHeight'].forEach((key, index) => {
      if (['bleach', 'edgeDetect', 'fxaa', 'focus'].includes(key)) {
        gui.add(controls, key).onChange(controls.changePass)
      } else if (['bleachOpacity', 'sampleDistance', 'waveFactor'].includes(key)) {
        gui.add(controls, key, -10, 10).onChange(controls.changePass)
      } else {
        gui.add(controls, key, -10, 2048).onChange(controls.changePass)
      }
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