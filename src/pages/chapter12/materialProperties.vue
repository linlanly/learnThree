<script setup>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as chroma from 'chroma-js';
let scene, camera, renderer, stats, guiOption, meshes = []
let physicsWorld, transformAux
const gravityConstant = -9.8, quat = new THREE.Quaternion(), textureLoader = new THREE.TextureLoader()
const rigidBodies = []
const clock = new THREE.Clock(), scale = chroma.scale(['white', 'blue', 'red', 'yellow']);
let ground = new THREE.Object3D()
const broadWidth = 60, broadWidth2 = 64
let positions = [[0, 0, 0], [-31, 4.5, 0], [31, 4.5, 0], [0, 4.5, 30], [0, 4.5, -30]];

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib
  drawGraphics()
})

function drawGraphics() {
  initGraphics()
  initPhysics()
  createField()
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

    guiOption = {
      cubeRestitution: .4,
      cubeFriction: 1,
      sphereRestitution: .9,
      sphereFriction: .1,
      clearMeshes() {
        meshes.forEach(mesh => {
          scene.remove(mesh)
          let index = rigidBodies.findIndex(item => item === mesh)
          if (index !== -1) {
            rigidBodies.splice(index, 1)
          }
        })
        meshes = []
      },
      addSpheres() {
        const colorSphere = scale(Math.random()).hex()
        for (let i = 0; i < 5; i++) {
          let position = new THREE.Vector3(Math.random() * 50 - 25, 20 + Math.random() * 5, Math.random() * 50 - 25)
          let mesh = createParalellepipedSphere(2, 20, .5, position, quat, new THREE.MeshPhongMaterial({
            color: colorSphere,
            opacity: .8,
            transparent: true
          }))
          scene.add(mesh)
          meshes.push(mesh)
        }
      },
      addCubes() {
        const cubeSphere = scale(Math.random()).hex()
        for (let i = 0; i < 5; i++) {
          let position = new THREE.Vector3(Math.random() * 50 - 25, 20 + Math.random() * 5, Math.random() * 50 - 25)
          let mesh = createParalellepiped(4, 4, 4, .5, position, quat, new THREE.MeshPhongMaterial({
            color: cubeSphere,
            opacity: .8,
            transparent: true
          }))
          mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
          scene.add(mesh)
          meshes.push(mesh)
        }
      }
    }

    const gui = new GUI();
    ['cubeRestitution', 'cubeFriction', 'sphereRestitution', 'sphereFriction'].forEach(key => {
      gui.add(guiOption, key, -10, 10)
    });

    ['addCubes', 'addSpheres', 'clearMeshes'].forEach(key => {
      gui.add(guiOption, key)
    });
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

  ['plane', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'].forEach((key, index) => {
    let body = [broadWidth2, 10, 2]
    if (key === 'plane') {
      body = [broadWidth, 1, broadWidth]
    } else if (['borderLeft', 'borderRight'].includes(key)) {
      body = [2, 10, broadWidth]
    }

    const centerPoint = new THREE.Vector3(...positions[index])
    fieldInfo[key] = createParalellepiped(...body, 0, centerPoint, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
    ground.add(fieldInfo[key])
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
  scene.add(ground)
}

function createParalellepiped(x, y, z, mass, pos, quat, material) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(x, y, z, 1, 1, 1), material)
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
  createRigidBody(object, shape, mass, pos, quat, guiOption.cubeFriction, guiOption.cubeRestitution)
  return object
}


function createParalellepipedSphere(x, y, mass, pos, quat, material) {
  const object = new THREE.Mesh(new THREE.SphereGeometry(x, y), material)
  const shape = new Ammo.btSphereShape(x)
  createRigidBody(object, shape, mass, pos, quat, guiOption.sphereFriction, guiOption.sphereRestitution)
  return object
}

function createRigidBody(object, physicsShape, mass, pos, quat, friction, restitution = null) {
  object.castShadow = true;
  object.receiveShadow = true;
  if (pos) {
    object.position.copy(pos)
  } else {
    pos = object.position
  }
  if (quat) {
    object.quaternion.copy(quat)
  } else {
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
  body.setFriction(friction || .4)
  if (restitution) {
    body.setRestitution(restitution)
  }

  object.userData.physicsBody = body
  object.userData.collided = false

  if (mass > 0) {
    rigidBodies.push(object)
    body.setActivationState(4)
  }
  physicsWorld.addRigidBody(body)
  return body
}

function updatePhysics(deltaTime, rotationX) {
  physicsWorld && physicsWorld.stepSimulation(deltaTime, 10)

  const axisX = new THREE.Vector3(1, 0, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromAxisAngle(axisX, rotationX)

  for (let i = 0, il = ground.children.length; i < il; i++) {
    const centerPoint = new THREE.Vector3(...positions[i])
    const axisAnglePoint = centerPoint.applyAxisAngle(axisX, rotationX)

    const obj = ground.children[i]
    const objPhy = obj.userData.physicsBody
    const transform = objPhy.getWorldTransform()
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    transform.setOrigin(new Ammo.btVector3(axisAnglePoint.x, axisAnglePoint.y, axisAnglePoint.z))
  }

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

function renderThreeBefore() {
  let direction = 1
  function renderThree() {
    stats.update()
    requestAnimationFrame(renderThree)
    renderer.render(scene, camera)

    ground.rotation.x += .002 * direction
    const deltaTime = clock.getDelta()
    updatePhysics(deltaTime, ground.rotation.x)

    if (ground.rotation.x < -.4) direction = 1
    if (ground.rotation.x > .4) direction = -1
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