<script setup>
import * as THREE from 'three'
import { onMounted, render } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let skin = new THREE.TextureLoader().load("src/assets/monster.jpg")
let orbitControl, scene, clock, cameraCube, sceneCube, sphereLightMesh, controls, pointLight
let mouseX = 0, mouseY = 0

function createCubeMap() {
  const path = 'src/assets/cubemap/parliament/'
  const format = '.jpg'
  const urls = [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format,
  ]
  const textureCube = new THREE.CubeTextureLoader().load(urls)
  return textureCube
}

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
  sceneCube = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)
  cameraCube = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

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
  spotLight.intensity = 100000
  spotLight.castShadow = true;
  scene.add(spotLight)

  let ambiColor = '#0c0c0c'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  let pointcolor = '#ff5808'
  pointLight = new THREE.PointLight(pointcolor)
  pointLight.distance = 2000
  pointLight.position.set(-20, 7, 2)
  scene.add(pointLight)

  const textureCube = createCubeMap()
  textureCube.format = THREE.RGBAFormat

  const shader = THREE.ShaderLib['cube']
  shader.uniforms['tCube'].value = textureCube

  const material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material)
  sceneCube.add(cubeMesh)

  const sphere1 = createMesh(new THREE.SphereGeometry(10, 15, 15), 'plaster.jpg')
  sphere1.material.envMap = textureCube
  sphere1.rotation.y = -.5
  sphere1.position.x = 12
  sphere1.position.y = 5
  scene.add(sphere1)

  const sphere2 = createMesh(new THREE.SphereGeometry(10, 15, 15), 'plaster.jpg', 'plaster-normal.jpg')
  sphere2.material.envMap = textureCube
  sphere2.rotation.y = .5
  sphere2.position.x = -12
  sphere2.position.y = 5
  scene.add(sphere2)
  
  const sphereLight = new THREE.SphereGeometry(.2)
  const sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xa6c25})
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial)
  sphereLightMesh.castShadow = true
  sphereLightMesh.position.copy(new THREE.Vector3(3, 3, 3))
  scene.add(sphereLightMesh)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    document.addEventListener('mouseover', function(event) {
      mouseX = (event.clientX - window.innerWidth / 2) * 10
      mouseX = (event.clientY - window.innerHeight / 2) * 10
    }, false)
    controls = {
      normalScale: 1,
      reflectivity: 0,
      image: 'plaster',
      rotate: false,
      changeTexture(e) {
        const texture = new THREE.TextureLoader().load('src/assets/general/' + e + '.jpg')
        sphere2.material.map = texture
        sphere1.material.map = texture

        const normal = new THREE.TextureLoader().load('src/assets/general/' + e + '-normal.jpg')
        sphere2.material.normalMap = normal
      },
      upateNormal(e) {
        sphere2.material.normalScale.set(controls.normalScale, controls.normalScale)
        sphere2.material.reflectivity = controls.reflectivity
        sphere1.material.reflectivity = controls.reflectivity
      }
    }
    const gui = new GUI()
    gui.add(controls, 'normalScale', -2, 2).onChange(controls.upateNormal)
    gui.add(controls, 'reflectivity', -2, 2).onChange(controls.upateNormal)
    
    gui.add(controls, 'image', ['plaster', 'bathroom', 'metal-floor', 'none']).onChange(controls.changeTexture)
    gui.add(controls, 'rotate')
    let stats = initStats()
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

    camera.position.x = mouseX * .018
    camera.position.y = 6 + mouseY * .018
    camera.lookAt(scene.position)

    cameraCube.rotation.copy(camera.rotation)
    
    requestAnimationFrame(renderThree)
    renderer.render(sceneCube, cameraCube)
    renderer.autoClear = false
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