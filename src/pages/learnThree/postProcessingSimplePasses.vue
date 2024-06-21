<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js';
import { ConvolutionShader } from 'three/addons/shaders/ConvolutionShader.js';

let orbitControl, scene, clock, controls, sphere
let composer, composer1, composer2, composer3, composer4

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

    const bloomPass = new BloomPass(3, 25, 5)

    const effectFilm = new FilmPass(.8, false)
    effectFilm.renderToScreen = true

    const dotScreenPass = new DotScreenPass()

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(effectCopy)

    const renderScene = new TexturePass(composer.renderTarget2.texture)

    composer1 = new EffectComposer(renderer)
    composer1.addPass(renderScene)
    composer1.addPass(dotScreenPass)

    composer2 = new EffectComposer(renderer)
    composer2.addPass(renderScene)

    composer3 = new EffectComposer(renderer)
    composer3.addPass(renderScene)
    composer3.addPass(bloomPass)
    composer3.addPass(effectCopy)

    composer4 = new EffectComposer(renderer)
    composer4.addPass(renderScene)
    composer4.addPass(effectFilm)

    controls = {
      intensity: .8,
      grayscale: false,
      updateEffectFilm() {
        effectFilm.uniforms.grayscale.value = controls.grayscale
        effectFilm.uniforms.intensity.value = controls.intensity
      },

      strength: 3,
      kernelSize: 25,
      sigma: 5,
      updateEffectBloom() {
        bloomPass.combineUniforms.strength.value = controls.strength
        bloomPass.convolutionUniforms.cKernel.value = ConvolutionShader.buildKernel( controls.sigma )
        bloomPass.materialConvolution.defines.KERNEL_SIZE_FLOAT = controls.kernelSize.toFixed( 1 )
        bloomPass.materialConvolution.defines.KERNEL_SIZE_INT = controls.kernelSize.toFixed( 0 )
        bloomPass.materialConvolution.needsUpdate = true
      },

      centerX: .5,
      centerY: .5,
      angle: 1.57,
      scale: 1,
      updatteDotScreen() {
        dotScreenPass.uniforms.center.value = new THREE.Vector2(controls.centerX, controls.centerY)
        dotScreenPass.uniforms.angle.value = controls.angle
        dotScreenPass.uniforms.scale.value = controls.scale
      }
    };
    const gui = new GUI();
    const film = gui.addFolder('FilmPass')
    film.add(controls, 'intensity', -30, 30).onChange(controls.updateEffectFilm)
    film.add(controls, 'grayscale').onChange(controls.updateEffectFilm)

    const bloom = gui.addFolder('BloomPass')
    bloom.add(controls, 'strength', -3, 3).onChange(controls.updateEffectBloom)
    bloom.add(controls, 'kernelSize', -30, 30).onChange(controls.updateEffectBloom)
    bloom.add(controls, 'sigma', -10, 10).onChange(controls.updateEffectBloom)

    const dotScreen = gui.addFolder('DotScreenPass')
    dotScreen.add(controls, 'centerX', -3, 3).onChange(controls.updatteDotScreen)
    dotScreen.add(controls, 'centerY', -30, 30).onChange(controls.updatteDotScreen)
    dotScreen.add(controls, 'angle', -30, 30).onChange(controls.updatteDotScreen)
    dotScreen.add(controls, 'scale', -10, 10).onChange(controls.updatteDotScreen)
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  const width = window.innerWidth || 2
  const height = window.innerHeight || 2
  const halfWidth = width / 2
  const halfHeight = height / 2

  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)

    sphere.rotation.y += .002

    requestAnimationFrame(renderThree)

    renderer.autoClear = false
    renderer.clear()

    renderer.setViewport(0, 0, width, height)
    composer.render(delta)

    renderer.setViewport(0, 0, halfWidth, halfHeight)
    composer1.render(delta)

    renderer.setViewport(width - halfWidth, 0, halfWidth, halfHeight)
    composer2.render(delta)

    renderer.setViewport(0, height - halfHeight, halfWidth, halfHeight)
    composer3.render(delta)

    renderer.setViewport(width - halfWidth, height - halfHeight, halfWidth, halfHeight)
    composer4.render(delta)
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