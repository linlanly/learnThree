<script setup>
import * as THREE from 'three'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let scene, camera, renderer, stats
let physicsWorld, transformAux, meshes = []
const gravityConstant = -9.8, quat = new THREE.Quaternion(), textureLoader = new THREE.TextureLoader()
const rigidBodies = []
const clock = new THREE.Clock()

const params = {
  "startPlatformHeight": 20,
  "startPlatformWidth": 5,
  "startPlatformLength": 3,
  "startPlatformPosition": "-50, 10, -40",
  "startPlatformEuler": "0, 0, 0",
  "poolCueSpeed": 5,
  "poolCueSize": 1,
  "poolCueMass": 1,
  "startBallSize": 1,
  "startBallMass": 1,
  "startBallFriction": 0.5,
  "startBallRestitution": 1,
  "rampHeight": 1,
  "rampRotationZ": -30,
  "hHitBridgeLength": 8,
  "hHitBridgeFriction": 0.2,
  "hHitBridgeRestitution": 0.2,
  "hHitBallSize": 1,
  "hHitBallMass": 1,
  "hHitBallFriction": 0.5,
  "hHitBallRestitution": 1,
  "pendulumSize": 1,
  "pendulumHeight": 20,
  "pendulumMass": 1,
  "pendulumRestitution": 1,
  "sliderHeight": 10,
  "sliderLength": 20,
  "sliderMass": 1,
  "sliderSize": 1,
  "sliderFriction": 0.2,
  "sliderRestitution": 0.8,
  "seesawLength": 20,
  "seesawHeight": 5,
  "seesawMass": 2,
  "seesawFriction": 0.2,
  "seesawRestitution": 0.8,
  "balanceLength": 10,
  "balanceHeight": 10,
  "balanceMass": 2,
  "balanceSize": 1,
  "balanceFriction": 0.8,
  "balanceRestitution": 0.8,
  "hopperSize": 1.2,
  "hopperHeight": 5,
  "hopperRotation": 60,
  "vehicleLength": 12,
  "vehicleWidth": 8,
  "vehicleHeight": 4,
  "vehicleFriction": 0.5,
  "vehicleRestitution": 0.8,
  "vehicleMass": 5,
  "vehicleSpeed": 20,
  "bridgeLength": 30,
  "bridgeHeight": 20,
  "bridgeFriction": 0.5,
  "lifterHeight": 20,
  "lifterSpeed": 5,
  "bulldozerRadius": 10,
  "bulldozerSpeed": 30,
  "cushionHeight": 10,
  "cushionLength": 25,
  "cushionWidth": 20,
  "cushionMass": 20,
  "cushionPressure": 3000,
  "dominoHeight": 10,
  "dominoCount": 12,
  "dominoMass": 2,
  "dominoImpulse": 4
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

    // const car = createCar()
    createNewObject()
    const guiOption = {
      velocity: -2,
      wheelAngle: .5,
      looseXRight: .0001,
      looseXLeft: .0001,
      changeVelocity() {
        car.frConstraint.setLinearLowerLimit(new Ammo.btVector3(guiOption.velocity, 0, 0))
        car.frConstraint.setLinearUpperLimit(new Ammo.btVector3(guiOption.velocity, 0, 0))
        car.flConstraint.setLinearLowerLimit(new Ammo.btVector3(guiOption.velocity, 0, 0))
        car.flConstraint.setLinearUpperLimit(new Ammo.btVector3(guiOption.velocity, 0, 0))
      },
      changeOrientation() {
        car.rrConstraint.setAngularLowerLimit(new Ammo.btVector3(0, guiOption.wheelAngle, 0))
        car.rrConstraint.setAngularUpperLimit(new Ammo.btVector3(guiOption.looseXRight, guiOption.wheelAngle, 0))
        car.rlConstraint.setAngularLowerLimit(new Ammo.btVector3(guiOption.looseXLeft, guiOption.wheelAngle, .1))
        car.rlConstraint.setAngularUpperLimit(new Ammo.btVector3(0, guiOption.wheelAngle, 0))
      }
    }

    const gui = new GUI();
    Object.keys(guiOption).forEach(key => {
      if (['velocity'].includes(key)) {
        gui.add(guiOption, key, -10, 10).onChange(guiOption.changeVelocity)
      } else if (['wheelAngle', 'looseXRight', 'looseXLeft'].includes(key)) {
        gui.add(guiOption, key, -1, 1).onChange(guiOption.changeOrientation)
      }
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

function createField() {
  const fieldInfo = {};

  let positions = [[0, - 0.5, 0], [-31, .5, 0], [31, .5, 0], [0, .5, 30], [0, .5, -30]];
  ['plane', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'].forEach((key, index) => {
    let body = [64, 3, 2]
    if (key === 'plane') {
      body = [60, 1, 60]
    } else if (['borderLeft', 'borderRight'].includes(key)) {
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

function createWheel(position) {
  const wheel_material = new THREE.MeshLambertMaterial({ color: 0x444444, opacity: .9, transparent: true })
  const wheel_geometry = new THREE.CylinderGeometry(4, 4, 2, 40)
  const wheel = new THREE.Mesh(wheel_geometry, wheel_material)
  wheel.position.copy(position)
  wheel.rotation.x = Math.PI / 2

  const shape = new Ammo.btCylinderShape(new Ammo.btVector3(4, 2 * .5, 4))
  createRigidBody(wheel, shape, 0.1)
  return wheel
}

function createWheelConstraint(wheel, body, position) {
  const constraint = new Ammo.btGeneric6DofConstraint(body.userData.physicsBody, wheel.userData.physicsBody, createTransform(new THREE.Vector3(0, 0, 0)), createTransform(new THREE.Vector3(0, 0, 0)), true)
  physicsWorld.addConstraint(constraint)
  const lowerSliderLimit = new Ammo.btVector3(position.x, position.y, position.z);
  constraint.setLinearLowerLimit(lowerSliderLimit)
  constraint.setLinearUpperLimit(lowerSliderLimit);
  constraint.setAngularLowerLimit(new Ammo.btVector3(Math.PI / 2, 0, 0));
  constraint.setAngularUpperLimit(new Ammo.btVector3(Math.PI / 2, 0, 0));
  return constraint
}

function createTransform(pos) {
  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  return transform
}

function createCar() {
  const car = {}
  const car_material = new THREE.MeshLambertMaterial({ color: 0xff4444, opacity: .9, transparent: true })
  const car_geometry = new THREE.BoxGeometry(15, 4, 4)
  const body = new THREE.Mesh(car_geometry, car_material)
  body.position.set(5, 5, 5)

  const shape = new Ammo.btBoxShape(new Ammo.btVector3(7.5, 2, 2))
  createRigidBody(body, shape, 0.1)

  const fr = createWheel(new THREE.Vector3(0, 4, 10))
  const fl = createWheel(new THREE.Vector3(0, 4, 0))
  const rr = createWheel(new THREE.Vector3(10, 4, 10))
  const rl = createWheel(new THREE.Vector3(10, 4, 0))

  // const frConstraint = createWheelConstraint(fr, body, new THREE.Vector3(-5, -1, 3))
  // const flConstraint = createWheelConstraint(fl, body, new THREE.Vector3(-5, -1, -3))
  // const rrConstraint = createWheelConstraint(rr, body, new THREE.Vector3(10, 4, 8))
  // const rlConstraint = createWheelConstraint(rl, body, new THREE.Vector3(10, 4, 2))

  // rrConstraint.setAngularLowerLimit(new Ammo.btVector3(0, .5, .1))
  // rrConstraint.setAngularUpperLimit(new Ammo.btVector3(0, .5, 0))
  // rlConstraint.setAngularLowerLimit(new Ammo.btVector3(0, .5, .1))
  // rlConstraint.setAngularUpperLimit(new Ammo.btVector3(0, .5, 0))

  // frConstraint.setAngularLowerLimit(new Ammo.btVector3(0, 0, 0))
  // frConstraint.setAngularUpperLimit(new Ammo.btVector3(0, 0, 0))
  // flConstraint.setAngularLowerLimit(new Ammo.btVector3(0, 0, 0))
  // flConstraint.setAngularUpperLimit(new Ammo.btVector3(0, 0, 0))

  // car.flConstraint = flConstraint
  // car.frConstraint = frConstraint
  // car.rrConstraint = rrConstraint
  // car.rlConstraint = rlConstraint

  return car
}

// 天平
function createBalance() {
  let material = new THREE.MeshLambertMaterial({ color: 0xff4488, opacity: .9, transparent: true });
  const pos = new THREE.Vector3(0, 0, 0);
  quat.set(0, 0, 0, 1);
  pos.z += params.seesawLength / 2;
  const pad = 0.1;
  const w = params.rampHeight;
  const pw = params.startPlatformWidth;
  const l = params.balanceLength;
  const h = params.balanceHeight;
  const hh = h - params.seesawHeight - w;


  const r = params['balanceSize'];
  const mass = 0.1;
  const friction = params['balanceFriction']
  const restitution = params['balanceRestitution'];

  pos.y = w / 2 + hh;
  const crossbeam = createParalellepiped(pw, w, l, mass * 0.25, pos, quat, material, friction, restitution);

  const basePos = crossbeam.position.clone();
  pos.set(basePos.x, hh / 2, basePos.z - l / 2 + w / 2);
  const hangA = createParalellepiped(pw, hh, w, mass, pos, quat, material, friction, restitution);
  pos.set(basePos.x, hh / 2, basePos.z + l / 2 - w / 2);
  const hangB = createParalellepiped(pw, hh, w, mass, pos, quat, material, friction, restitution);
  // 添加约束

  var frameInA = new Ammo.btTransform();
  var frameInB = new Ammo.btTransform();

  frameInA.setIdentity();
  frameInB.setIdentity();

  frameInA.setOrigin(Ammo.btVector3(0, 0, 0));
  frameInB.setOrigin(Ammo.btVector3(0, 0, 0));

  var lowerSliderLimit = new Ammo.btVector3(0, -hh / 2 - w / 2 - pad, -l / 2 + w / 2);
  var hiSliderLimit = new Ammo.btVector3(0, -hh / 2 - w / 2 + pad, -l / 2 + w / 2);
  var lowerAngularLimit = new Ammo.btVector3(0, 0, 0);
  var hiAngularLimit = new Ammo.btVector3(0, 0, 0);

  const balanceConstraintA = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangA.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );

  lowerSliderLimit.setValue(0, -hh / 2 - w / 2 - pad, l / 2 - w / 2);
  hiSliderLimit.setValue(0, -hh / 2 - w / 2 + pad, l / 2 - w / 2);

  const balanceConstraintB = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangB.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );
}

// 天平
function createBalanceUp() {
  let material = new THREE.MeshLambertMaterial({ color: 0xff4488, opacity: .9, transparent: true });
  const pos = new THREE.Vector3(0, 0, 0)
  quat.set(0, 0, 0, 1);
  pos.z += params.seesawLength / 2;
  const pad = 0.1;
  const w = params.rampHeight;
  const pw = params.startPlatformWidth;
  const l = params.balanceLength;
  const h = params.balanceHeight;
  const hh = h - params.seesawHeight - w;

  const r = params['balanceSize'];
  const mass = params['balanceMass'];
  const friction = params['balanceFriction']
  const restitution = params['balanceRestitution'];
  pos.y = h / 2;
  pos.z += l / 2 - w;

  pos.y = h;
  pos.y = h + w;
  const crossbeam = createParalellepiped(pw, w, l, mass * 0.25, pos, quat, material, friction, restitution);
  pos.y += w + r / 2 + pad;


  const basePos = crossbeam.position.clone();
  pos.set(basePos.x, basePos.y + hh / 2 - w / 2, basePos.z - l / 2 + w / 2);
  const hangA = createParalellepiped(pw, hh, w, mass, pos, quat, material, friction, restitution);
  pos.set(basePos.x, basePos.y + hh / 2 - w / 2, basePos.z + l / 2 - w / 2);
  const hangB = createParalellepiped(pw, hh, w, mass, pos, quat, material, friction, restitution);
  // 添加约束

  var frameInA = new Ammo.btTransform();
  var frameInB = new Ammo.btTransform();

  frameInA.setIdentity();
  frameInB.setIdentity();

  frameInA.setOrigin(Ammo.btVector3(0, 0, 0));
  frameInB.setOrigin(Ammo.btVector3(0, 0, 0));

  var lowerSliderLimit = new Ammo.btVector3(0, hh / 2 + w / 2 + pad, -l / 2 + w / 2);
  var hiSliderLimit = new Ammo.btVector3(0, hh / 2 + w / 2 - pad, -l / 2 + w / 2);
  var lowerAngularLimit = new Ammo.btVector3(0, 0, 0);
  var hiAngularLimit = new Ammo.btVector3(0, 0, 0);

  const balanceConstraintA = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangA.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );

  lowerSliderLimit.setValue(0, hh / 2 + w / 2 + pad, l / 2 - w / 2);
  hiSliderLimit.setValue(0, hh / 2 + w / 2 - pad, l / 2 - w / 2);

  const balanceConstraintB = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangB.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );
}


// 天平
function createBalanceCly() {
  let material = new THREE.MeshLambertMaterial({ color: 0xff4488, opacity: .9, transparent: true });
  const pos = new THREE.Vector3(0, 0, 0);
  quat.set(0, 0, 0, 1);
  pos.z += params.seesawLength / 2;
  const pad = 0.1;
  const w = params.rampHeight;
  const pw = params.startPlatformWidth;
  const l = params.balanceLength;
  const h = params.balanceHeight;
  const hh = h - params.seesawHeight - w;


  const r = params['balanceSize'];
  const mass = 0.1;
  const friction = params['balanceFriction']
  const restitution = params['balanceRestitution'];

  pos.y = w / 2;
  const crossbeam = createParalellepiped(pw, w, l, mass * 0.25, pos, quat, material, friction, restitution);

  const basePos = crossbeam.position.clone();
  pos.set(basePos.x, w / 2 + basePos.y, basePos.z - l / 2 + pw / 4);
  const hangA = createWheelNew2(pw / 2, w, mass, pos, quat, material)
  pos.set(basePos.x, w / 2 + basePos.y, basePos.z + l / 2 - pw / 4);
  const hangB = createWheelNew2(pw / 2, w, mass, pos, quat, material)
  // 添加约束

  var frameInA = new Ammo.btTransform();
  var frameInB = new Ammo.btTransform();

  frameInA.setIdentity();
  frameInB.setIdentity();

  frameInA.setOrigin(Ammo.btVector3(0, 0, 0));
  frameInB.setOrigin(Ammo.btVector3(0, 0, 0));

  var lowerSliderLimit = new Ammo.btVector3(0, w / 2 + w / 2 - pad, -l / 2 + pw / 4);
  var hiSliderLimit = new Ammo.btVector3(0, w / 2 + w / 2 + pad, -l / 2 + pw / 4);
  var lowerAngularLimit = new Ammo.btVector3(0, 0, 0);
  var hiAngularLimit = new Ammo.btVector3(0, 0, 0);

  const balanceConstraintA = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangA.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );

  lowerSliderLimit.setValue(0, w / 2 + w / 2 - pad, l / 2 - pw / 4);
  hiSliderLimit.setValue(0, w / 2 + w / 2 + pad, l / 2 - pw / 4);

  const balanceConstraintB = create6DofConstraint(
    crossbeam.userData.physicsBody,
    hangB.userData.physicsBody,
    frameInA, frameInB,
    lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  );
}

function createWheelNew(radius, height, mass, pos, quat, material) {
  const wheel_geometry = new THREE.CylinderGeometry(radius, radius, height, 40)
  const wheel = new THREE.Mesh(wheel_geometry, material)
  wheel.rotation.x = Math.PI / 2
  const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, radius, radius))
  createRigidBody(wheel, shape, mass, pos)
  return wheel
}
function createWheelNew2(radius, height, mass, pos, quat, material) {
  const wheel_geometry = new THREE.CylinderGeometry(radius, radius, height, 40)
  const wheel = new THREE.Mesh(wheel_geometry, material)
  const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * .5, radius))
  createRigidBody(wheel, shape, mass, pos, quat)
  return wheel
}

