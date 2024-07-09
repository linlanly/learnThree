<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let sphereLightMesh, pointLight
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

  let textureGrass = new THREE.TextureLoader().load("src/assets/grasslight-big.jpg")
  textureGrass.wrapS = THREE.RepeatWrapping
  textureGrass.wrapT = THREE.RepeatWrapping
  textureGrass.repeat.set(4, 4)

  let planeGeometry = new THREE.PlaneGeometry(1000, 200, 20, 20)
  let planeMaterial = new THREE.MeshLambertMaterial({ map: textureGrass })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = -5
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  let cubeGeometry = new THREE.BoxGeometry(6, 6, 6)
  let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x334400 })
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.castShadow = true;
  cube.position.x = -4
  cube.position.y = 3
  cube.position.z = 0
  scene.add(cube)

  let sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  let sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff })
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true;
  sphere.position.x = 20
  sphere.position.y = 0
  sphere.position.z = 2
  scene.add(sphere)

  camera.position.x = -35
  camera.position.y = 30
  camera.position.z = 25
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  let ambiColor = '#ffffff'
  let ambientLight = new THREE.SpotLight(ambiColor)
  ambientLight.position.set(-40, 60, -10)
  ambientLight.intensity = 1000
  ambientLight.lookAt(plane)
  scene.add(ambientLight)

  let target = new THREE.Object3D()
  target.position.set(new THREE.Vector3(5, 0, 0))

  let hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6)
  hemiLight.position.set(0, 500, 0)
  scene.add(hemiLight)

  let pointcolor = '#ffffff'
  pointLight = new THREE.DirectionalLight(pointcolor)
  pointLight.position.set(30, 10, -50)
  // pointLight.intensity = 2
  pointLight.castShadow = true
  pointLight.shadow.camera.near = .1
  pointLight.shadow.camera.far = 200
  pointLight.shadow.camera.top = 50
  pointLight.shadow.camera.bottom = -50
  pointLight.shadow.camera.right = 50
  pointLight.shadow.camera.left = -50
  pointLight.shadow.camera.visible = false
  pointLight.shadow.bias = 0.003

  pointLight.target = plane
  // pointLight.distance = 0
  // pointLight.angle = .4
  scene.add(pointLight)

  let sphereLight = new THREE.SphereGeometry(.2)
  let sphereLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.set(new THREE.Vector3(3, 20, 3))
  scene.add(sphereLightMesh)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    let controls = {
      rotationSpeed: .02,
      bouncingSpeed: .03,
      hemisphere: true,
      color: '0x00ff00',
      skyColor: '0x0000ff',
      intensity: .6
    }
    let gui = initGUI(controls)
    gui.add(controls, 'hemisphere').onChange(function (e) {
      if (!e) {
        hemiLight.intensity = 0
      } else {
        hemiLight.intensity = controls.intensity
      }
    })
    gui.addColor(controls, 'color').onChange(function (e) {
      hemiLight.groundColor = new THREE.Color(e)
    })
    gui.addColor(controls, 'skyColor').onChange(function (e) {
      hemiLight.color = new THREE.Color(e)
    })
    gui.add(controls, 'intensity', 0, 200000).onChange(function (e) {
      hemiLight.intensity = e
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
    sphere.position.x = 20 + (10 * (Math.cos(step)))
    sphere.position.y = 2 + (10 * (Math.abs(Math.cos(step))))

    sphereLightMesh.position.y = +(27 * Math.sin(step / 3))
    sphereLightMesh.position.x = 10 + (26 * Math.cos(step / 3))
    sphereLightMesh.position.z = -8
    // pointLight.position.copy(sphereLightMesh.position)
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