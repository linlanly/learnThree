<script setup>
import * as THREE from 'three'
import {onMounted} from 'vue'
import * as Stats from 'stats.js'
import {GUI} from "three/addons/libs/lil-gui.module.min.js"
import {ref} from 'vue'
let number = ref(0)
let scene = null, planeGeometry = null, renderer, camera, plane, controls, stats

function createSomething() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)
  
  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
  plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)


  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0x666600)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true
  scene.add(spotLight)

  let ambientLight = new THREE.AmbientLight(0xff0000)
  scene.add(ambientLight)

  let cubeGeometry = new THREE.BoxGeometry(5, 8, 3)
  let material = new THREE.MeshLambertMaterial({color: 0x44ff44})
  let cube = new THREE.Mesh(cubeGeometry, material)
  cube.position.y = 4
  cube.castShadow = true
  scene.add(cube)

  controls = {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    positionX: 0,
    positionY: 4,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    visible: true,
    translate: function () {
      cube.translateX(controls.translateX)
      cube.translateY(controls.translateY)
      cube.translateZ(controls.translateZ)
      controls.positionX = cube.position.x
      controls.positionY = cube.position.y
      controls.positionZ = cube.position.z
    }
  }
  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats(doc)
    doc.append(renderer.domElement)
    let gui = initGUI(controls)
    let guiScale = gui.addFolder('scale')
    guiScale.add(controls, 'scaleX', 0, 5)
    guiScale.add(controls, 'scaleY', 0, 5)
    guiScale.add(controls, 'scaleZ', 0, 5)

    
    let guiPosition = gui.addFolder('position')

    let positionInfo = {
      x: guiPosition.add(controls, 'positionX', -10, 10),
      y: guiPosition.add(controls, 'positionY', -4, 20),
      z: guiPosition.add(controls, 'positionZ', -10, 10)
    }

    Object.keys(positionInfo).forEach(key => {
      positionInfo[key].listen()
      positionInfo[key].onChange(function() {
        cube.position[key] = controls['position' + key.toUpperCase()]
      })
    })

    let guiRotation = gui.addFolder('rotation')
    guiRotation.add(controls, 'rotationX', -4, 4)
    guiRotation.add(controls, 'rotationY', -4, 4)
    guiRotation.add(controls, 'rotationZ', -4, 4)

    
    let guiTranslate = gui.addFolder('translate')
    guiTranslate.add(controls, 'translateX', -10, 10)
    guiTranslate.add(controls, 'translateY', -10, 10)
    guiTranslate.add(controls, 'translateZ', -10, 10)
    guiTranslate.add(controls, 'translate')

    gui.add(controls, 'visible')
    renderThreeBefore(cube)
  }
}

function renderThreeBefore(cube) {
  function renderThree() {
    stats.update()
    cube.visible = controls.visible
    cube.rotation.x = controls.rotationX
    cube.rotation.y = controls.rotationY
    cube.rotation.z = controls.rotationZ

    cube.scale.set(controls.scaleX, controls.scaleY, controls.scaleZ)
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)
  }
  renderThree()
}
function initStats(doc) {
  let statsObj = new Stats()
  statsObj.setMode(0)
  statsObj.domElement.style.position = 'absolute'
  statsObj.domElement.style.left = '0'
  statsObj.domElement.style.top = '0'
  doc.append(statsObj.domElement)
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
  position: absolute;
  margin: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.controlBox {
  position: absolute;
  top: 50px;
  background-color: black;
  color: white;
  right: 15px;
  padding: 10px;
}
</style>