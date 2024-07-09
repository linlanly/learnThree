<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, scene, spGroup, tubeMesh

function createMesh(geom) {
  let meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: .1})
  let wireMaterial = new THREE.MeshBasicMaterial()
  wireMaterial.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireMaterial])
}
function generatePoints(data) {
  spGroup = new THREE.Object3D()
  let material = new THREE.MeshBasicMaterial({color: 0xff0000})
  data.points.forEach(point => {
    let spGeom = new THREE.SphereGeometry(.2)
    let spMesh = new THREE.Mesh(spGeom, material)
    spMesh.position.copy(point)
    spGroup.add(spMesh)
  })
  scene.add(spGroup)

  let path = new THREE.CatmullRomCurve3(data.points)
  let tubeGeometry = new THREE.TubeGeometry(path, data.segments, data.radius, data.radiusSegments, data.closed)
  tubeMesh = createMesh(tubeGeometry)
  scene.add(tubeMesh)
}

function createSomething() {
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 130)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -50
  camera.position.y = 80
  camera.position.z = 50
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    controls = {
      numberOfPoints: 5,
      segments: 64,
      radius: 1,
      radiusSegments: 8,
      closed: false,
      points: [],
      newPoints() {
        let points = []
        for (let i = 0; i < controls.numberOfPoints; i++) {
          let randomX = -20 + Math.round(Math.random() * 50)
          let randomY = -20 + Math.round(Math.random() * 50)
          let randomZ = -20 + Math.round(Math.random() * 50)
          points.push(new THREE.Vector3(randomX, randomY, randomZ))
        }
        controls.points = points
        controls.redraw()
      },
      redraw() {
        scene.remove(spGroup)
        scene.remove(tubeMesh)
        
        let keyNo = ['redraw', 'newPoints', 'numberOfPoints']
        let data = {}
        Object.keys(controls).forEach(key => {
          if (!keyNo.includes(key)) {
            data[key] = controls[key]
          }
        })
        generatePoints(data)
      }
    }
    controls.newPoints()
    let gui = initGUI()
    gui.add(controls, 'newPoints')
    gui.add(controls, 'numberOfPoints', -10, 10).step(1).onChange(controls.newPoints)
    gui.add(controls, 'segments',-30, 130).step(1).onChange(controls.redraw)
    gui.add(controls, 'radius', -10, 10).step(1).onChange(controls.redraw)
    gui.add(controls, 'radiusSegments', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'closed').onChange(controls.redraw)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    // shape.rotation.y = step +=.01
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