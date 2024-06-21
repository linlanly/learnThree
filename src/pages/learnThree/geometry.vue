<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import {Face} from "three/addons/math/ConvexHull.js"
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

  planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
  plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 0
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)


  camera.position.x = -20
  camera.position.y = 25
  camera.position.z = 20
  camera.lookAt(new THREE.Vector3(5, 0, 0))

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true
  scene.add(spotLight)

  let ambientLight = new THREE.AmbientLight(0xff0000)
  scene.add(ambientLight)
  

  let step = 0
  let vertices = new Float32Array([
    1, 3, 1,
    1, 3, -1,
    1, -1, 1,
    1, -1, -1,
    -1, 3, -1,
    -1, 3, 1,
    -1, -1, -1,
    -1, -1, 1,
  ])
  let faces = [
    0, 2, 1,
    2, 3, 1,
    4, 6, 5,
    6, 7, 5,
    4, 5, 1,
    5, 0, 1,
    7, 6, 2,
    6, 3, 2,
    5, 7, 0,
    7, 2, 0,
    1, 3, 4,
    3, 6, 4,
  ]
  let geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geom.setIndex(faces)
  geom.computeVertexNormals()
  geom.normalizeNormals()

  let materials = [
    new THREE.MeshLambertMaterial({ opacity: 0.6, color: 0x0000ff, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  ]

  let mesh = SceneUtils.createMultiMaterialObject(geom, materials)
  mesh.children.forEach(function (e) {
    e.castShadow = true
  })
  scene.add(mesh)

  let controlPoints = []
  controlPoints.push(addControl(3, 5, 3))
  controlPoints.push(addControl(3, 5, 0))
  controlPoints.push(addControl(3, 0, 3))
  controlPoints.push(addControl(3, 0, 0))
  controlPoints.push(addControl(0, 5, 0))
  controlPoints.push(addControl(0, 5, 3))
  controlPoints.push(addControl(0, 0, 0))
  controlPoints.push(addControl(0, 0, 3))

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats(doc)
    doc.append(renderer.domElement)
    controls = new Controls()
    let gui = initGUI(controls)
    gui.add(new function () {
      this.clone = function () {
        let cloneGeometry = mesh.children[0].geometry.clone()
        let metrials = [
          new THREE.MeshLambertMaterial({ opacity: 0.6, color: 0x44ff44, transparent: true }),
          new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
        ]
        let mesh2 = SceneUtils.createMultiMaterialObject(cloneGeometry, metrials)
        mesh2.children.forEach(function(e) {
          e.castShadow = true
        })
        mesh2.translateX(5)
        mesh2.translateZ(5)
        mesh2.name = 'clone'
        if (getChildByName(scene, 'clone')) {
          scene.remove(getChildByName(scene, 'clone'))
        }
        scene.add(mesh2)
      }
    }, 'clone')
    for (let i = 0; i < 8; i++) {
      let f1 = gui.addFolder('Vertices' + (i + 1))
      f1.add(controlPoints[i], 'x', -10, 10)
      f1.add(controlPoints[i], 'y', -10, 10)
      f1.add(controlPoints[i], 'z', -10, 10)
    }
    renderThreeBefore(controlPoints, mesh)
  }
}

function renderThreeBefore(controlPoints, mesh) {
  function renderThree() {
    stats.update()
    let vertices = new Float32Array(8 * 3)
    for(let i = 0; i < 8; i++) {
      vertices[i * 3] = controlPoints[i].x
      vertices[i* 3 + 1] = controlPoints[i].y
      vertices[i * 3 + 2] = controlPoints[i].z
    }

    mesh.children.forEach(function(e) {
      e.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      e.geometry.computeVertexNormals()
    })
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

class Controls {
  rotationSpeed
  constructor() {
    this.rotationSpeed = 0.02
  }
}

function initGUI(controls) {
  let gui = new GUI()
  gui.add(controls, 'rotationSpeed', 0, 0.5)
  return gui
}

function addControl(x, y, z) {
  return {
    x,
    y,
    z
  }
}

function getChildByName(scene, name) {
  if (!Array.isArray(scene.children)) return null
  return scene.children.find(item => item.name === name)
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