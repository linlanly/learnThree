<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
let sphereLightMesh, pointLight
function createSomething() {
  console.log('sho ,', AsciiEffect)
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let planeGeometry = new THREE.PlaneGeometry(60, 20, 10, 10)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = -5
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(6, 6, 6)
  let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x330000 })
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
  sphere.position.x = 20
  sphere.position.y = 0
  sphere.position.z = 2
  scene.add(sphere)

  camera.position.x = -35
  camera.position.y = 30
  camera.position.z = 25
  camera.lookAt(scene.position)

  let ambiColor = '#1c1c1c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ff5808'
  pointLight = new THREE.DirectionalLight(pointcolor)
  pointLight.position.set(-40, 60, -10)
  // pointLight.intensity = 2
  pointLight.castShadow = true
  pointLight.shadow.camera.near = 2
  pointLight.shadow.camera.far = 4200
  pointLight.shadow.camera.top = 50
  pointLight.shadow.camera.bottom = -50
  pointLight.shadow.camera.right = 50
  pointLight.shadow.camera.left = -50
  pointLight.shadow.camera.visible = false
  // pointLight.shadow.map.width = 20

  pointLight.target = plane
  // pointLight.distance = 0
  // pointLight.angle = .4
  scene.add(pointLight)
  console.log('show data', pointLight.shadow)

  let sphereLight = new THREE.SphereGeometry(.2)
  let sphereLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.set(new THREE.Vector3(3, 20, 3))
  scene.add(sphereLightMesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      ambientColor: ambiColor,
      pointcolor: pointcolor,
      intensity: .5,
      distance: 0,
      exponent: 30,
      angle: .1,
      debug: false,
      castShadow: true,
      onlyShadow: false,
      target: 'Plane'
    }
    let gui = initGUI(controls)
    gui.addColor(controls, 'ambientColor').onChange(function (e) {
      ambientLight.color = new THREE.Color(e)
    })
    gui.addColor(controls, 'pointcolor').onChange(function (e) {
      pointLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'intensity', 100, 5000).onChange(function (e) {
      pointLight.intensity = e
    })
    gui.add(controls, 'distance', 0, 3000).onChange(function (e) {
      pointLight.distance = e
    })
    gui.add(controls, 'angle', 0, Math.PI).onChange(function (e) {
      pointLight.angle = e
    })
    gui.add(controls, 'exponent', 0, 5).onChange(function (e) {
      pointLight.decay = e
    })
    gui.add(controls, 'debug').onChange(function (e) {
      pointLight.shadow.camera.visible = e
    })
    gui.add(controls, 'castShadow').onChange(function (e) {
      pointLight.castShadow = e
    })
    gui.add(controls, 'onlyShadow').onChange(function (e) {
      pointLight.frustumCulled = e
    })
    gui.add(controls, 'target', ['Plane', 'Sphere', 'Cube']).onChange(function (e) {
      switch (e) {
        case 'Plane':
          pointLight.target = plane;
          break;
        case 'Sphere':
          pointLight.target = sphere;
          break;
        case 'Cube':
          pointLight.target = cube;
          break;
      }
    })
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls)
  }
}

function renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls) {
  let step = 0, invert = 1, phase = 0;
  function renderThree() {
    // cube.rotation.x += controls.rotationSpeed
    // cube.rotation.y += controls.rotationSpeed
    // cube.rotation.z += controls.rotationSpeed

    // step += controls.bouncingSpeed
    // sphere.position.x = 20 + (10 * (Math.cos(step)))
    // sphere.position.y = 2 + (10 * (Math.abs(Math.cos(step))))

    sphereLightMesh.position.y = +(27 * Math.sin(step / 3))
    sphereLightMesh.position.x = 10 + (26 * Math.cos(step / 3))
    sphereLightMesh.position.z = -8
    // pointLight.position.copy(sphereLightMesh.position)
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