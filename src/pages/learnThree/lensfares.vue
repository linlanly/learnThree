<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
let sphereLightMesh, pointLight
function createSomething() {
  let scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xaaaaaa, .010, 200)

  let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
  renderer.setClearColor(0x000000)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let textureGrass = new THREE.TextureLoader().load("src/assets/grasslight-big.jpg")
  textureGrass.wrapS = THREE.RepeatWrapping
  textureGrass.wrapT = THREE.RepeatWrapping
  textureGrass.repeat.set(4, 4)

  let planeGeometry = new THREE.PlaneGeometry(1000, 200, 20, 20)
  let planeMaterial = new THREE.MeshLambertMaterial({ map: textureGrass })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = -5
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(6, 6, 6)
  let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff3333 })
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true;
  cube.position.x = -4
  cube.position.y = 3
  cube.position.z = 0
  scene.add(cube)

  let sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  let sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff })
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true;
  sphere.position.x = 10
  sphere.position.y = 5
  sphere.position.z = 10
  scene.add(sphere)

  camera.position.x = -20
  camera.position.y = 15
  camera.position.z = 45
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let ambiColor = '#000000'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let spotlight = new THREE.SpotLight(0xcccccc)
  spotlight.position.set(-40, 60, -10)
  spotlight.lookAt(plane)
  spotlight.intensity = 1000
  scene.add(spotlight)

  let target = new THREE.Object3D()
  target.position.set(new THREE.Vector3(5, 0, 0))

  let pointcolor = '#ffffff'
  pointLight = new THREE.DirectionalLight(pointcolor)
  pointLight.position.set(30, 10, -50)
  // pointLight.intensity = 2
  pointLight.castShadow = true
  pointLight.shadow.camera.near = .1
  pointLight.shadow.camera.far = 100
  pointLight.shadow.camera.top = 100
  pointLight.shadow.camera.bottom = -100
  pointLight.shadow.camera.right = 100
  pointLight.shadow.camera.left = -100
  pointLight.shadow.camera.visible = false
  pointLight.shadow.bias = 0.003

  pointLight.target = plane
  // pointLight.distance = 0
  // pointLight.angle = .4
  scene.add(pointLight)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      hemisphere: true,
      color: '#000000',
      skyColor: '#ffffff',
      intensity: .6
    }
    let gui = initGUI(controls)
    gui.addColor(controls, 'color').onChange(function (e) {
      ambientLight.color = new THREE.Color(e)
    })
    gui.addColor(controls, 'skyColor').onChange(function (e) {
      pointLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'intensity', 0, 5).onChange(function (e) {
      pointLight.intensity = e
    })

    let textureFlare0 = new THREE.TextureLoader().load("src/assets/lensflare0.png")
    let textureFlare3 = new THREE.TextureLoader().load("src/assets/lensflare3.png")

    let flareColor = new THREE.Color(0xffaacc)
    let lensFlare = new Lensflare(textureFlare0, 350, 0, 0, THREE.AdditiveBlending, flareColor)
    lensFlare.addElement(new LensflareElement( textureFlare0, 350, 0, flareColor))
    lensFlare.addElement(new LensflareElement( textureFlare3, 60, .6))
    lensFlare.addElement(new LensflareElement( textureFlare3, 70, .7))
    lensFlare.addElement(new LensflareElement( textureFlare3, 120, .9))
    lensFlare.addElement(new LensflareElement( textureFlare3, 70, 1))
    lensFlare.position.copy(pointLight.position)
    scene.add(lensFlare)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls)
  }
}

function renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls) {
  let step = 0, invert = 1, phase = 0;
  function renderThree() {
    cube.rotation.x += controls.rotationSpeed
    cube.rotation.y += controls.rotationSpeed
    cube.rotation.z += controls.rotationSpeed

    step += controls.bouncingSpeed
    sphere.position.x = 20 + (10 * (Math.cos(step)))
    sphere.position.y = 2 + (10 * (Math.abs(Math.cos(step))))

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

function initGUI(controls) {
  let gui = new GUI()
  gui.add(controls, 'rotationSpeed', 0, 0.5)
  gui.add(controls, 'bouncingSpeed', 0, 0.5)
  return gui
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