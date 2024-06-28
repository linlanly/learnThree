<script setup>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import Perlin from "@/utils/perlin.js"
import * as chroma from 'chroma-js';
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"
let scene, camera, renderer, stats, guiOption
let physicsWorld, transformAux, scale = chroma.scale(['white', 'blue', 'red', 'yellow'])
const gravityConstant = -9.8, textureLoader = new THREE.TextureLoader()
const rigidBodies = []
const clock = new THREE.Clock()

const terrainWidthExtents = 100
const terrainDepthExtents = 100
const terrainWidth = 128
const terrainHeight = 128
const terrainMaxHeight = 8
const terrainMinHeight = -2

let heightData = null, ammoHeightData = null
const pn = new Perlin('rnd' + new Date().getTime())


Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib
  drawGraphics()
})

function drawGraphics() {
  heightData = getHeightByNoise()
  initGraphics()
  initPhysics()
  createPlane()
}

function initGraphics() {
  scene = new THREE.Scene()
  scene.background = textureLoader.load('src/assets/texture/starry-deep-outer-space-galaxy.jpg')

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 3000)
  camera.position.set(-12, 7, 4)

  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const ambientLight = new THREE.AmbientLight(0xbbbbbb)
  scene.add(ambientLight)

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(-7, 10, 15)
  light.castShadow = true
  const d = 10
  light.shadow.camera.left = light.shadow.camera.bottom = -d
  light.shadow.camera.right = light.shadow.camera.top = d
  light.shadow.camera.near = 2
  light.shadow.camera.far = 50
  light.shadow.mapSize.x = 1024
  light.shadow.mapSize.y = 1024
  light.shadow.bias = -.003
  scene.add(light)

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.update();

  stats = new initStats()

  let container = document.getElementById('threeDoc')
  if (container) {
    container.appendChild(renderer.domElement)
    container.appendChild(stats.domElement)
    renderThreeBefore()
    const size = 3

    guiOption = {
      addSphereMesh() {
        const radius = 1 + Math.random() * size
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), getMaterial())
        const shape = new Ammo.btSphereShape(radius)
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addBoxMesh() {
        const x = 1 + Math.random() * size
        const y = 1 + Math.random() * size
        const z = 1 + Math.random() * size
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), getMaterial())
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addCylinderMesh() {
        const radius = 1 + Math.random() * size
        const height = 1 + Math.random() * size
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height), getMaterial())
        const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * .5, radius))
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addConeMesh() {
        const radius = 1 + Math.random() * size
        const height = 1 + Math.random() * size
        const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 20, 2), getMaterial())
        const shape = new Ammo.btConeShape(radius, height)
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addPlaneMesh() {
        const x = 1 + Math.random() * size
        const y = .1
        const z = 1 + Math.random() * size
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), getMaterial())
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addConvexMesh() {
        const mesh = new THREE.Mesh(new ConvexGeometry(getPointsForConvex()), getMaterial())
        const shape = new Ammo.btConvexShape()
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      },
      addCapsuleMesh() {
        const radius = 1 + Math.random() * size
        const height = 1 + Math.random() * size
        const cy1 = new THREE.CylinderGeometry(radius, radius, height)
        const top = new THREE.SphereGeometry(radius)
        const bottom = new THREE.SphereGeometry(radius)

        const matrix = new THREE.Matrix4()
        matrix.makeTranslation(0, height / 2, 0)
        top.applyMatrix4(matrix)

        const matrix2 = new THREE.Matrix4()
        matrix2.makeTranslation(0, -height / 2, 0)
        bottom.applyMatrix4(matrix2)

        let geometry = BufferGeometryUtils.mergeGeometries([cy1, top, bottom], true)
        const mesh = new THREE.Mesh(geometry, getMaterial())

        const shape = new Ammo.btCapsuleShape(radius, height)
        setPosAndShade(mesh)
        createRigidBody(mesh, shape, .5)
      }
    }
    const gui = new GUI()
    Object.keys(guiOption).forEach(key => {
      gui.add(guiOption, key)
    })
  }
}

function initPhysics() {
  const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
  const broadphase = new Ammo.btDbvtBroadphase()
  const solver = new Ammo.btSequentialImpulseConstraintSolver()
  const softBodySolver = new Ammo.btDefaultSoftBodySolver()
  if (collisionConfiguration) {
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
    physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0))
  }
  transformAux = new Ammo.btTransform()
}

function updatePhysics(deltaTime) {
  physicsWorld && physicsWorld.stepSimulation(deltaTime, 10)

  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const obj = rigidBodies[i]
    const objPhy = obj.userData.physicsBody
    const ms = objPhy.getMotionState()
    if (ms) {
      ms.getWorldTransform(transformAux)
      const p = transformAux.getOrigin()
      const q = transformAux.getRotation()
      obj.position.set(p.x(), p.y(), p.z())
      obj.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  }
}

function getHeightByNoise() {
  const size = terrainWidth * terrainHeight
  const data = new Float32Array(size)
  const arrange = terrainMinHeight / (terrainMaxHeight - terrainMinHeight)
  let p = 0
  for (let j = 0; j < terrainHeight; j++) {
    for (let i = 0; i < terrainWidth; i++) {
      const value = pn.noise(i / 10, j / 10, 0)
      data[p] = value > arrange ? value * terrainMaxHeight : value * terrainMinHeight
      p++
    }
  }
  return data
}

