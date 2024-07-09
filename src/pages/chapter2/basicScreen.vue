<script setup>
import * as THREE from 'three'
import {onMounted} from 'vue'
import * as Stats from 'stats.js'
import {GUI} from "three/addons/libs/lil-gui.module.min.js"
import {AsciiEffect} from 'three/examples/jsm/effects/AsciiEffect'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js'
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries} from 'three/examples/jsm/geometries/ParametricGeometries.js'
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import {ref} from 'vue'
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
  // let planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
  plane = new THREE.Mesh(planeGeometry)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)


  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true
  scene.add(spotLight)

  let ambientLight = new THREE.AmbientLight(0xff0000)
  scene.add(ambientLight)
  scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0x0000ff})

  // scene.fog = new THREE.FogExp2(0xffff00, 0.015)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats(doc)
    doc.append(renderer.domElement)
    controls = new Controls()
    initGUI(controls)
    addGeometries()
    renderThreeBefore()
  }
}

function renderThreeBefore() {
  function renderThree() {
    stats.update()
    scene.traverse(function(e) {
      if (e instanceof THREE.Mesh && e !== plane) {
        e.rotation.x += controls.rotationSpeed
        e.rotation.y += controls.rotationSpeed
        e.rotation.z += controls.rotationSpeed
      }
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

function addCubeElement() {
  let cubeSize = Math.ceil(Math.random() * 3)
  let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
  let cubeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff})
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true
  cube.name = 'cube-' + scene.children.length
  cube.position.set(Math.round(Math.random() * planeGeometry.parameters.width), Math.round(Math.random() * 5), -20 + Math.round(Math.random() * planeGeometry.parameters.height))
  scene.add(cube)
  number.value = scene.children.length
}

function removeCubeElement() {
  let allChildren = scene.children
  let lastObject = allChildren[allChildren.length - 1]
  if (lastObject instanceof THREE.Mesh) {
    scene.remove(lastObject)
  }
  number.value = scene.children.length
}

function outputObjects() {
  console.log(scene.children)
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

function addGeometries() {
  let geoms = []
  geoms.push(new THREE.CylinderGeometry(3, 2, 4))
  geoms.push(new THREE.BoxGeometry(2, 3, 2))
  geoms.push(new THREE.SphereGeometry(4))
  geoms.push(new THREE.IcosahedronGeometry(4))

  let points = [
    new THREE.Vector3(2, 2, 2),
    new THREE.Vector3(2, 2, -2),
    new THREE.Vector3(-2, 2, -2),
    new THREE.Vector3(2, -2, 2),
    new THREE.Vector3(2, -2, -2),
    new THREE.Vector3(-2, -2, 2),
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(-2, 2, 2)
  ]
  geoms.push(new ConvexGeometry(points))

  // let pts = []
  // let detail = .1
  // let radius = 3
  // for (let i = 0; i < Math.PI; i += detail) {
  //   pts.push(new THREE.Vector3(Math.cos(i) * radius, 0, Math.sin(i) * radius))
  // }
  // geoms.push(new THREE.LatheGeometry(pts, 12))
  const points1 = [];
for ( let i = 0; i < 10; i ++ ) {
	points1.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 1 + 2, ( i - 5 ) * 0.2 ) );
}
            geoms.push(new THREE.LatheGeometry( points1, 5 ));

  geoms.push(new THREE.OctahedronGeometry(3))

  geoms.push(new ParametricGeometry(ParametricGeometries.mobius3d, 20, 10))
  geoms.push(new THREE.TetrahedronGeometry(3))
  geoms.push(new THREE.TorusGeometry(2.1, 4, 3, 14))
  geoms.push(new THREE.TorusKnotGeometry(3, 0.5, 50, 20))

  let j = 0;
  for(let i = 0; i < geoms.length; i++) {
    let metrials = [
      new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff, shading: THREE.FlatShading}),
      new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
    ]
    let mesh = SceneUtils.createMultiMaterialObject(geoms[i], metrials)
    mesh.traverse(function(e) {
      e.castShadow = true
    })
    mesh.position.set(-8 +(i % 4) * 12, 4, -8 + (j * 12))
    if ((i + 1) % 4 == 0) {
      j++
    }
    scene.add(mesh)
  }
}
onMounted(() => createSomething())
</script>
<template>
  <div id="threeDoc"></div>
  <div class="controlBox">
    <button @click="addCubeElement()">add cube</button><br>
    <button @click="removeCubeElement()">remove cube</button><br>
    <button @click="outputObjects">print scene info</button><br>
    show scene content: {{ number }}
  </div>
</template>
<style scoped>
.threeDoc {
  position: absolute;
  margin: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.controlBox {
  position: absolute;
  top: 50px;
  background-color: black;
  color: white;
  right: 15px;
  padding: 10px;
}
</style>