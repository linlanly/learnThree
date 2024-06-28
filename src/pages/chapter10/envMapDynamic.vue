<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, cubeCamera

function createCubeMap() {
  const path = 'src/assets/cubemap/parliament/'
  const format = '.jpg'
  const urls = [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format,
  ]
  const textureCube = new THREE.CubeTextureLoader().load(urls)
  return textureCube
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
  spotLight.intensity = .1
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  const textureCube = createCubeMap()
  textureCube.format = THREE.RGBAFormat

  const shader = THREE.ShaderLib['cube']
  shader.uniforms['tCube'].value = textureCube

  const material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  // const skybox = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 10000), material)
  // scene.add(skybox)
  scene.background = new THREE.CubeTextureLoader().setPath('src/assets/cubemap/parliament/').load(['posx.jpg', 'negx.jpg','posy.jpg', 'negy.jpg','posz.jpg', 'negz.jpg'])

  
  const sphereGeometry = new THREE.SphereGeometry(4, 15, 15)
  const boxGeometry = new THREE.BoxGeometry(5, 5, 5)
  const cylinderGeometry = new THREE.CylinderGeometry(2, 4, 10, 20, 20, false)
  
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter
      })

  cubeCamera = new THREE.CubeCamera(.1, 20000, cubeRenderTarget)
  scene.add(cubeCamera)

  const dynamicEnvMaterial = new THREE.MeshBasicMaterial({envMap: cubeRenderTarget.texture, side: THREE.DoubleSide})
  const envMaterial = new THREE.MeshBasicMaterial({map: skin, side: THREE.DoubleSide})

  const sphere = new THREE.Mesh(sphereGeometry, dynamicEnvMaterial)
  sphere.name = 'sphere'
  scene.add(sphere)

  const cylinder = new THREE.Mesh(cylinderGeometry, envMaterial)
  cylinder.name = 'cylinder'
  scene.add(cylinder)
  cylinder.position.set(10, 0, 0)

  const cube = new THREE.Mesh(boxGeometry, envMaterial)
  cube.name = 'cube'
  scene.add(cube)
  cube.position.set(-10, 0, 0)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0, invert = 1
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)
    
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)
    cubeCamera.update(renderer, scene)
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