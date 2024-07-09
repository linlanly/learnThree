<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let cube, ground, sphere, pointLight
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer

  let planeGeometry = new THREE.PlaneGeometry(100, 100, 4, 4)
  let planeMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.y = -20
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(15, 20, 20)
  let sphereGeometry = new THREE.SphereGeometry(15, 15, 15)
  let groundGeometry = new THREE.PlaneGeometry(14, 14, 4, 4)

  let cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x7777ff })
  sphere = new THREE.Mesh(sphereGeometry, cubeMaterial)
  ground = new THREE.Mesh(groundGeometry, cubeMaterial)
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

  sphere.position.x = 0
  sphere.position.y = 3
  sphere.position.z = 2

  cube.position.copy(sphere.position)
  ground.position.copy(sphere.position)

  scene.add(cube)

  camera.position.x = -20
  camera.position.y = 30
  camera.position.z = 40
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-0, 60, 60)
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

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      opacity: cubeMaterial.opacity,
      transparent: cubeMaterial.transparent,
      visible: cubeMaterial.visible,
      side: 'front',
      emissive: cubeMaterial.emissive.getHex(),
      specular: cubeMaterial.specular.getHex(),
      shiness: cubeMaterial.shininess,

      color: cubeMaterial.color.getStyle(),
      wrapAround: false,
      wrapR: 1,
      wrapG: 1,
      wrapB: 1,
      selectedMesh: 'cube',
      metal: false
    }
    let gui = initGUI(controls)
    gui.add(controls, 'opacity', 0, 1).onChange(function (e) {
      cubeMaterial.opacity = e
    })
    gui.add(controls, 'transparent').onChange(function (e) {
      cubeMaterial.transparent = e
    })
    gui.addColor(controls, 'color').onChange(function (e) {
      cubeMaterial.color.setStyle(new THREE.Color(e))
    })
    gui.addColor(controls, 'emissive').onChange(function (e) {
      cubeMaterial.emissive = new THREE.Color(e)
    })
    gui.addColor(controls, 'specular').onChange(function (e) {
      cubeMaterial.specular = new THREE.Color(e)
    })
    gui.add(controls, 'shiness', 0, 20).onChange(function (e) {
      cubeMaterial.shininess = e
    })
    gui.add(controls, 'visible').onChange(function (e) {
      cubeMaterial.visible = e
    })
    gui.add(controls, 'side', ["front", "back", "double"]).onChange(function (e) {
      switch(e) {
        case 'front':
          cubeMaterial.side = THREE.FrontSide
          break;
        case 'back':
          cubeMaterial.side = THREE.BackSide
          break;
        case 'double':
          cubeMaterial.side = THREE.DoubleSide
          break;
      }
      cubeMaterial.needsUpdate = true
    })
    gui.add(controls, 'selectedMesh', ["cube", "sphere", "plane"]).onChange(function (e) {
      scene.remove(plane)
      scene.remove(cube)
      scene.remove(sphere)
      switch(e) {
        case 'cube':
          scene.add(cube)
          break;
        case 'sphere':
          scene.add(sphere)
          break;
        case 'plane':
          scene.add(ground)
          break;
      }
      cubeMaterial.needsUpdate = true
    })
    gui.add(controls, 'metal').onChange(function(e) {
      cubeMaterial.meta = e
      cubeMaterial.needsUpdate = true
    })
    gui.add(controls, 'wrapAround').onChange(function (e) {
      cubeMaterial.wrapAround = e
      cubeMaterial.needsUpdate = true
    })
    gui.add(controls, 'wrapR', 0, 1).onChange(function (e) {
      cubeMaterial.wrapRGB.x = e
    })
    gui.add(controls, 'wrapG', 0, 1).onChange(function (e) {
      cubeMaterial.wrapRGB.y = e
    })
    gui.add(controls, 'wrapB', 0, 1).onChange(function (e) {
      cubeMaterial.wrapRGB.z = e
    })
    

    let cvGui = gui.addFolder("Canvas renderer")
    cvGui.add(controls, 'wireframeLineJoin', ["round", "bevel", "miter"]).onChange(function (e) {
      cubeMaterial.wireframeLinejoin = e
    })
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    cube.rotation.y = step += .01
    sphere.rotation.y = step
    ground.rotation.y = step
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

function initGUI() {
  let gui = new GUI()
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