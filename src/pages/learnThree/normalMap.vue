<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, sphereLightMesh, clock, pointLight
function createMesh(geometry, imageFile, normalFile) {
  const texture = new THREE.TextureLoader().load(`src/assets/general/${imageFile}`)
  geometry.computeVertexNormals()
  const option = {}
  if (imageFile.includes('floor')) {
    option.color = 0xffff00
  }
  const material = new THREE.MeshPhongMaterial(option)
  material.map = texture
  if (normalFile) {
    const normal = new THREE.TextureLoader().load(`src/assets/general/${normalFile}`)
    material.normalMap = normal
  }
  return new THREE.Mesh(geometry, material)
}

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 0;
  camera.position.y = 12;
  camera.position.z = 28;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = 1000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ff5808'
  pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 200
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)


  let sphere1 = createMesh(new THREE.BoxGeometry(15, 15, 15), 'plaster.jpg')
  sphere1.rotation.y = -.5
  sphere1.position.x = 12
  scene.add(sphere1)

  let sphere2 = createMesh(new THREE.BoxGeometry(15, 15, 15), 'plaster.jpg', 'plaster-normal.jpg')
  sphere2.rotation.y = .5
  sphere2.position.x = -12
  scene.add(sphere2)

  const plane = createMesh(new THREE.BoxGeometry(200, 100, .5, 30), 'floor-wood.jpg')
  plane.material.color.setStyle('#3c3c3c')
  plane.material.needsUpdate = true
  plane.position.y = -7.5
  plane.rotation.x = -.5 * Math.PI
  scene.add(plane)

  const sphereLight = new THREE.SphereGeometry(.2)
  const sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xac6c25})
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.set(3, 3, 3)
  scene.add(sphereLightMesh)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()
    const controls = {
      normalScale: .2,
      textureType: 'plaster',
      rotate: false,
      changeTexture: function(e) {
        const texture = new THREE.TextureLoader().load(`src/assets/general/${e}.jpg`)
        sphere2.material.map = texture
        sphere1.material.map = texture

        const normal = new THREE.TextureLoader().load(`src/assets/general/${e}-normal.jpg`)
        sphere2.material.normalMap = normal
      },
      updateBump: function(e) {
        sphere2.material.normalScale.set(e, e)
      }
    }
    const gui = new GUI()
    gui.add(controls, 'normalScale', -20, 20).onChange(controls.updateBump)
    gui.add(controls, 'textureType', ['plaster', 'bathroom', 'metal-floor']).onChange(controls.changeTexture)
    gui.add(controls, 'rotate')
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0, invert = 1
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)
    
    if (step > 2 * Math.PI) {
      invert *= -1
      step -= 2 * Math.PI
    } else {
      step += .008
    }
    sphereLightMesh.position.z = +(21 * (Math.sin(step)))
    sphereLightMesh.position.x = -14 +(14 * (Math.sin(step)))

    if (invert < 0) {
      let pivot = 0
      sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot
    }
    pointLight.position.copy(sphereLightMesh.position)
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