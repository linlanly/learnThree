<script setup>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let scene, camera, renderer, stats
let physicsWorld, transformAux
const gravityConstant = -9.8, quat = new THREE.Quaternion(), textureLoader = new THREE.TextureLoader()
const rigidBodies = [], mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()
const clock = new THREE.Clock()

Ammo().then(function(AmmoLib) {
  Ammo = AmmoLib
  drawGraphics()
})

function drawGraphics() {
  initGraphics()
  initPhysics()
  createField()
  createStones()
  initInput()
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

function createField() {
  const fieldInfo = {};

  let positions = [[0, - 0.5, 0], [-31, .5, 0], [31, .5, 0], [0, .5, 30], [0, .5, -30]];
  ['plane', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'].forEach((key, index) => {
    let body = [64, 3, 2]
    if (key === 'plane') {
      body = [60, 1, 60]
    } else if(['borderLeft', 'borderRight'].includes(key)) {
      body = [2, 3, 60]
    }
    fieldInfo[key] = createParalellepiped(...body, 0, new THREE.Vector3(...positions[index]), quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
  })
  quat.set(0, 0, 0, 1);
  textureLoader.load('src/assets/general/wood-2.jpg', function (texture) {

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40);
    Object.keys(fieldInfo).forEach(key => {
      fieldInfo[key].material.map = texture
      fieldInfo[key].material.needsUpdate = true
    })

  });
}

function createStones() {
  let points = getPoints()
  points.forEach((point) => {
    const stone = createParalellepiped(.6, 6, 2, 0.5, point, quat, new THREE.MeshPhongMaterial({map: textureLoader.load('src/assets/general/darker_wood.jpg')}))
    stone.lookAt(scene.position)
  })
}

function createParalellepiped(x, y, z, mass, pos, quat, material) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(x, y, z, 1, 1, 1), material)
  object.castShadow = true;
  object.receiveShadow = true;
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
  createRigidBody(object, shape, mass, pos, quat)
  return object
}

function createRigidBody(object, physicsShape, mass, pos, quat) {
  if (pos) {
    object.position.copy(pos)
  } else  {
    pos = object.position
  }
  if (quat) {
    object.quaternion.copy(quat)
  } else  {
    quat = object.quaternion
  }

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

function initInput() {
  window.addEventListener('pointerdown', function(event) {
    mouseCoords.set((event.clientX / this.window.innerWidth) * 2 - 1, - (event.clientY / this.window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(mouseCoords, camera)

    const ballMass = 35
    const ballRadius = .4

    const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), new THREE.MeshPhongMaterial({color: 0x202020}))
    ball.castShadow = true
    ball.receiveShadow = true
    const ballShape = new Ammo.btSphereShape(ballRadius)
    
    const pos = raycaster.ray.direction.clone()
    pos.add(raycaster.ray.origin)
    const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat)

    pos.copy(raycaster.ray.direction)
    pos.multiplyScalar(24)
    ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z))
  })
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

function getPoints() {
  const points = []
  const r = 27, cX = 0, cY = 0;
  let circleOffset = 0
  for (let i = 0; i < 1000; i += 6 + circleOffset) {
    circleOffset = 4.5 * (i / 360)
    const z = (r / 1440) * (1440 - i) * Math.cos(i * (Math.PI / 180)) + cX
    const y = 3
    const x = (r / 1440) * (1440 - i) * Math.sin(i * (Math.PI / 180)) + cY
    points.push(new THREE.Vector3(x, y, z))
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

.controlBox {
  position: absolute;
  top: 50px;
  background-color: black;
  color: white;
  right: 15px;
  padding: 10px;
}
</style>