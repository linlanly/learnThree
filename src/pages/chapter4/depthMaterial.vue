<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, numberOfObject = ref(0)
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
  camera.lookAt(scene.position)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = {
      cameraNear: camera.near,
      cameraFar: camera.far,
      rotationSpeed: .02,
      numberOfObject: numberOfObject.value,
      removeCube: function() {
        let allChildren = scene.children
        let lastObject = allChildren[allChildren.length - 1]
        if (lastObject instanceof THREE.Mesh) {
          scene.remove(lastObject)
          numberOfObject.value = scene.children.length
        }
      },
      addCube: function() {
        let cubeSize = Math.ceil(3 + Math.random() * 3)
        let cumbeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
        let baseMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, blending: THREE.MultiplyBlending})
        let depthMaterial = new THREE.MeshDepthMaterial()
        let cube = SceneUtils.createMultiMaterialObject(cumbeGeometry, [baseMaterial, depthMaterial])
        cube.castShadow = true

        cube.position.x = -100 + Math.round(Math.random() * 100)
        cube.position.y = Math.round(Math.random() * 10)
        cube.position.z = -100 + Math.round(Math.random() * 150)

        scene.add(cube)
        numberOfObject.value += 1
      },
      outputObject: function() {
        console.log(scene.children)
      }
    }

    let gui = initGUI()
    gui.add(controls, 'rotationSpeed', 0, .5)
    gui.add(controls, 'addCube')
    gui.add(controls, 'removeCube')
    gui.add(controls, 'cameraNear', 0, 50).onChange(function(e) {
      camera.near = e
    })
    gui.add(controls, 'cameraFar', 50, 200).onChange(function(e) {
      camera.far = e
    })

    let i = 0;
    while(i < 10) {
      controls.addCube();
      i++
    }

    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    scene.traverse(function(e) {
      if (e instanceof THREE.Mesh) {
        e.rotation.x += controls.rotationSpeed
        e.rotation.y += controls.rotationSpeed
        e.rotation.z += controls.rotationSpeed
      }
    })
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