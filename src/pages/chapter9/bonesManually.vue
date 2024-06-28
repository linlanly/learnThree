<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import * as TWEEN from "@tweenjs/tween.js"
let mesh, clock, tween, scene, bones
function createSkin() {
  let segmentHeight = 3
  let segmentCount = 4
  let height = segmentHeight * segmentCount
  let halfHeight = height * .5

  let sizing = {
    segmentHeight,
    segmentCount,
    height,
    halfHeight
  }

  let geometry = createGeometry(sizing)
  let bones = createBones(sizing)
  mesh = createMesh(geometry, bones)

  mesh.scale.multiplyScalar(1)
  scene.add(mesh)
}

function createGeometry(sizing) {
  let geometry = new THREE.CylinderGeometry(5, 5, sizing.height, 18, sizing.segmentCount)
  let position = geometry.attributes.position
  let vertex = new THREE.Vector3()
  let skinIndices = []
  let skinWeights = []

  for(let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)

    let y = (vertex.y + sizing.halfHeight)
    console.log('show da', vertex.y, y, sizing.halfHeight)
    let skinIndex = Math.floor(y / sizing.segmentHeight)
    let skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight

    skinIndices.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }

  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))
  return geometry
}

function createBones(sizing) {
  bones = []

  let preBone = new THREE.Bone()
  bones.push(preBone)
  preBone.position.y = -sizing.halfHeight

  for(let i = 0; i < sizing.segmentCount; i++) {
    let bone = new THREE.Bone()
    bone.position.y = sizing.segmentHeight
    bones.push(bone)
    preBone.add(bone)
    preBone = bone
  }
  return bones
}

function createMesh(geometry, bones) {
  let material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x72534,
    flatShading: true,
    transparent: true,
    opacity: .5
  })
  let mesh = new THREE.SkinnedMesh(geometry, material)
  let skeleton = new THREE.Skeleton(bones)
  mesh.add(bones[0])
  mesh.bind(skeleton)
  let skeletionHelper = new THREE.SkeletonHelper(mesh)
  skeletionHelper.material.linewidth = 2
  scene.add(skeletionHelper)
  return mesh
}

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x000000)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  camera.position.x = 30
  camera.position.y = 40
  camera.position.z = 80
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ccffcc'
  let pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)

  let sizing = {
    halfHeight: 20,
    segmentHeight: 20
  }

  createSkin()

  // let mtlloader = new MTLLoader()
  // mtlloader.load('src/assets/hand.mtl', material => {
  //   let loader = new OBJLoader()
  //   loader.setMaterials(material)
  //   loader.load('/src/assets/hand.obj', function (loadMesh) {
  //     let material = new THREE.MeshLambertMaterial({color: 0xf0c8c9, skinning: true})
  //     let geometry = loadMesh.children[0].geometry
  //     let position = geometry.attributes.position
  //     let vertex = new THREE.Vector3()
  //     const skinIndices = []
  //     const skinWeights = []

  //     for(let i = 0; i < position.count; i++) {
  //       vertex.fromBufferAttribute(position, i)
  //       const y = y + sizing.halfHeight
  //       const skindex = Math.floor(y / sizing.segmentHeight)
  //       const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight
  //       skinIndices.push(skindex, skindex + 1, 0, 0)
  //       skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  //     }
  //     geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
  //     geometry.setAttribute('skinWeight', new THREE.Uint16BufferAttribute(skinWeights, 4))
  //     mesh = new THREE.SkinnedMesh(geometry, material)

  //     scene.add(mesh)
  //   })
  // })

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = .1
  function renderThree() {
    // if (mesh.skeleton.bones[0].rotation.x > .3 || mesh.skeleton.bones[0].rotation.x < -.3) {
    //   step = -step
    // }
    // for(let i = 0; i < mesh.skeleton.bones.length; i++) {
    //   mesh.skeleton.bones[i].rotation.x += step * Math.PI / 180
    // }
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