function createNewObject() {
  let material = new THREE.MeshLambertMaterial({ color: 0xff4488, opacity: .9, transparent: true });
  const pos = new THREE.Vector3(0, 0, 0)
  quat.set(0, 0, 0, 1);
  const pad = 0.1;
  const w = params.rampHeight;
  const pw = params.startPlatformWidth;
  const l = params.balanceLength;
  const h = 1;
  const hh = 4;

  const r = params['balanceSize'];
  const mass = params['balanceMass'];
  const friction = params['balanceFriction']
  const restitution = params['balanceRestitution'];
  pos.y = h / 2 + pw;

  const crossbeam = createParalellepiped(pw, w, l, mass * 0.25, pos, quat, material, friction, restitution);
  const basePos = crossbeam.position.clone();
  pos.set(basePos.x, pw / 2, basePos.z - l / 2 + pw / 4 - h / 2);
  const hangA = createWheelNew(pw / 2, h, mass, pos, quat, material)

  quat.set(0, 0, 0, 1);
  // createParalellepiped(pw, hh, w, mass, pos, quat, material, friction, restitution);
  pos.set(basePos.x, pw / 2, basePos.z + l / 2 - pw / 4 + h / 2)
  const hangB = createWheelNew(pw / 2, h, mass, pos, quat, material)
  // 添加约束

  var frameInA = new Ammo.btTransform();
  var frameInB = new Ammo.btTransform();

  frameInA.setIdentity();
  frameInB.setIdentity();

  frameInA.setOrigin(Ammo.btVector3(0, 0, 0));
  frameInB.setOrigin(Ammo.btVector3(0, 0, 0));

  var lowerSliderLimit = new Ammo.btVector3(0, -pw / 2 - w / 2, - l / 2 + pw / 4 - h / 2);
  var hiSliderLimit = new Ammo.btVector3(0, -pw / 2 - w / 2, - l / 2 + pw / 4 - h / 2);
  var lowerAngularLimit = new Ammo.btVector3(Math.PI / 2, 0, 0);
  var hiAngularLimit = new Ammo.btVector3(Math.PI / 2, 0, 0);

  // const balanceConstraintA = create6DofConstraint(
  //   crossbeam.userData.physicsBody,
  //   hangA.userData.physicsBody,
  //   frameInA, frameInB,
  //   lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  // );

  lowerSliderLimit.setValue(0, -pw / 2 - w / 2, l / 2 - pw / 4);
  hiSliderLimit.setValue(0, -pw / 2 - w / 2, l / 2 - pw / 4);

  // const balanceConstraintB = create6DofConstraint(
  //   crossbeam.userData.physicsBody,
  //   hangB.userData.physicsBody,
  //   frameInA, frameInB,
  //   lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
  // );
}

function create6DofConstraint(
  bodyA, bodyB, frameInA, frameInB,
  lowerSliderLimit, hiSliderLimit, lowerAngularLimit, hiAngularLimit
) {

  const constraint = new Ammo.btGeneric6DofSpringConstraint(
    bodyA,
    bodyB,
    frameInA,
    frameInB,
    true
  );

  if (lowerSliderLimit) constraint.setLinearLowerLimit(lowerSliderLimit);
  if (hiSliderLimit) constraint.setLinearUpperLimit(hiSliderLimit);
  if (lowerAngularLimit) constraint.setAngularLowerLimit(lowerAngularLimit);
  if (hiAngularLimit) constraint.setAngularUpperLimit(hiAngularLimit);

  physicsWorld.addConstraint(constraint)

  return constraint;
}

function createTransformSimple(x, y, z) {
  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(x, y, z))
  return transform
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