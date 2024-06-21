<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
function gosper(a, b) {

var turtle = [0, 0, 0];
var points = [];
var count = 0;

rg(a, b, turtle);


return points;

function rt(x) {
    turtle[2] += x;
}

function lt(x) {
    turtle[2] -= x;
}

function fd(dist) {
//                ctx.beginPath();
    points.push({x: turtle[0], y: turtle[1], z: Math.sin(count) * 5});
//                ctx.moveTo(turtle[0], turtle[1]);

    var dir = turtle[2] * (Math.PI / 180);
    turtle[0] += Math.cos(dir) * dist;
    turtle[1] += Math.sin(dir) * dist;

    points.push({x: turtle[0], y: turtle[1], z: Math.sin(count) * 5});
//                ctx.lineTo(turtle[0], turtle[1]);
//                ctx.stroke();

}

function rg(st, ln, turtle) {

    st--;
    ln = ln / 2.6457;
    if (st > 0) {
//                    ctx.strokeStyle = '#111';
        rg(st, ln, turtle);
        rt(60);
        gl(st, ln, turtle);
        rt(120);
        gl(st, ln, turtle);
        lt(60);
        rg(st, ln, turtle);
        lt(120);
        rg(st, ln, turtle);
        rg(st, ln, turtle);
        lt(60);
        gl(st, ln, turtle);
        rt(60);
    }
    if (st == 0) {
        fd(ln);
        rt(60);
        fd(ln);
        rt(120);
        fd(ln);
        lt(60);
        fd(ln);
        lt(120);
        fd(ln);
        fd(ln);
        lt(60);
        fd(ln);
        rt(60)
    }
}

function gl(st, ln, turtle) {
    st--;
    ln = ln / 2.6457;
    if (st > 0) {
//                    ctx.strokeStyle = '#555';
        lt(60);
        rg(st, ln, turtle);
        rt(60);
        gl(st, ln, turtle);
        gl(st, ln, turtle);
        rt(120);
        gl(st, ln, turtle);
        rt(60);
        rg(st, ln, turtle);
        lt(120);
        rg(st, ln, turtle);
        lt(60);
        gl(st, ln, turtle);
    }
    if (st == 0) {
        lt(60);
        fd(ln);
        rt(60);
        fd(ln);
        fd(ln);
        rt(120);
        fd(ln);
        rt(60);
        fd(ln);
        lt(120);
        fd(ln);
        lt(60);
        fd(ln);
    }
}
}

let line
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

  camera.position.x = 30
  camera.position.y = 30
  camera.position.z = 30
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  let ambientLight = new THREE.AmbientLight(0x0c0c0c)
  scene.add(ambientLight)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 60, -10)
  spotLight.castShadow = true
  spotLight.intensity = 1000
  scene.add(spotLight)

  let points = gosper(4, 60)

  let lines = new THREE.BufferGeometry()
  let colors = []
  let npoints = []
  points.forEach(item => {
    npoints.push(item.x, item.z, item.y)
    let color = new THREE.Color()
    color.setHSL(item.x / 100 + .5, item.y * 20 / 300, .5)
    colors.push(color.r, color.g, color.b)
  })
  lines.setAttribute('position', new THREE.BufferAttribute(new Float32Array(npoints), 3))
  lines.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

  let material = new THREE.LineDashedMaterial({
    vertexColors: true,
    color: 0xffffff,
    dashSize: 1,
    gapSize: 3,
    scale: 1
  })

  line = new THREE.Line(lines, material)
  // line.computeLineDistances()
  line.position.set(-25, -10, -60)
  scene.add(line)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    let gui = initGUI()

    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    line.rotation.x = step += .01
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