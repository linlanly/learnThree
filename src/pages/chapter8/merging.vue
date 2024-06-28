<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
let controls, sphere, cube, cubeMaterial
function addCube() {
  let cubeSize = 1
  let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true

  cube.position.x = -60 + Math.round(Math.random() * 100)
  cube.position.y = Math.round(Math.random() * 10)
  cube.position.z = -15 + Math.round(Math.random() * 175)

  return cube
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

  camera.position.x = -50
  camera.position.y = 40
  camera.position.z = 50
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  cubeMaterial = new THREE.MeshNormalMaterial()

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = {
      cameraNear: camera.near,
      cameraFar: camera.far,
      rotationSpeed: .02,
      combined: false,
      number: 500,
      redraw() {
        let toRemove = []
        scene.traverse(function(e) {
          if (e instanceof THREE.Mesh) toRemove.push(e)
        })
        toRemove.forEach(function(e) {
          scene.remove(e)
        })
        if (controls.combined) {
          let cubes = []
          for(let i = 0; i < controls.number; i++) {
            let cubeMesh = addCube()
            cubeMesh.updateMatrix()
            cubes.push(cubeMesh.geometry.applyMatrix4(cubeMesh.matrix))
          }
          let geometry = BufferGeometryUtils.mergeGeometries(cubes, true)
          scene.add(new THREE.Mesh(geometry, cubeMaterial))
        } else {
          for (let i = 0; i < controls.number; i++) {
            scene.add(addCube())
          }
        }
      }
    }

    let gui = initGUI()
    gui.add(controls, 'number', 0, 200000).onChange(controls.redraw)
    gui.add(controls, 'combined').onChange(controls.redraw)
    gui.add(controls, 'redraw')
    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let rotation = 0;
  function renderThree() {
    rotation += .0005
    camera.position.x = Math.sin(rotation) * 50 - 50
    camera.position.z = Math.sin(rotation) * 50 + 50
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