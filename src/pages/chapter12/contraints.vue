<script setup>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Projector } from 'three/addons/renderers/Projector.js';
import * as chroma from 'chroma-js';
let scene, camera, renderer, stats
let physicsWorld, transformAux, scale = chroma.scale(['white', 'blue', 'red', 'yellow']);
const gravityConstant = -9.8, quat = new THREE.Quaternion(), textureLoader = new THREE.TextureLoader()
const rigidBodies = [], mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()
const clock = new THREE.Clock(), projector = new Projector(), meshs = []
const doorLimit = {
  min: -2.2,
  max: 2.6
}

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib
  drawGraphics()
})

function drawGraphics() {
  initPhysics()
  initGraphics()
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

    const flipperLeftConstraint = createLeftFlipper()
    const flippperRightConstraint = createRightFlipper()
    const sliderBottomConstraint = createSilderBottom()
    const sliderTopConstraint = createSilderTop()
    // const coneTwistConstraint = createConeTwist()
    // const point2point = createPointToPoint(true)

    const guiOption = {
      enableMotor: false,
      acceleration: 40,
      velocity: 5,

      enableConeTwistMotor: false,
      motorTargetX: 0,
      motorTargetY: 0,
      motorTargetZ: 0,
      // updateCone() {
      //   if (guiOption.enableConeTwistMotor) {
      //     coneTwistConstraint.enableMotor()
      //     coneTwistConstraint.setMotorTarget(new THREE.Vector3(guiOption.motorTargetX, guiOption.motorTargetY, guiOption.motorTargetZ))
      //   } else {
      //     coneTwistConstraint.disableMotor()
      //   }
      // },
      updateMotor() {
          flipperLeftConstraint.enableAngularMotor(true, !guiOption.enableMotor ? 0 : guiOption.velocity, guiOption.acceleration)
          flippperRightConstraint.enableAngularMotor(true, !guiOption.enableMotor ? 0 : -guiOption.velocity, guiOption.acceleration)
      },
      // sliderLeft() {
      //   sliderBottomConstraint.disableLinearMotor()
      //   sliderBottomConstraint.enableLinearMotor(guiOption.velocity, guiOption.acceleration)
      //   sliderTopConstraint.disableLinearMotor()
      //   sliderTopConstraint.enableLinearMotor(guiOption.velocity, guiOption.acceleration)
      // },
      // sliderRight() {
      //   sliderBottomConstraint.disableLinearMotor()
      //   sliderBottomConstraint.enableLinearMotor(-guiOption.velocity, guiOption.acceleration)
      //   sliderTopConstraint.disableLinearMotor()
      //   sliderTopConstraint.enableLinearMotor(-guiOption.velocity, guiOption.acceleration)
      // },
      clearMeshs() {
        meshs.forEach(mesh => {
          scene.remove(mesh)
        })
        meshs = []
      },
      addSpheres() {
        const colorSphere = scale(Math.random()).hex()
        for (let i = 0; i < 5; i++) {
          let position = new THREE.Vector3(Math.random() * 50 - 25, 20 + Math.random() * 5, Math.random() * 50 - 25)
          const radius = 1 + Math.random() * 3
          let mesh = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({
            color: colorSphere,
            opacity: .8,
            transparent: true
          }))
          let shape = new Ammo.btSphereShape(radius)
          createRigidBody(mesh, shape, .3, position)
          meshes.push(mesh)
        }
      }
    }
    guiOption.updateMotor()
    const gui = new GUI()
    const generalFolder = gui.addFolder('general');
    ['acceleration', 'velocity'].forEach(key => {
      generalFolder.add(guiOption, key, -20, 20).onChange(guiOption.updateMotor)
    })

    const hingeFolder = gui.addFolder('hinge')
    hingeFolder.add(guiOption, 'enableMotor').onChange(guiOption.updateMotor)

    // const sliderFolder = gui.addFolder('sliders')
    // ['sliderLeft', 'sliderRight'].forEach(key => {
    //   sliderFolder.add(guiOption, key).onChange(guiOption[key])
    // })

    // const coneTwistFolder = gui.addFolder('coneTwist')
    // coneTwistFolder.add(guiOption, 'enableConeTwistMotor').onChange(guiOption.updateCone);
    // ['motorTargetX', 'motorTargetY', 'motorTargetZ'].forEach(key => {
    //   coneTwistFolder.add(guiOption, key, -Math.PI / 2, Math.PI / 2).onChange(guiOption.updateCone)
    // })

    // const sphereFolder = gui.addFolder('spheres');
    // ['clearMeshes', 'addSphere'].forEach(key => {
    //   sphereFolder.add(guiOption, key).onChange(guiOption.updateMotor)
    // })
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
  const flipper = {};

  let positions = [[0, - 0.5, 0], [-31, .5, 0], [31, .5, 0], [0, .5, 30], [0, .5, -30]];
  ['plane', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'].forEach((key, index) => {
    let body = [64, 3, 2]
    if (key === 'plane') {
      body = [60, 1, 60]
    } else if (['borderLeft', 'borderRight'].includes(key)) {
      body = [2, 3, 60]
    }
    flipper[key] = createParalellepiped(...body, 0, new THREE.Vector3(...positions[index]), quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
  })
  quat.set(0, 0, 0, 1);
  textureLoader.load('src/assets/general/wood-2.jpg', function (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40);
    Object.keys(flipper).forEach(key => {
      flipper[key].material.map = texture
      flipper[key].material.needsUpdate = true
    })

  });
}

