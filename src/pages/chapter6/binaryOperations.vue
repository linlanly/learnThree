<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import THREEBSP from '@/assets/threeBSP.js'
let controls = {}, scene, result

function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial({transparency: true, opacity: .5, wireframeLinewidth: .5, wireframe: true})

  return new THREE.Mesh(geom, wireFrameMat)
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

  camera.position.x = -30;
  camera.position.y = 50;
  camera.position.z = 50;
  camera.lookAt(new THREE.Vector3(10, -20, 0));

  let sphere1 = createMesh(new THREE.SphereGeometry(5, 20, 30))
  sphere1.position.x = -2

  let sphere2 = createMesh(new THREE.SphereGeometry(5, 20, 30))
  sphere2.position.set(3, 0, 0)

  let cube = createMesh(new THREE.BoxGeometry(5, 5, 5))
  cube.position.x = -7

  scene.add(sphere1)
  scene.add(sphere2)
  scene.add(cube)

  let doc = document.getElementById('threeDoc')


  if (doc) {
    let stats = initStats()
    controls = {
      spherePosX: sphere1.position.x,
      spherePosY: sphere1.position.y,
      spherePosZ: sphere1.position.z,
      sphereScale: 1,
      sphere2PosX: sphere2.position.x,
      sphere2PosY: sphere2.position.y,
      sphere2PosZ: sphere2.position.z,
      sphere2Scale: 1,
      cubePosX: cube.position.x,
      cubePosY: cube.position.y,
      cubePosZ: cube.position.z,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      actionCube: "subtract",
      actionSphere: "subtract",
      hideWireframes: false,
      rotateResult: false,
      redraw() {
        setTimeout(() => {
          scene.remove(result)
          let sphere1bsp = new THREEBSP(sphere1)
          let sphere2bsp = new THREEBSP(sphere2)
          let cubebsp = new THREEBSP(cube)

          let resultbsp;

          switch(controls.actionSphere) {
            case "subtract":
              resultbsp = sphere1bsp.subtract(sphere2bsp)
              break;
            case "intersect":
              resultbsp = sphere1bsp.intersect(sphere2bsp)
              break;
            case "union":
              resultbsp = sphere1bsp.union(sphere2bsp)
              break;
            case "none":
          }

          if (!resultbsp) resultbsp = sphere1bsp
          
          switch(controls.actionCube) {
            case "subtract":
              resultbsp = resultbsp.subtract(cubebsp)
              break;
            case "intersect":
              resultbsp = resultbsp.intersect(cubebsp)
              break;
            case "union":
              resultbsp = resultbsp.union(cubebsp)
              break;
            case "none":
          }
          if (controls.actionCube === 'none' && controls.actionSphere === 'none') {

          } else {
            result = resultbsp.toMesh()
            result.geometry.computeFaceNormals()
            result.geometry.computeVertexNormals()
            scene.add(result)
          }
        }, 0);
      }
    }
    let gui = initGUI()
    let guiSphere1 = gui.addFolder('Sphere1')
    guiSphere1.add(controls, 'spherePosX', -15, 15).onChange(function() {
      sphere1.position.set(controls.spherePosX, controls.spherePosY, controls.spherePosZ)
    })
    guiSphere1.add(controls, 'spherePosY', -15, 15).onChange(function() {
      sphere1.position.set(controls.spherePosX, controls.spherePosY, controls.spherePosZ)
    })
    guiSphere1.add(controls, 'spherePosZ', -15, 15).onChange(function() {
      sphere1.position.set(controls.spherePosX, controls.spherePosY, controls.spherePosZ)
    })
    guiSphere1.add(controls, 'sphereScale', -15, 15).onChange(function(e) {
      sphere1.scale.set(e, e, e)
    })

    let guiSphere2 = gui.addFolder('Sphere2')
    guiSphere2.add(controls, 'sphere2PosX', -15, 15).onChange(function() {
      sphere2.position.set(controls.sphere2PosX, controls.sphere2PosY, controls.sphere2PosZ)
    })
    guiSphere2.add(controls, 'sphere2PosY', -15, 15).onChange(function() {
      sphere2.position.set(controls.sphere2PosX, controls.sphere2PosY, controls.sphere2PosZ)
    })
    guiSphere2.add(controls, 'sphere2PosZ', -15, 15).onChange(function() {
      sphere2.position.set(controls.sphere2PosX, controls.sphere2PosY, controls.sphere2PosZ)
    })
    guiSphere2.add(controls, 'sphere2Scale', -15, 15).onChange(function(e) {
      sphere2.scale.set(e, e, e)
    })
    guiSphere2.add(controls, 'actionCube', ["subtract", "intersect", "union", "none"])
    
    let guiCube = gui.addFolder('cube')
    guiCube.add(controls, 'cubePosX', -15, 15).onChange(function() {
      cube.position.set(controls.cubePosX, controls.cubePosY, controls.cubePosZ)
    })
    guiCube.add(controls, 'cubePosY', -15, 15).onChange(function() {
      cube.position.set(controls.cubePosX, controls.cubePosY, controls.cubePosZ)
    })
    guiCube.add(controls, 'cubePosZ', -15, 15).onChange(function() {
      cube.position.set(controls.cubePosX, controls.cubePosY, controls.cubePosZ)
    })
    guiCube.add(controls, 'scaleX', -15, 15).onChange(function(e) {
      cube.scale.x = e
    })
    guiCube.add(controls, 'scaleY', -15, 15).onChange(function(e) {
      cube.scale.y = e
    })
    guiCube.add(controls, 'scaleZ', -15, 15).onChange(function(e) {
      cube.scale.z = e
    })
    guiCube.add(controls, 'actionCube', ["subtract", "intersect", "union", "none"])

    gui.add(controls, 'redraw')
    gui.add(controls, 'rotateResult')
    gui.add(controls, 'hideWireframes').onChange(function() {
      if (controls.hideWireframes) {
        sphere1.material.visible = false
        sphere2.material.visible = false
        cube.material.visible = false
      } else {
        sphere1.material.visible = true
        sphere2.material.visible = true
        cube.material.visible = true
      }
    })
    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    // shape.rotation.y = step +=.01
    if (controls.rotateResult && result) {
      result.rotation.y += .04
      result.rotation.z -= .05
    }
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