<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
let orbitControl, scene, clock, controls, typeMesh

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
  camera.position.z = 128;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = 1000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  const texture = new THREE.TextureLoader().load('src/assets/ash_uvgrid01.jpg')
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const geometry = new THREE.BoxGeometry(24, 24, 24)
  let mesh = new THREE.Mesh(geometry, material)

  mesh.rotation.z = .5 * Math.PI
  mesh.rotation.y = .2 * Math.PI
  mesh.rotation.x = .2 * Math.PI
  scene.add(mesh)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    let uvs = geometry.attributes.uv

    controls = {};
    [0, 1, 2].forEach(index => {
      controls[`uv${index * 2 + 1}`] = uvs.getX(index)
      controls[`uv${index * 2 + 2}`] = uvs.getY(index)
    })
    const gui = new GUI();
    Object.keys(controls).forEach(key => {
      let index = parseInt(key.match(/\d/)[0]) - 1
      let quotient = Math.floor(index / 2)
      let remainder = index % 2
      gui.add(controls, key, -2, 2).onChange((e) => {
        uvs[`set${remainder === 0 ? 'X' : 'Y'}`](quotient, e)
        uvs.needsUpdate = true
      })
    })

    const type = {};
    [1,2].forEach(index => {
      type[`loadCube${index}`] = () => {
        const loader = new OBJLoader()
        loader.load(`src/assets/models/UVCube${index}.obj`, function(geometry) {
          if (typeMesh) scene.remove(typeMesh);
          const material = new THREE.MeshBasicMaterial({color: 0xffffff})
          const texture = new THREE.TextureLoader().load('src/assets/ash_uvgrid01.jpg')
          material.map = texture

          geometry.children[0].material = material
          typeMesh = geometry
          geometry.scale.set(15, 15, 15)
          geometry.position.set(-42, -12, 0)
          if (index === 2) {
            geometry.rotation.x = -.3
          }
          scene.add(typeMesh)
        })
      }
    })
    Object.keys(type).forEach(key => {
      gui.add(type, key)
    })
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)

    if (typeMesh) {
      typeMesh.rotation.x += .001
      typeMesh.rotation.y += .001
    }

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