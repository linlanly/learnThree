<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { SepiaShader } from 'three/addons/shaders/SepiaShader.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
import { MaskPass, ClearMaskPass } from 'three/addons/postprocessing/MaskPass.js';

let orbitControl, scene, clock, controls, earth, mars
let composer

function createEarthMesh(geometry) {
  const planetTexture = new THREE.TextureLoader().load('src/assets/planets/Earth.png')
  const specularTexture = new THREE.TextureLoader().load('src/assets/planets/EarthSpec.png')
  const normalTexture = new THREE.TextureLoader().load('src/assets/planets/EarthNormal.png')

  const planetMaterial = new THREE.MeshPhongMaterial()
  planetMaterial.specularMap = specularTexture
  planetMaterial.specular = new THREE.Color(0x4444aa)
  planetMaterial.map = planetTexture
  planetMaterial.normalMap = normalTexture
  return new THREE.Mesh(geometry, planetMaterial)
}
function createMarsMesh(geometry) {
  const planetTexture = new THREE.TextureLoader().load('src/assets/planets/Mars_2k-050104.png')
  const normalTexture = new THREE.TextureLoader().load('src/assets/planets/Mars-normalmap_2k.png')

  const planetMaterial = new THREE.MeshPhongMaterial()
  planetMaterial.map = planetTexture
  planetMaterial.normalMap = normalTexture
  return new THREE.Mesh(geometry, planetMaterial)
}

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  const sceneEarth = new THREE.Scene()
  const sceneMars = new THREE.Scene()
  const sceneBG = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)
  const cameraBG = new THREE.OrthographicCamera(-window.innerWidth,  window.innerWidth , window.innerHeight, -window.innerHeight, -60000, 60000)
  cameraBG.position.z = 50

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
  spotLight.intensity = 4000
  spotLight.castShadow = true;
  sceneEarth.add(spotLight)
  // sceneMars.add(new THREE.SpotLight().copy(spotLight))
  sceneMars.add(spotLight.clone())

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  sceneEarth.add(ambientLight)
  // sceneMars.add(new THREE.AmbientLight().copy(ambientLight))
  sceneMars.add(ambientLight.clone())

  earth = createEarthMesh(new THREE.SphereGeometry(10, 40, 40))
  earth.position.x = -10
  sceneEarth.add(earth)

  mars = createMarsMesh(new THREE.SphereGeometry(5, 40, 40))
  mars.position.x = 10
  sceneMars.add(mars)

  const materialColor = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('src/assets/texture/starry-deep-outer-space-galaxy.jpg'),
    depthTest: false
  })
  const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materialColor)
  bgPlane.position.z = -100
  bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1)
  sceneBG.add(bgPlane)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    const effectGlitch = new GlitchPass(1)
    effectGlitch.renderToScreen = true

    const bgPass = new RenderPass(sceneBG, cameraBG)
    const earthPass = new RenderPass(sceneEarth, camera)
    earthPass.clear = false
    const marsPass = new RenderPass(sceneMars, camera)
    marsPass.clear = false

    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true

    const clearMask = new ClearMaskPass()
    const earthMask = new MaskPass(sceneEarth, camera)
    const marsMask = new MaskPass(sceneMars, camera)

    const effectSepia = new ShaderPass(SepiaShader)
    effectSepia.uniforms['amount'].value = .8

    const effectColorify = new ShaderPass(ColorifyShader)
    effectColorify.uniforms['color'].value.setRGB(.5, .5, 1)

    composer = new EffectComposer(renderer)
    composer.renderTarget1.stencilBuffer = true
    composer.renderTarget2.stencilBuffer = true

    composer.addPass(bgPass)
    composer.addPass(earthPass)
    composer.addPass(marsPass)
    composer.addPass(marsMask)
    composer.addPass(effectColorify)
    composer.addPass(clearMask)
    composer.addPass(earthMask)
    composer.addPass(effectSepia)
    composer.addPass(clearMask)
    composer.addPass(effectCopy)

    controls = {
      amount: .8,
      color: '#7777ff',
      showGlitch: false,
      goWild: false,
      updateEffect() {
        effectGlitch.goWild = controls.goWild
      },
      changeShowGlitch() {
        if (controls.showGlitch) {
          composer.addPass(effectGlitch)
        } else {
          composer.removePass(effectGlitch)
        }
      },
      updateAmount(e) {
        effectSepia.uniforms['amount'].value = e
      },
      updateColor(e) {
        const color = new THREE.Color(e)
        effectColorify.uniforms['color'].value.setRGB(color.r, color.g, color.b)
      }
    };
    const gui = new GUI();
    gui.add(controls, 'goWild').onChange(controls.updateEffect)
    gui.add(controls, 'showGlitch').onChange(controls.changeShowGlitch)
    gui.add(controls, 'amount', -1000, 1000).onChange(controls.updateAmount)
    gui.addColor(controls, 'color').onChange(controls.updateColor)
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {

  function renderThree() {
    renderer.autoClear = false
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)

    earth.rotation.y += .002
    mars.rotation.y += .002

    requestAnimationFrame(renderThree)
    composer.render(delta)
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