function createPlane() {
  const geometry = new THREE.PlaneGeometry(terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainHeight - 1)
  geometry.rotateX(-Math.PI / 2)
  
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightData[i])
  }
  geometry.computeVertexNormals()
  geometry.needsUpdate = true

  const material = new THREE.MeshPhongMaterial({
    color: 0xc7c7c7,
    map: textureLoader.load('src/assets/grasslight-big.jpg')
  })
  material.map.wrapS = THREE.RepeatWrapping
  material.map.wrapT = THREE.RepeatWrapping
  material.needsUpdate = true
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  scene.add(mesh)

  const heightScale = 1, upAxis = 1, hdt = 'PHY_FLOAT', flipQuadEdges = false
  ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainHeight)

  let p = 0, p2 = 0
  for (let j = 0; j < terrainHeight; j++) {
    for (let i = 0; i < terrainWidth; i++) {
      Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p]
      p++
      p2 += 4
    }
  }

  const shape = new Ammo.btHeightfieldTerrainShape(
    terrainWidth,
    terrainHeight,
    ammoHeightData,
    heightScale,
    terrainMinHeight,
    terrainMaxHeight,
    upAxis,
    hdt,
    flipQuadEdges
  )
  const scaleX = terrainWidthExtents / (terrainWidth - 1)
  const scaleZ = terrainDepthExtents / (terrainHeight - 1)
  shape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
  createRigidBody(mesh, shape, 0, new THREE.Vector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
}

function createRigidBody(object, physicsShape, mass, pos, quat) {
  if (!pos) {
    pos = object.position
  }
  if (quat) {
    object.quaternion.copy(quat)
  } else {
    quat = object.quaternion
  }

  physicsShape.setMargin(.04)

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new Ammo.btDefaultMotionState(transform)

  const localInertia = new Ammo.btVector3(0, 0, 0)
  physicsShape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia)
  const body = new Ammo.btRigidBody(rbInfo)
  body.setFriction(.5)

  object.userData.physicsBody = body
  object.userData.collided = false
  scene.add(object)

  if (mass > 0) {
    rigidBodies.push(object)
    body.setActivationState(4)
  }
  physicsWorld.addRigidBody(body)
  return body
}


function getMaterial() {
  return new THREE.MeshLambertMaterial({
    color: scale(Math.random()).hex(),
    opacity: .8,
    transparent: true
  })
}

function setPosAndShade(obj) {
  obj.position.set(Math.random() * 20 - 45,
    40,
    Math.random() * 20 - 5)
  obj.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI)
}

function getPointsForConvex() {
  const points = []
  for (let i = 0; i < 30; i++) {
    points.push(new THREE.Vector3(
      -5 + Math.round(Math.random() * 10),
      -5 + Math.round(Math.random() * 10),
      -5 + Math.round(Math.random() * 10),
    ))
  }
  return points
}

function renderThreeBefore() {
  function renderThree() {
    stats.update()
    requestAnimationFrame(renderThree)
    const deltaTime = clock.getDelta()
    updatePhysics(deltaTime)
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
  return statsObj
}

function numToChian(n) {
  let numbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  let is = false
  if (typeof n === 'number') {
    is = n < 0
    n = Math.abs(n)
    n = n + ''
  } else if (typeof n === 'string' && !/[^\d\.\-]/.test(n)) {
    if (n.includes('-')) {
      if (n.startsWith('-')) {
        is = true
        n = n.substring(1)
      } else {
        throw Error('传入格式不符合要求')
      }
    }

  } else {
    throw Error('传入格式不符合要求')
  }

  if (n.includes('.')) {
    let spliceString = n.split('.')
    if (spliceString.length > 1) {
      return (is ? '负' : '') + changeInteger(spliceString[0]) + '点' + changeDecimal(spliceString[1])
    } else {
      return '零点' + changeDecimal(spliceString[1])
    }
  } else {
    return (is ? '负' : '') + changeInteger(n)
  }

  function changeInteger(n) {
    if (n === '0') {
      return numbers[0]
    }
    let units = ['', '十', '百', '千']
    let field = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数']
    let smallField = field.slice(1)
    let res = []
    n = n.split('').reverse()
    for (let i = 0; i < n.length; i++) {
      if (i % 4 === 0) {
        res.push(field[i / 4])
      }
      if (n[i] !== '0') {
        if (i - 1 > 0 && n[i - 1] === '0') {
          res.push(numbers[0])
          if (smallField.includes(res[res.length - 2])) {
            [res[res.length - 1], res[res.length - 2]] = [res[res.length - 2], res[res.length - 1]]
          }
        }
        res.push(units[i % 4])
        res.push(numbers[parseInt(n[i])])
      }
    }
    return res.reverse().join('')
  }
  function changeDecimal(n) {
    let res = []
    for (let i = 0; i < n.length; i++) {
      res.push(numbers[parseInt(n[i])])
    }
    return res.join('')
  }
}
</script>
<template>
  <div id="threeDoc"></div>
</template>
<style scoped>
.threeDoc {
  position: absolute;
  margin: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>