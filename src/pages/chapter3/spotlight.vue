<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
let sphereLightMesh, pointLight, stopMovingLight = true
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  let axes = new THREE.AxesHelper(20)
  scene.add(axes)

  let planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1)
  let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 4
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(6, 6, 6)
  let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x002200 })
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true;
  cube.position.x =-15
  cube.position.y = 5
  cube.position.z = 0
  scene.add(cube)

  let sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  let sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff })
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true;
  sphere.position.x = 40
  sphere.position.y = 4
  sphere.position.z = 2
  scene.add(sphere)

  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.intensity = 10000
  spotLight.lookAt(plane)
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#00ff00'
  pointLight = new THREE.SpotLight(pointcolor)
  pointLight.position.set(-40, 60, -10)
  pointLight.intensity = 2000
  pointLight.castShadow = true
  pointLight.shadow.camera.near = 1
  pointLight.shadow.camera.far = 180

  pointLight.target = plane
  pointLight.distance = 0
  pointLight.angle = .4
  scene.add(pointLight)

  let sphereLight = new THREE.SphereGeometry(.2)
  let sphereLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.set(new THREE.Vector3(3, 0, 3))
  scene.add(sphereLightMesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      ambientColor: ambiColor,
      disableSpotlight: false,
      pointcolor: pointcolor,
      intensity: 1,
      distance: 100,
      exponent: 0,
      angle: .1,
      debug: false,
      castShadow: true,
      onlyShadow: false,
      target: 'Plane',
      stopMovingLight: false,
      width: 10,
      height: 10
    }
    let gui = initGUI(controls)
    gui.addColor(controls, 'ambientColor').onChange(function (e) {
      ambientLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'disableSpotlight').onChange(function (e) {
      spotLight.visible = e
    })
    gui.addColor(controls, 'pointcolor').onChange(function (e) {
      pointLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'intensity', 100, 5000).onChange(function (e) {
      pointLight.intensity = e
    })
    gui.add(controls, 'distance', 0, 3000).onChange(function (e) {
      pointLight.distance = e
    })
    gui.add(controls, 'angle', 0, Math.PI).onChange(function (e) {
      pointLight.angle = e
    })
    gui.add(controls, 'exponent', 0, 5).onChange(function (e) {
      pointLight.decay = e
    })
    gui.add(controls, 'debug').onChange(function (e) {
      pointLight.shadow.camera.visible = e
    })
    gui.add(controls, 'castShadow').onChange(function (e) {
      pointLight.castShadow = e
    })
    gui.add(controls, 'onlyShadow').onChange(function (e) {
      pointLight.frustumCulled  = e
    })
    gui.add(controls, 'width', 0, 1000).onChange(function (e) {
      pointLight.shadow.mapSize.width = e
    })
    gui.add(controls, 'height',0, 1000).onChange(function (e) {
      pointLight.shadow.mapSize.height  = e
    })
    gui.add(controls, 'target', ['Plane', 'Sphere', 'Cube']).onChange(function (e) {
      switch (e) {
        case 'Plane':
          pointLight.target = plane;
          break;
        case 'Sphere':
          pointLight.target = sphere;
          break;
        case 'Cube':
          pointLight.target = cube;
          break;
      }
    })
    gui.add(controls, 'stopMovingLight').onChange(function (e) {
      stopMovingLight = e
    })
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls)
  }
}

function renderThreeBefore(renderer, scene, camera, stats, cube, sphere, controls) {
  let step = 0, invert = 1, phase = 0;
  function renderThree() {
    cube.rotation.x += controls.rotationSpeed
    cube.rotation.y += controls.rotationSpeed
    cube.rotation.z += controls.rotationSpeed

    step += controls.bouncingSpeed
    sphere.position.x = 10 + (10 * (Math.cos(step)))
    sphere.position.y = 2 + (10 * (Math.abs(Math.cos(step))))

    if (stopMovingLight) {
      if (phase > 2 * Math.PI) {
        invert = invert * -1
        phase -= 2 * Math.PI
      } else {
        phase += controls.rotationSpeed
      }
      sphereLightMesh.position.z = +(7 * Math.sin(phase))
      sphereLightMesh.position.x = +(14 * Math.cos(phase))
      sphereLightMesh.position.y = 5

      if (invert < 0) {
        let pivot = 14
        sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot
      }
      pointLight.position.copy(sphereLightMesh.position)
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

function initGUI(controls) {
  let gui = new GUI()
  gui.add(controls, 'rotationSpeed', 0, 0.5)
  gui.add(controls, 'bouncingSpeed', 0, 0.5)
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