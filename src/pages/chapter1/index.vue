<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let sphereLightMesh, pointLight
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  let cubeMaterial = new THREE.MeshLambertMaterial({ map: skin })
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
  sphere.position.y = 4
  sphere.position.z = 2
  scene.add(sphere)

  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)

  let sphereLight = new THREE.SphereGeometry(.2)
  let sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25})
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.set(new THREE.Vector3(-30, 0, 3))
  // scene.add(sphereLightMesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      ambientColor: ambiColor,
      disableSpotlight: false,
      pointcolor: pointcolor,
      intensity: 1,
      distance: 2
    }
    let gui = initGUI(controls)
    gui.addColor(controls, 'ambientColor').onChange(function (e) {
      ambientLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'disableSpotlight').onChange(function (e) {
      spotLight.visible = e
    })
    gui.addColor(controls, 'pointcolor').onChange(function (e) {
      pointLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'intensity', 0, 20).onChange(function (e) {
      pointLight.intensity = e
    })
    gui.add(controls, 'distance', 0, 50).onChange(function (e) {
      pointLight.distance = e
    })
    // let effect = new AsciiEffect(renderer)
    // effect.setSize(window.innerWidth, window.innerHeight)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls)
  }
}

function renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls) {
  let step = 0, invert = 1, phase = 0, first = true;
  function renderThree() {
    cube.rotation.x += controls.rotationSpeed
    cube.rotation.y += controls.rotationSpeed
    cube.rotation.z += controls.rotationSpeed

    step += controls.bouncingSpeed
    sphere.position.x = 20 + (10 * (Math.cos(step)))
    sphere.position.y = 2 + (10 * (Math.abs(Math.cos(step))))

    if (first) {
      
    if (phase > 2 * Math.PI) {
      invert = invert * -1
      phase -= 2 * Math.PI
    } else {
      phase += controls.rotationSpeed
    }
    sphereLightMesh.position.z = +(7 * Math.sin(phase))
    sphereLightMesh.position.x = -(7 * Math.cos(phase))
    sphereLightMesh.position.y = 5

    if (invert < 0) {
      let pivot = 14
      sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot
    }
    pointLight.position.copy(sphereLightMesh.position)
    first = false
    }
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

class Controls {
  rotationSpeed
  bouncingSpeed
  constructor() {
    this.rotationSpeed = 0.02
    this.bouncingSpeed = 0.03
  }
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