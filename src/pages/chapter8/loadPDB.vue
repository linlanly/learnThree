<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';
let mesh
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1030)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = 10
  camera.position.y = 10
  camera.position.z = 10
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-20, -20, 60)
  spotLigth.intensity = 5000
  scene.add(spotLigth)

  let ambientLight = new THREE.DirectionalLight(0x0c0c0c)
  scene.add(ambientLight)

  mesh = new THREE.Object3D()
  let loader = new PDBLoader()
  loader.load('/src/assets/aspirin.pdb', function(geometrys) {
    let points = geometrys.geometryAtoms.attributes.position
    let colors = geometrys.geometryAtoms.attributes.color
    for(let i = 0; i < points.count; i++) {
      let sphereGeometry = new THREE.SphereGeometry(.2)
      let sphereMaterial = new THREE.MeshPhongMaterial({color: new THREE.Color(...getPoint(colors, i))})
      let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(...getPoint(points, i))
      mesh.add(sphere)
    }

    points = geometrys.geometryBonds.attributes.position
    for(let i = 0; i < points.count; i += 2) {
      let point1 = new THREE.Vector3().fromBufferAttribute(points, i)
      let point2 = new THREE.Vector3().fromBufferAttribute(points, i + 1)
      let path = new THREE.CatmullRomCurve3([point1, point2])

      let tube = new THREE.TubeGeometry(path, 1, .04)
      let material = new THREE.MeshPhongMaterial({color: 0xcccccc})
      mesh.add(new THREE.Mesh(tube, material))
    }
    scene.add(mesh)
  })

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let gui = initGUI()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function getPoint(points, index) {
  let size = points.itemSize
  let result = [points.getX(index)]
  if (size > 1) {
    result.push(points.getY(index))
  }
  if (size > 2) {
    result.push(points.getZ(index))
  }
  if (size > 3) {
    result.push(points.getW(index))
  }
  return result
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    if (mesh && mesh.rotation) {
      mesh.rotation.y += .01
      // mesh.rotation.y += .01
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