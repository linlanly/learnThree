<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, plane
function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat])
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

  camera.position.x = -20
  camera.position.y = 30
  camera.position.z = 40
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  plane = createMesh(new THREE.IcosahedronGeometry(10, 0))
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = Object.assign(controls, {
      radius: 10,
      detail: 0,
      type: 'Icosadron',
      redraw() {
        scene.remove(plane)
        switch (controls.type) {
          case 'Icosadron':
            plane = createMesh(new THREE.IcosahedronGeometry(controls.radius, controls.detail))
            break;
          case 'Tetrahedron':
            plane = createMesh(new THREE.TetrahedronGeometry(controls.radius, controls.detail))
            break;
          case 'Octahedron':
            plane = createMesh(new THREE.OctahedronGeometry(controls.radius, controls.detail))
            break;
          case 'Dodecahedron':
            plane = createMesh(new THREE.DodecahedronGeometry(controls.radius, controls.detail))
            break;
          case 'Cusom':
            let vertices = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1]
            let indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1]
            plane = createMesh(new THREE.PolyhedronGeometry(vertices, indices, controls.radius, controls.detail))
            break;
        }
        scene.add(plane)
      }
    })

    let gui = initGUI()
        gui.add(controls, 'radius', -10, 40).step(1).onChange(controls.redraw);
        gui.add(controls, 'detail', -10, 40).step(1).onChange(controls.redraw);
        gui.add(controls, 'type', ['Icosadron', 'Tetrahedron', 'Octahedron', 'Dodecahedron', 'Cusom']).onChange(controls.redraw);
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    plane.rotation.x = step += .001
    plane.rotation.y = step += .001
    plane.rotation.z = step += .001
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