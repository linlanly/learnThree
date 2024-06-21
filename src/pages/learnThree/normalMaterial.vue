<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import {Face, VertexNode} from "three/addons/math/ConvexHull.js"
let controls, numberOfObject = ref(0), cube, sphere, plane
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer

  let groundGeom = new THREE.PlaneGeometry(100, 100, 4, 4)
  let groundMesh = new THREE.Mesh(groundGeom, new THREE.MeshBasicMaterial({color: 0x777777}))
  groundMesh.rotation.x = -Math.PI / 2
  groundMesh.position.y = -20
  scene.add(groundMesh)

  let sphereGeometry = new THREE.SphereGeometry(14, 20, 20)
  let cumbeGeometry = new THREE.BoxGeometry(15, 15, 15)
  let planeGeometry = new THREE.PlaneGeometry(14, 14, 4, 4)

  let meshMaterial = new THREE.MeshNormalMaterial()
  sphere = new THREE.Mesh(sphereGeometry, meshMaterial)
  cube = new THREE.Mesh(cumbeGeometry, meshMaterial)
  plane = new THREE.Mesh(planeGeometry, meshMaterial)

  sphere.position.x = 0;
  sphere.position.y = 3
  sphere.position.z = 2

  let points = sphere.geometry.attributes.position
  let normals =sphere.geometry.attributes.normal
  let count = points.count
  for(let f = 0; f < count; f++) {
    let dir = new THREE.Vector3(normals.getX(f), normals.getY(f), normals.getZ(f))
    const orgin = new THREE.Vector3(points.getX(f), points.getY(f), points.getZ(f))
    let arrow = new THREE.ArrowHelper(dir, orgin, 2, 0x3333ff)
    sphere.add(arrow)
  }

  cube.position.copy(sphere.position)
  plane.position.copy(sphere.position)
  scene.add(cube)

  camera.position.x = -20
  camera.position.y = 30
  camera.position.z = 40
  camera.lookAt(new THREE.Vector3(10, 0, 0))
  console.log('show data info', camera)

  let ambientLight = new THREE.AmbientLight(0x0c0c0c)
  scene.add(ambientLight)
  
  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 1000
  spotLight.castShadow = true
  scene.add(spotLight)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      opacity: meshMaterial.opacity,
      transparent: meshMaterial.transparent,
      visible: meshMaterial.visible,
      side: "front",
      wireframe: meshMaterial.wireframe,
      wireframeLineWidth: meshMaterial.wireframeLinewidth,
      selectedMesh: 'cube',
      shadow: 'flat'
    }

    let gui = initGUI()
    gui.add(controls, 'rotationSpeed', 0, .5)
    gui.add(controls, 'opacity', 0, 1).onChange(function (e) {
      meshMaterial.opacity = e
    })
    gui.add(controls, 'transparent').onChange(function (e) {
      meshMaterial.transparent = e
    })
    gui.add(controls, 'wireframe').onChange(function (e) {
      meshMaterial.wireframe = e
    })
    gui.add(controls, 'wireframeLineWidth', 0, 20).onChange(function (e) {
      meshMaterial.wireframeLinewidth = e
    })
    gui.add(controls, 'visible').onChange(function (e) {
      meshMaterial.visible = e
    })
    gui.add(controls, 'side', ["front", "back", "double"]).onChange(function (e) {
      switch(e) {
        case 'front':
          meshMaterial.side = THREE.FrontSide
          break;
        case 'back':
          meshMaterial.side = THREE.BackSide
          break;
        case 'double':
          meshMaterial.side = THREE.DoubleSide
          break;
      }
      meshMaterial.needsUpdate = true
    })
    gui.add(controls, 'shadow', ["flat", "smooth"]).onChange(function (e) {
      switch(e) {
        case 'flat':
          meshMaterial.shading = THREE.FlatShading
          break;
        case 'smooth':
          meshMaterial.shading = THREE.SmoothShading
          break;
      }

      let oldPos = sphere.position.clone()
      scene.remove(sphere)
      scene.remove(plane)
      scene.remove(cube)
      sphere = new THREE.Mesh(sphere.geometry.clone(), meshMaterial)
      cube = new THREE.Mesh(cube.geometry.clone(), meshMaterial)
      plane = new THREE.Mesh(plane.geometry.clone(), meshMaterial)

      sphere.position.copy(oldPos)
      cube.position.copy(oldPos)
      plane.position.copy(oldPos)

      switch(controls.selectedMesh) {
        case 'cube':
          scene.add(cube)
          break;
        case 'sphere':
          scene.add(sphere)
          break;
        case 'plane':
          scene.add(plane)
          break;
      }
      meshMaterial.needsUpdate = true
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
          scene.add(plane)
          break;
      }
      meshMaterial.needsUpdate = true
    })

    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    cube.rotation.x = step += .01
    sphere.rotation.x = step
    plane.rotation.x = step
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
<style scopyd>
.threeDoc {
  width: 100%;
  height: 100%;
}
</style>