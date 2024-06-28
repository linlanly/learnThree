<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
let raindrop = new THREE.TextureLoader().load("src/assets/sprite-sheet.png")
let controls, stats, knot, scene

function createTexture() {
  var canvas = document.createElement("canvas");
  canvas.width = 16
  canvas.height = 16
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = 'transparent'
  ctx.beginPath()
  var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
  gradient.addColorStop(1, 'rgba(0,0,64, 0)');
  ctx.fillStyle = gradient;
  // ctx.arc(8, 8, 8, 0, 2 * Math.PI, false);
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fill();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createParticles(geom) {
  let size = 6
  let material = new THREE.PointsMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.5,
    size: 6,
    map: createTexture(),
    blending: THREE.AdditiveBlending
  })
  material.depthTest = false
  let buffer = new THREE.BufferGeometry()
  let position = []
  // let group = new THREE.Group()
  let points = geom.attributes.position
  for (let i = 0; i < points.count; i++) {
    // let sprit = new THREE.Sprite(material)
    // sprit.position.set(points.getX(i), points.getY(i), points.getZ(i))
    // sprit.scale.set(size, size, size)
    // group.add(sprit)
    position.push(points.getX(i), points.getY(i), points.getZ(i))
  }
  buffer.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3))
  let group = new THREE.Points(buffer, material)
  return group
}

function createMesh(geom) {
  let material = new THREE.MeshNormalMaterial()
  material.side = THREE.DoubleSide
  return new THREE.Mesh(geom, material)
}
function createSomething() {
  scene = new THREE.Scene()
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

  let doc = document.getElementById('threeDoc')
  if (doc) {
    stats = initStats()
    controls = {
      radius: 13,
      tube: 1.7,
      radialSegments: 156,
      tubularSegments: 12,
      p: 5,
      q: 4,
      heightScale: 3.5,
      asParticles: false,
      rotate: false,
      redraw() {
        if (knot) scene.remove(knot)
        let geom = new THREE.TorusKnotGeometry(
          controls.radius,
          controls.tube,
          Math.round(controls.radialSegments),
          Math.round(controls.tubularSegments),
          Math.round(controls.p),
          Math.round(controls.q),
          controls.heightScale
        )
        if (controls.asParticles) {
          knot = createParticles(geom)
        } else {
          knot = createMesh(geom)
        }
        scene.add(knot)
      }
    }
    let gui = new GUI()
    gui.add(controls, 'radius', -120, 120).onChange(controls.redraw)
    gui.add(controls, 'tube', -8, 8).step(1).onChange(controls.redraw)
    gui.add(controls, 'radialSegments', -100, 100).onChange(controls.redraw)
    gui.add(controls, 'tubularSegments', -20, 20).onChange(controls.redraw)
    gui.add(controls, 'p', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'q', -8, 8).step(1).onChange(controls.redraw)
    gui.add(controls, 'heightScale', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'asParticles').onChange(controls.redraw)
    gui.add(controls, 'rotate').onChange(controls.redraw)

    controls.redraw()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera)
  }
}

function renderThreeBefore(renderer, scene, camera) {
  function renderThree() {
    stats.update()
    if (controls.rotate) {
      knot.rotation.y += .01
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