function createParalellepiped(x, y, z, mass, pos, quat, material) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(x, y, z, 1, 1, 1), material)
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
  createRigidBody(object, shape, mass, pos, quat)
  return object
}

function createRigidBody(object, physicsShape, mass, pos, quat) {
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
function createConeTwist() {
  const baseMesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshPhongMaterial({
    color: 0x4444ff, transparent: true, opacity: .7
  }))
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 3), new THREE.MeshPhongMaterial({
    color: 0x4444ff, transparent: true, opacity: .7
  }))
  const objectOne = createRigidBody(baseMesh, new Ammo.btSphereShape(1), 0, new THREE.Vector3(20, 15.5, 0))

  const objectTwo = createRigidBody(armMesh, new Ammo.btSphereShape(1), 10, new THREE.Vector3(20, 7.5, 0))
  const constraint = new Ammo.btConeTwistConstrain(objectOne, objectTwo, objectOne.position)
  constraint.setLimit(.5 * Math.PI, .5 * Math.PI, .5 * Math.PI)
  constraint.setMaxMotorImpulse(1)
  constraint.setMotorTarget(new THREE.Vector3(0, 0, 0))
  return constraint
}

function createPointToPoint() {
  const obj = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshPhongMaterial({
    color: 0xff4444, transparent: true, opacity: .7
  }))
  const flipper = {};

  let positions = [[-10, 2, -18], [-20, 2, -5]];
  let size = [2, 2];

  ['one', 'two'].forEach((key, index) => {
    const obj = new THREE.Mesh(new THREE.SphereGeometry(size[index]), new THREE.MeshPhongMaterial({
      color: 0xff4444, transparent: true, opacity: .7
    }))
    const shape = new Ammo.btSphereShape(size[idnex])
    flipper[key] = createRigidBody(obj, shape, .3, new THREE.Vector3(...positions[index]))
  })
  const constraint = new Ammo.btPointConstraint(flipper.one, flipper.two, flipper.two.position)
  physicsWorld.addConstraint(constraint)
  return constraint
}

function createRightFlipper() {
  const flipper = {};

  let positions = [[8, 1, 0], [15, 1, 0]];
  let size = [[12, 2, 2], [1, 1, 1]];

  ['body', 'pivot'].forEach((key, index) => {
    flipper[key] = createParalellepiped(...size[index], key === 'pivot' ? 0 : .3, new THREE.Vector3(...positions[index]), quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF, opacity: .6, transparent: true }))
  })
  let center = new Ammo.btVector3(0, 0, 0)
  let center2 = new Ammo.btVector3(8, 0, 0)
  const axisY = new Ammo.btVector3(0, 1, 0)
  const constraint = new Ammo.btHingeConstraint(flipper.body.userData.physicsBody, flipper.pivot.userData.physicsBody, center2, center, axisY, axisY, false)
  physicsWorld.addConstraint(constraint)
  constraint.setLimit(-1.9, 1.9, .1, 0)
  return constraint
}
function createLeftFlipper() {
  const flipper = {};

  let positions = [[-8, 1, 0], [-15, 1, 0]];
  let size = [[12, 2, 2], [1, 1, 1]];

  ['body', 'pivot'].forEach((key, index) => {
    flipper[key] = createParalellepiped(...size[index], key === 'pivot' ? 0 : .3, new THREE.Vector3(...positions[index]), quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF, opacity: .6, transparent: true }))
  })

  let center = new Ammo.btVector3(0, 0, 0)
  let center2 = new Ammo.btVector3(-8, 0, 0)
  const axisY = new Ammo.btVector3(0, 1, 0)
  const constraint = new Ammo.btHingeConstraint(flipper.body.userData.physicsBody, flipper.pivot.userData.physicsBody, center2, center, axisY, axisY, false)
  physicsWorld.addConstraint(constraint)
  constraint.setLimit(-1.9, 1.9, .1, 0)
  return constraint
}

function createSilderBottom() {
  const sliderCube = createParalellepiped(12, 2, 2, 0.01, new THREE.Vector3(6, 1.5, 20), quat, new THREE.MeshPhongMaterial({ color: 0x44ff44, opacity: .6, transparent: true }))

  const constraint = new Ammo.btSliderConstraint(sliderCube, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
  console.log('show 111', constraint)
  physicsWorld.addConstraint(constraint)
  constraint.setLowerLinLimit(-10)
  constraint.setUpperLinLimit(10)
  // constraint.setRestitution(.1, .1)
  return constraint
}


function createSilderTop() {
  const sliderCube = createParalellepiped(7, 2, 7, 0.01, new THREE.Vector3(-20, 1.5, -15), quat, new THREE.MeshPhongMaterial({ color: 0x44ff44, opacity: .6, transparent: true }))

  const constraint = new Ammo.btSliderConstraint(sliderCube, new THREE.Vector3(-10, 0, 20), new THREE.Vector3(Math.PI / 2, 0, 0))
  physicsWorld.addConstraint(constraint)
  constraint.setLowerLinLimit(-20)
  constraint.setUpperLinLimit(10)
  constraint.setLowerAngLimit(-.5)
  constraint.setUpperAngLimit(.5)
  // constraint.setLimit(-20, 10, 0.5, -0.5)
  // constraint.setRestitution(.2, .1)
  return constraint
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