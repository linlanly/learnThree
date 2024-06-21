<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { ref } from 'vue'
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

  planeGeometry = new THREE.PlaneGeometry(180, 180)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 0
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  camera.position.x = 120
  camera.position.y = 60
  camera.position.z = 80
  camera.lookAt(scene.position)

  let spotLight = new THREE.DirectionalLight(0x555555, 0.7)
  spotLight.position.set(-20, 40, 60)
  scene.add(spotLight)

  let ambientLight = new THREE.AmbientLight(0x888888)
  scene.add(ambientLight)

  let lookGeom = new THREE.SphereGeometry(2)
  let lookMesh = new THREE.Mesh(lookGeom, new THREE.MeshLambertMaterial({color: 0xff0000}))
  scene.add(lookMesh)

  let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  for (let j = 0; j < planeGeometry.parameters.height / 5; j++) {
    for (let i = 0; i < planeGeometry.parameters.width / 5; i++) {
      let rnd = Math.random() * .75 + .25
      let cubeMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(rnd, 0, 0) })
      let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

      cube.position.z = -(planeGeometry.parameters.height / 2) + 2 + j * 5
      cube.position.x = -(planeGeometry.parameters.width / 2) + 2 + i * 5
      cube.position.y = 2
      scene.add(cube)
    }
  }

  controls = {
    perspective: "Perspective",
    switchCamera: function () {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500)
        this.perspective = 'Orthographic'
      } else {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)
        this.perspective = 'Perspective'
      }
      camera.position.x = 120
      camera.position.y = 60
      camera.position.z = 180
      camera.lookAt(scene.position)
    }
  }

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats(doc)
    doc.append(renderer.domElement)
    let gui = initGUI(controls)
    gui.add(controls, 'switchCamera')
    gui.add(controls, 'perspective').listen()
    renderThreeBefore(lookMesh)
  }
}

function renderThreeBefore(lookMesh) {
  let step = 0
  function renderThree() {
    stats.update()
    step += .002
    if (camera instanceof THREE.Camera) {
      let x = 10 + 100 * Math.sin(step)
      camera.lookAt(new THREE.Vector3(x, 10, 0))
      lookMesh.position.copy(new THREE.Vector3(x, 10, 0))
    }
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
#threeDoc {
  position: absolute;
  margin: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>