<script setup>
import * as THREE from 'three'
import { onMounted, ref } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
let controls = {}, shape

function createMesh(geom) {
  let meshMaterial = new THREE.MeshNormalMaterial()
  meshMaterial.side = THREE.DoubleSide
  let wireFrameMat = new THREE.MeshBasicMaterial()
  wireFrameMat.wireframe = true
  return SceneUtils.createMultiMaterialObject(geom, [meshMaterial])
}

function drawShap() {
  // let shape = new THREE.Shape()
  // shape.moveTo(10, 10)
  // shape.lineTo(10, 40)
  // shape.bezierCurveTo(15, 25, 25, 30, 40)
  // shape.splineThru([new THREE.Vector2(32, 30), new THREE.Vector2(28, 20), new THREE.Vector2(30, 10)])
  // shape.quadraticCurveTo(20, 15, 10, 10)

  // let hole1 = new THREE.Path()
  // hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true)
  // shape.holes.push(hole1)

  // let hole2 = new THREE.Path()
  // hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true)
  // shape.holes.push(hole2)

  // let hole3 = new THREE.Path()
  // hole3.absellipse(20, 16, 2, 0, 0, Math.PI, true)
  // shape.holes.push(hole3)

  // return shape
  
  var shape = new THREE.Shape();

  shape.moveTo(10, 10);

  shape.lineTo(10, 40);

  shape.bezierCurveTo(15, 25, 25, 25, 30, 40);

  shape.splineThru(
    [new THREE.Vector2(32, 30),
    new THREE.Vector2(28, 20),
    new THREE.Vector2(30, 10),
    ]);

  shape.quadraticCurveTo(20, 15, 10, 10);

  var hole1 = new THREE.Path();
  hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole1);

  var hole2 = new THREE.Path();
  hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true);
  shape.holes.push(hole2);

  var hole3 = new THREE.Path();
  hole3.absarc(20, 16, 2, 0, Math.PI, true);
  shape.holes.push(hole3);
  return shape;
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
  camera.position.y = 80
  camera.position.z = 50
  camera.lookAt(new THREE.Vector3(10, 0, 0))

  // let plane = createMesh(new THREE.ExtrudeGeometry(drawShap()))
  // scene.add(plane)

  let spotLigth = new THREE.SpotLight(0xffffff)
  spotLigth.position.set(-40, 60, -10)
  spotLigth.intensity = 1000
  scene.add(spotLigth)

  let doc = document.getElementById('threeDoc')
  if (doc) {
    let stats = initStats()

    controls = {
      depth: 2,
      bevelThickness: 2,
      bevelSegments: 3,
      bevelEndabled: true,
      curveSegments: 12,
      bevelOffset: .1,
      steps: 1,
      redraw() {
        scene.remove(shape)
        
        let options = {...controls}
        delete options.asGeom
        shape = createMesh(new THREE.ExtrudeGeometry(drawShap(), options))
        scene.add(shape)
      }
    }
    controls.redraw()
    let gui = initGUI()
    gui.add(controls, 'depth', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'bevelOffset', -10, 10).onChange(controls.redraw)
    gui.add(controls, 'bevelThickness',-10, 10).step(1).onChange(controls.redraw)
    gui.add(controls, 'bevelSegments', -10, 10).step(1).onChange(controls.redraw)
    gui.add(controls, 'bevelEndabled').onChange(controls.redraw)
    gui.add(controls, 'curveSegments', -10, 100).step(1).onChange(controls.redraw)
    gui.add(controls, 'steps', -10, 10).step(1).onChange(controls.redraw)
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  let step = 0;
  function renderThree() {
    shape.rotation.y = step +=.01
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