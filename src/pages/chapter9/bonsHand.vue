<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import * as TWEEN from "@tweenjs/tween.js"
import handJson from "@/assets/hand-1.json"
let mesh, scene

function createBones() {
  let tree = {
    name: 'Bone.000',
    children: [
      {
        name: 'Bone',
        children: [
          {
            name: 'dedo1.004', children: [
              {
                name: 'Controlador', children: []
              },
              {
                name: 'dedo1', children: [
                  {
                    name: 'dedo2', children: [
                      {
                        name: 'dedo3', children: []
                      }
                    ]
                  }
                ]
              }]
          },
          {
            name: 'dedo1.005', children: [
              {
                name: 'Controlador.000', children: []
              },
              {
                name: 'dedo1.000', children: [
                  {
                    name: 'dedo2.000', children: [
                      {
                        name: 'dedo3.000', children: []
                      }
                    ]
                  }
                ]
              }]
          },
          {
            name: 'dedo1.006', children: [
              {
                name: 'Controlador.001', children: []
              },
              {
                name: 'dedo1.001', children: [
                  {
                    name: 'dedo2.001', children: [
                      {
                        name: 'dedo3.001', children: []
                      }
                    ]
                  }
                ]
              }]
          },
          {
            name: 'dedo1.007', children: [
              {
                name: 'Controlador.002', children: []
              },
              {
                name: 'dedo1.002', children: [
                  {
                    name: 'dedo2.002', children: [
                      {
                        name: 'dedo3.002', children: []
                      }
                    ]
                  }
                ]
              }]
          },
          {
            name: 'dedo1.008', children: [
              {
                name: 'Controlador.003', children: []
              },
              {
                name: 'dedo1.003', children: [
                  {
                    name: 'dedo2.003', children: [
                      {
                        name: 'dedo3.003', children: []
                      }
                    ]
                  }
                ]
              }]
          },
          {
            name: 'dedo1.009', children: [{
              name: 'dedo1.010', children: []
            }, {
              name: 'Muneca Lados', children: []
            }]
          }
        ]
      }
    ]
  }
  // let bones = [], handBones = handJson.bones
  // let preBone = dealBone('Bone.000')
  // bones.push(preBone)
  // let nextBone = dealBone('Bone')
  // preBone.add(nextBone)
  // preBone = nextBone
  // console.log("show", preBone)
  // for (let i = 0; i < handBones.length; i++) {
  //   if (handBones[i].name !== 'Bone') {
  //     let bone = new THREE.Bone()
  //     bone.position.x = handBones[i].pos[0]
  //     bone.position.y = handBones[i].pos[1]
  //     bone.position.z = handBones[i].pos[2]
  //     bones.push(bone)
  //     preBone.add(bone)
  //     preBone = bone
  //   }
  // }
  let newBones = []
  dealTree(tree, newBones)
  console.log('show deal data', newBones)
  return newBones
}

function dealTree(obj, bonds, preBone = null) {
  let bone = dealBone(obj.name)
  bonds.push(bone)
  if (preBone) {
    preBone.add(bone)
  }
  if (obj.children.length < 1) {
    return
  }
  for(let i = 0; i < obj.children.length; i++) {
    dealTree(obj.children[i], bonds, bone)
  }
}

function dealBone(name) {
  let handBones = handJson.bones
  let data = handBones.find(item => item.name === name)
  let bone = new THREE.Bone()
  bone.position.x = data.pos[0]
  bone.position.y = data.pos[1]
  bone.position.z = data.pos[2]
  bone.name = name
  return bone
}
function createSomething() {
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x000000)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  camera.position.x = 3
  camera.position.y = 4
  camera.position.z = 4
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
  let mtlloader = new MTLLoader()
  mtlloader.load('src/assets/hand.mtl', material => {
    let loader = new OBJLoader()
    loader.setMaterials(material)
    loader.load('/src/assets/hand.obj', function (loadMesh) {
      console.log('show data', loadMesh)
      let material = new THREE.MeshLambertMaterial({ color: 0xf0c8c9, skinning: true })
      let geometry = loadMesh.children[0].geometry
      geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(handJson.skinIndices, 4))
      geometry.setAttribute('skinWeight', new THREE.Uint16BufferAttribute(handJson.skinWeights, 4))

      let bones = createBones()
      mesh = new THREE.SkinnedMesh(geometry, material)

      let skeleton = new THREE.Skeleton(bones)
      skeleton.calculateInverses()
      skeleton.computeBoneTexture()
      skeleton.dispose()
      mesh.bind(skeleton)
      mesh.add(bones[0])
      scene.add(mesh)
    })
  })

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