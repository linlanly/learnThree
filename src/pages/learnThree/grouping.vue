<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls, sphere, cube, group, boxMesh, arrow
function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat])
}

function createPlane(geom) {
  let meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: .5})
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat])
}
function setFromObject(object) {
  let box = new THREE.Box3()
  let v1 = new THREE.Vector3()
  object.updateMatrixWorld(true)
  box.makeEmpty()
  object.traverse(function(node) {
    if (node.geometry !== undefined && node.geometry.attributes && node.geometry.attributes.position !== undefined) {
      let vertices = node.geometry.attributes.position
      for(let i = 0; i < vertices.count; i++) {
        v1 = new THREE.Vector3(vertices.getX(i), vertices.getY(i), vertices.getZ(i))
        v1.applyMatrix4(node.matrixWorld)
        box.expandByPoint(v1)
      }
    }
  })
  return box
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

  let plane = createPlane(new THREE.PlaneGeometry(100, 140, 40, 40))
  plane.rotation.x = -.5 * Math.PI
  scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)



  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    controls = {
      cubePosX: 0,
      cubePosY: 3,
      cubePosZ: 10,
      spherePosX: 10,
      spherePosY: 5,
      spherePosZ: 0,
      groupPosX: 10,
      groupPosY: 5,
      groupPosZ: 0,
      grouping: false,
      rotate: false,
      groupScale: 1,
      cubeScale: 1,
      sphereScale: 1,
      redraw() {
        scene.remove(group)
        scene.remove(arrow)
        sphere = createMesh(new THREE.SphereGeometry(5, 10, 10))
        cube = createMesh(new THREE.BoxGeometry(6, 6, 6))

        sphere.position.set(controls.spherePosX, controls.spherePosY, controls.spherePosZ)
        cube.position.set(controls.cubePosX, controls.cubePosY, controls.cubePosZ)
        sphere.scale.set(controls.sphereScale, controls.sphereScale, controls.sphereScale)
        cube.scale.set(controls.cubeScale, controls.cubeScale, controls.cubeScale)

        group = new THREE.Group()
        group.position.set(controls.groupPosX, controls.groupPosY, controls.groupPosZ)
        group.scale.set(controls.groupScale, controls.groupScale, controls.groupScale)
        group.add(sphere)
        group.add(cube)
        scene.add(group)

        controls.positionBoundingBox()

        arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), group.position, 10, 0x0000ff)
        scene.add(arrow)
      },
      positionBoundingBox() {
        scene.remove(boxMesh)
        let box = setFromObject(group)
        let width = box.max.x - box.min.x
        let height = box.max.y - box.min.y
        let depth = box.max.z - box.min.z

        let bbox = new THREE.BoxGeometry(width, height, depth)
        boxMesh = new THREE.Mesh(bbox, new THREE.MeshBasicMaterial({
          color: 0xffffff,
          vertexColors: true,
          wireframe: true
        }))

        scene.add(boxMesh)
        boxMesh.position.x = (box.min.x + box.max.x) / 2
        boxMesh.position.y = (box.min.y + box.max.y) / 2
        boxMesh.position.z = (box.min.z + box.max.z) / 2
      }
    }

    let gui = initGUI()
    let sphereGui = gui.addFolder('sphere');
    ['spherePosX', 'spherePosY', 'spherePosZ', 'sphereScale'].forEach(key => {
      sphereGui.add(controls, key, -20, 20).onChange(controls.redraw)
    })
    let cubeGui = gui.addFolder('sphere');
    ['cubePosX', 'cubePosY', 'cubePosZ', 'cubeScale'].forEach(key => {
      cubeGui.add(controls, key, -20, 20).onChange(controls.redraw)
    })
    let groupGui = gui.addFolder('group');
    ['groupPosX', 'groupPosY', 'groupPosZ', 'groupScale'].forEach(key => {
      groupGui.add(controls, key, -20, 20).onChange(controls.redraw)
    })
    gui.add(controls, 'grouping').onChange(controls.redraw)
    gui.add(controls, 'rotate').onChange(controls.redraw)
    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    if (controls.rotate) {
      if (controls.grouping) {
        group.rotation.y += .01
      } else {
        sphere.rotation.y += .01
        cube.rotation.y += .01
      }
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