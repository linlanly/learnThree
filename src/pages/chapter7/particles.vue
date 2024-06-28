<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
function createSomething() {
  let scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

  let renderer
  let webGLRenderer = new THREE.WebGLRenderer()
  webGLRenderer.setClearColor(0x000000)
  webGLRenderer.setSize(window.innerWidth, window.innerHeight)
  webGLRenderer.shadowMap.enabled = true

  renderer = webGLRenderer
  renderer.sortObjects = false

  camera.position.x = -0
  camera.position.y = 0
  camera.position.z = 150

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  // let material = new THREE.SpriteMaterial({color: 0xff0000})
  // for(let x = -5; x < 5; x++ ) {
  //   for(let y = -5; y < 5; y++) {
  //     let sprit = new THREE.Sprite(material)
  //     sprit.position.set(x * 10, y * 10, 0)
  //     scene.add(sprit)
  //   }
  // }

  let points = [], colors = []
  for(let x = -5; x < 5; x++) {
    for(let y = -5; y < 5; y++) {
      points.push(x * 10, y * 10, 0)
      let color = new THREE.Color(Math.random() * 0xffffff)
      colors.push(color.r, color.g, color.b)
    }
  }

  let buffer = new THREE.BufferGeometry()
  buffer.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3))
  buffer.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
  
  let material = new THREE.PointsMaterial({vertexColors: true, size: 4, color: 0xffffff})
  let pointGroup = new THREE.Points(buffer, material)
  scene.add(pointGroup)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  function renderThree() {
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)
  }
  renderThree()
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