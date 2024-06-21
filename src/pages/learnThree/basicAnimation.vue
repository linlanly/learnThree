<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"

let controls, cube, sphere, cylinder;
let camera, tube, scene;
function onDocumentMouseDown(event) {
  let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, .5)
  vector = vector.unproject(camera)

  let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize())
  let intersects = raycaster.intersectObjects([sphere, cylinder, cube])
  if (intersects.length > 0) {
    intersects[0].object.material.opacity = .1
    console.log('show datainfo 2233', intersects[0].object)
  }
}

function onDocumentMouseMove(event) {
  if (controls.showRay) {

    let vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, .5)
    vector = vector.unproject(camera)

    let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize())
    let intersects = raycaster.intersectObjects([sphere, cylinder, cube])
    if (intersects.length > 0) {
      let points = []
      points.push(new THREE.Vector3(-30, 30.8, 30))
      points.push(intersects[0].point)

      let mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: .6})
      let tubeG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 60, .02)
      if (tube) scene.remove(tube)
      tube = new THREE.Mesh(tubeG, mat)
      scene.add(tube)
    }
  }
}

function createSomething() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1030)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0xeeeeee)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 15000
  scene.add(spotLigth)

  let ambientLight = new THREE.DirectionalLight(0x0c0c0c)
  scene.add(ambientLight)

  let planeG = new THREE.PlaneGeometry(60, 20, 1, 1)
  let planeM = new THREE.MeshLambertMaterial({ color: 0xffffff })
  let plane = new THREE.Mesh(planeG, planeM)
  plane.rotation.x = - .5 * Math.PI
  plane.position.x = 15

  scene.add(plane)

  cube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshPhongMaterial({ color: 0x223344, transparent: true }))
  cube.position.set(-9, 3)
  scene.add(cube)

  let sphereG = new THREE.SphereGeometry(4, 20, 20)
  let shpereM = new THREE.MeshLambertMaterial({ color: 0x7777ff, transparent: true })
  sphere = new THREE.Mesh(sphereG, shpereM)
  sphere.position.set(20, 0, 2)
  scene.add(sphere)

  let cylinderG = new THREE.CylinderGeometry(2, 2, 20)
  let cylinderM = new THREE.MeshLambertMaterial({ color: 0x77ff77, transparent: true })
  cylinder = new THREE.Mesh(cylinderG, cylinderM)
  cylinder.position.set(0, 0, 1)
  scene.add(cylinder)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    doc.addEventListener('mousedown', onDocumentMouseDown, false)
    doc.addEventListener('mousemove', onDocumentMouseMove, false)
    let stats = initStats()
    controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      scalingSpeed: .03,
      showRay: false
    }
    let gui = initGUI()
    Object.keys(controls).forEach(key => {
      gui.add(controls, key, -.5, .5)
    })
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0, scalingStep = 0;
  function renderThree() {
    cube.rotation.x += controls.rotationSpeed
    cube.rotation.y += controls.rotationSpeed
    cube.rotation.z += controls.rotationSpeed

    step += controls.bouncingSpeed
    sphere.position.x = 20 + (10 * Math.cos(step))
    sphere.position.y = 2 + (10 * Math.abs(Math.sin(step)))

    scalingStep += controls.scalingSpeed
    let scaleX = Math.abs(Math.sin(scalingStep / 4))
    let scaleY = Math.abs(Math.cos(scalingStep / 5))
    let scaleZ = Math.abs(Math.sin(scalingStep / 7))
    cylinder.scale.set(scaleX, scaleY, scaleZ)

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