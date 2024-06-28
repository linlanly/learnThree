<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, plane, loadMesh
function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return new THREE.Mesh(geom, wireFrameMat)
}
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 60
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  plane = createMesh(new THREE.TorusKnotGeometry(10, 1, 64, 8, 2, 3, 1))
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let keys = ['radius', 'tube', 'radialSegments', 'tubularSegments', 'p', 'q']
    keys.forEach(key => {
      controls[key] = plane.geometry.parameters[key]
    })
    controls = Object.assign(controls, {
      redraw() {
        scene.remove(plane)
        plane = createMesh(new THREE.TorusKnotGeometry(
          controls.radius,
          controls.tube,
          Math.round(controls.radialSegments),
          Math.round(controls.tubularSegments),
          Math.round(controls.p),
          Math.round(controls.q),
          Math.round(controls.heightScale)
        ))
        scene.add(plane)
      },
      save() {
        let result = plane.toJSON()
        console.log('show data', result)
        localStorage.setItem('json', JSON.stringify(result))
      },
      load() {
        scene.remove(loadMesh)
        let json = localStorage.getItem('json')
        if (json) {
          let loadGeometry = JSON.parse(json)
          let loader = new THREE.ObjectLoader()
          loadMesh = loader.parse(loadGeometry)
          loadMesh.position.x -= 20
          scene.add(loadMesh)
        }
      }
    })

    let gui = initGUI()
    let btnGui = gui.addFolder('Save & Load')
    btnGui.add(controls, 'save')
    btnGui.add(controls, 'load')
    gui.add(controls, 'radius', -40, 40).onChange(controls.redraw)
    gui.add(controls, 'tube', -40, 40).onChange(controls.redraw)
    gui.add(controls, 'radialSegments', -40, 40).step(1).onChange(controls.redraw)
    gui.add(controls, 'tubularSegments', -40, 40).step(1).onChange(controls.redraw)
    gui.add(controls, 'p', -40, 40).step(1).onChange(controls.redraw)
    gui.add(controls, 'q', -40, 40).step(1).onChange(controls.redraw)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    plane.rotation.y += .01
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