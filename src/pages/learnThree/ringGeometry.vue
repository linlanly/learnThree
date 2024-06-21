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

function test() {
  let url = '../../../../index.html'
  let content = url.search(/\/[^\.]/)
  console.log(content)
}
function createSomething() {
  test()
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

  plane = createMesh(new THREE.RingGeometry())
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    let keys = ['innerRadius', 'outerRadius', 'thetaSegments', 'phiSegments', 'thetaStart', 'thetaLength']
    console.log('??/?', plane.children[0].geometry.parameters)
    keys.forEach(key => {
      controls[key] = plane.children[0].geometry.parameters[key]
    })
    controls = Object.assign(controls, {
      redraw() {
        scene.remove(plane)
        plane = createMesh(
          new THREE.RingGeometry(controls.innerRadius, controls.outerRadius, 
            Math.floor(controls.thetaSegments), 
            Math.floor(controls.phiSegments),
            controls.thetaStart, 
            controls.thetaLength))
        scene.add(plane)
      }
    })

    let gui = initGUI()
        gui.add(controls, 'innerRadius', -10, 40).onChange(controls.redraw);
        gui.add(controls, 'outerRadius', -10, 40).onChange(controls.redraw);
        gui.add(controls, 'thetaSegments', -10, 10).onChange(controls.redraw);
        gui.add(controls, 'phiSegments', -10, 10).onChange(controls.redraw);
        gui.add(controls, 'thetaStart', -4 * Math.PI, 4 * Math.PI).onChange(controls.redraw);
        gui.add(controls, 'thetaLength', -4 * Math.PI, 4 * Math.PI).onChange(controls.redraw);
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