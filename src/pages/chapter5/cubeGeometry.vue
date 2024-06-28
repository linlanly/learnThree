<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, plane
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

  plane = createMesh(new THREE.BoxGeometry(10, 10, 10, 4, 4, 10))
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    let {width, height, depth, widthSegments, heightSegments, depthSegments} = plane.children[0].geometry.parameters
    controls = {
      width,
      height,
      depth,
      widthSegments,
      heightSegments,
      depthSegments,
      redraw() {
        scene.remove(plane)
        plane = createMesh(
          new THREE.BoxGeometry(controls.width, 
            controls.height, 
            controls.depth, 
            Math.round(controls.widthSegments), 
            Math.round(controls.heightSegments), 
            Math.round(controls.depthSegments)))
        scene.add(plane)
      }
    }

    let gui = initGUI()
        gui.add(controls, 'width', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'height', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'depth', 0, 40).onChange(controls.redraw);
        gui.add(controls, 'widthSegments', 0, 10).onChange(controls.redraw);
        gui.add(controls, 'heightSegments', 0, 10).onChange(controls.redraw);
        gui.add(controls, 'depthSegments', 0, 10).onChange(controls.redraw);
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    plane.rotation.x = step += .01
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