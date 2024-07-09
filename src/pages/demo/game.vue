<script setup>
import { ref, watch } from 'vue';
import * as THREE from 'three'
import { MD2Character } from 'three/addons/misc/MD2Character.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
let scene, camera, renderer
let physicsWorld, transformAux
const gravityConstant = -9.8, quat = new THREE.Quaternion(), textureLoader = new THREE.TextureLoader()
const rigidBodies = [], clock = new THREE.Clock()
let personCharachter, planes = [], needUpdatePlane = ref(false), obstacleTree
let currentScore = ref(0), firstTime = 0
const highestScore = ref(localStorage.getItem('highestScore') || 0), frontPosition = new THREE.Vector3(-12, 15, 200), endPosition = new THREE.Vector3(-10, 135, -400)

// 人物短时间更改动作，只使用后面的动作
const changeAnimation = debounce(setAnimation, 60)
function setAnimation(number) {
  personCharachter.setAnimation(personCharachter.meshBody.geometry.animations[number].name)
}

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib
  drawGraphics()
})

// 游戏整体
function drawGraphics() {
  createObstacle()
  initGraphics()
  initPhysics()
  createField()
  initPerson()
}

// 初始化场景等内容
function initGraphics() {
  scene = new THREE.Scene()
  scene.background = textureLoader.load('src/assets/texture/sky.webp')

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 3000)
  camera.position.copy(frontPosition)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0xeeeeee)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const ambientLight = new THREE.AmbientLight(0xbbbbbb)
  scene.add(ambientLight)

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(-7, 10, 15)
  light.castShadow = true
  const d = 100
  light.shadow.camera.left = light.shadow.camera.bottom = -d
  light.shadow.camera.right = light.shadow.camera.top = d
  light.shadow.camera.near = -1000
  light.shadow.camera.far = 3050
  light.shadow.mapSize.x = 2024
  light.shadow.mapSize.y = 2024
  light.shadow.bias = -.003
  scene.add(light)

  let container = document.getElementById('threeDoc')
  if (container) {
    container.appendChild(renderer.domElement)
    renderThreeBefore()
    touchAction()
  }
}

// 初始化物理环境
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

/**
 * 创建地面
 * @param {number} 地面长度 
 * @param {number} 与后一个地面的间隔 
 */
function createField(length = 500, interval = 0) {
  const x = 120, y = 40, z = length, material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, map: textureLoader.load('src/assets/general/wood-2.jpg') }), material2 = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, map: textureLoader.load('src/assets/grasslight-big.jpg') });
  material2.map.wrapS = THREE.RepeatWrapping
  material2.map.wrapT = THREE.RepeatWrapping
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z, 1, 1, 1), [material, material, material2, material, material, material])
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.interval = interval

  scene.add(mesh)
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(x * .5, y * .5, z * .5))
  quat.set(0, 0, 0, 1);
  createRigidBody(mesh, shape, 0, new THREE.Vector3(0, -20, getPosition(length)), quat)
  needObstacleTree(length, mesh)
  planes.push(mesh)
}

/**
 * 当前地板是否需要添加障碍物树
 * @param {number} width 地面长度
 * @param {THREE.Mesh} mesh 地面
 */
function needObstacleTree(width, mesh) {
  if (obstacleTree) {
    let flat = true, length = planes.length
    if (width < 60 || length < 4) {
      return false
    }
    for (let i = 0; i < 3; i++) {
      if (planes[length - i] && planes[length - i].userData.treex !== undefined) {
        flat = false
        break
      }
    }
    if (!flat) {
      return false
    }
    if (Math.random() < .5) {
      return false
    }

    const position = Math.random()
    const x = position < .333 ? -40 : position > .666 ? 40 : 0
    let tree = obstacleTree.clone()
    tree.position.set(x, 20, 0)
    mesh.add(tree)
    mesh.userData.treeX = x
    return true
  }
  return false
}

/**
 * 获取新建地面对应的z坐标
 * @param {number} width 地面长度
 */
function getPosition(width) {
  let z = 0, length = planes.length
  if (planes.length < 1) return z;
  z = planes[0].position.z - planes[0].geometry.parameters.depth / 2
  for (let i = 0; i < length; i++) {
    z += planes[i].geometry.parameters.depth + planes[i].userData.interval
  }
  return z + width / 2
}

// 创建障碍物
function createObstacle() {
  let loader = new GLTFLoader()
  loader.load('src/assets/Shrub.glb', (result) => {
    obstacleTree = result.scene.children[0].children[0]
    obstacleTree.children[0].material = new THREE.MeshLambertMaterial({
      color: 0x405732
    })
    obstacleTree.children[1].material = new THREE.MeshLambertMaterial({
      color: 0x725540
    })
    obstacleTree.scale.set(.6, .6, .6)
    obstacleTree.castShadow = true
  })
}

// 创建人物
function initPerson() {
  let configOgro = {
    baseUrl: 'src/assets/',
    body: 'ogro.md2',
    skins: ['skin.jpg'],
    weapons: []
  }
  personCharachter = new MD2Character()
  personCharachter.onLoadComplete = function () {
    changeAnimation(0)
  }
  personCharachter.loadParts(configOgro)
  scene.add(personCharachter.root)
}

// 操作按钮
function touchAction() {
  window.addEventListener('keydown', function (event) {
    const position = personCharachter.meshBody.position
    switch (event.code) {
      case 'ArrowLeft':
        personCharachter.meshBody.position.set(position.x + 10, position.y, position.z)
        dealPersonPosition()
        break;
      case 'ArrowRight':
        personCharachter.meshBody.position.set(position.x - 10, position.y, position.z)
        dealPersonPosition()
        break;
      case 'ArrowUp':
        jump(30)
        break;
    }
  })
}

/**
 * 人物跳跃动作处理
 * @param {number} 跳跃高度 
 */
function jump(height) {
  changeAnimation(6)
  const position = personCharachter.meshBody.position.clone(), now = new Date().getTime()
  let space = 3
  function jumpActive() {
    const currentTime = (new Date().getTime() - now) / (space * 20)
    if (space < height) {
      if (currentTime > 0) {
        personCharachter.meshBody.position.set(position.x, position.y + space, position.z)
        space += 3
      }
      requestAnimationFrame(jumpActive)
    } else {
      dealPersonPosition()
    }
  }
  jumpActive()
}

// 根据人物位置做对应处理
function dealPersonPosition() {
  if (!personCharachter || !personCharachter.meshBody)
    return;
  const position = personCharachter.meshBody.position
  if (position.x > 60 || position.x < -60) {
    personSag(10)
  }
  if (position.y > 0) {
    personSag(1, 0)
  }
}

/**
 * 人物下落运动处理
 * @param {number} speed 下落速度
 * @param {number} bottom 着陆点
 */
function personSag(speed, bottom = null) {
  function sag() {
    const position = personCharachter.meshBody.position
    if (bottom !== null) {
      // 人物跳跃下落处理
      if (position.y - speed > bottom) {
        personCharachter.meshBody.position.set(position.x, position.y - speed, position.z)
        requestAnimationFrame(sag)
      } else {
        personCharachter.meshBody.position.set(position.x, bottom, position.z)
        changeAnimation(1)
      }
    } else {
      // 人物掉落下落处理
      if (position.y - speed > - window.innerHeight / 2) {
        personCharachter.meshBody.position.set(position.x, position.y - speed, position.z)
        requestAnimationFrame(sag)
      } else {
        needUpdatePlane.value = false
      }
    }
  }
  sag()
}

function createRigidBody(object, physicsShape, mass, pos, quat) {
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

// 地面运动处理，保持人物始终z坐标为0
function updatePlane() {
  dealPlaneLength()
  let i = 0
  while (i < planes.length) {
    const position = planes[i].position
    if (planes[i].userData.interval !== 0) { //地面有间隔，判断人物是否下落
      if (position.z < -planes[i].geometry.parameters.depth / 2) {
        if (!planes[i + 1] || !planes[i + 1].position) {
          personSag(10)
        } else {
          const nextPosition = planes[i + 1].position, personPosition = personCharachter.meshBody.position
          if (personPosition.y < 1 && nextPosition.z > planes[i + 1].geometry.parameters.depth / 2) {
            personSag(10)
          }
        }
      }
    }

    //地面有障碍物，判断人物是否障碍物相撞
    if (planes[i].userData.treeX !== undefined && planes[i].position.z < 20 && planes[i].position.z > 0) {
      const personPosition = personCharachter.meshBody.position
      if ((planes[i].userData.treeX < 0 && personPosition.x < -20) ||
        (planes[i].userData.treeX > 0 && personPosition.x > 20) ||
        (planes[i].userData.treeX === 0 && (personPosition.x <= 0 && personPosition.x > -20 || personPosition.x > 0 && personPosition.x < 20))) {
        changeAnimation(9)
        needUpdatePlane.value = false
      }
    }
    // 移除视野外的地面
    if (position.z < -window.innerWidth / 2) {
      scene.remove(planes[i])
      planes.splice(i, 1)
    } else {
      planes[i].position.set(position.x, position.y, position.z - 1)
      i++
    }
  }
}

// 地面长度不够，新增地面
function dealPlaneLength() {
  function addPlane() {
    let newLength = 40 + Math.random() * 100
    const endPlane = planes[planes.length - 1]
    if (endPlane && endPlane.position) {
      const positionZ = endPlane.position.z, endPlaneLength = endPlane.geometry.parameters.depth
      if (positionZ + endPlaneLength / 2 < window.innerWidth / 2) {
        let needInterval = Math.random() > .5
        createField(newLength, needInterval ? 30 : 0)
        requestAnimationFrame(addPlane)
      }
    }
  }
  addPlane()
}

// 地面初始化
function initPlanes() {
  if (planes.length > 0) {
    planes.forEach((plane) => {
      scene.remove(plane)
    })
    planes = []
  }
  createField()
}

// 开始游戏
function startGame() {
  highestScore.value = localStorage.getItem('highestScore') || 0
  needUpdatePlane.value = true
}

function debounce(fn, delay) {
  let timer
  return function (...rest) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(this, ...rest)
    }, delay)
  }
}

// 根据needUpdatePlane的状态，开始或结束游戏
watch(needUpdatePlane, (value, oldValue) => {
  if (!value && oldValue) {
    setTimeout(() => {
      camera.position.copy(frontPosition)
      changeAnimation(0)
      personCharachter.meshBody.position.set(0, 0, 0)
      camera.lookAt(new THREE.Vector3(0, 0, 0))
      initPlanes()
    }, 1000)
    if (parseInt(highestScore.value) < currentScore.value) {
      localStorage.setItem('highestScore', currentScore.value)
      highestScore.value = currentScore.value
    }
  }
  if (value && !oldValue) {
    camera.position.copy(endPosition)
    setTimeout(() => {
      changeAnimation(1)
      firstTime = new Date().getTime()
    }, 60)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
  }
})

// three渲染
function renderThreeBefore() {
  function renderThree() {
    requestAnimationFrame(renderThree)
    const deltaTime = clock.getDelta()
    updatePhysics(deltaTime)
    renderer.render(scene, camera)

    personCharachter && personCharachter.update(deltaTime)

    if (needUpdatePlane.value && firstTime !== 0) {
      currentScore.value = Math.floor((new Date().getTime() - firstTime) / 1000)
      updatePlane()
    }
  }
  renderThree()
}
</script>
<template>
  <div id="threeDoc"></div>
  <div class="score-panel" v-if="needUpdatePlane">
    <div>最高记录：{{ highestScore }}秒</div>
    <div>当前成绩：{{ currentScore }}秒</div>
  </div>
  <div class="active-panel" v-if="!needUpdatePlane">
    <img src="@/assets/texture/profile.png" />
    <div>最高记录：{{ highestScore }}秒</div>
    <button class="btn-box" @click="startGame">开始游戏</button>
  </div>
</template>
<style scoped>
.threeDoc {
  position: absolute;
  margin: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.score-panel {
  position: absolute;
  top: 50px;
  background-color: rgba(0, 0, 0, .6);
  color: white;
  left: 15px;
  padding: 10px;
  border-radius: 4px;
}

.active-panel {
  position: absolute;
  width: 200px;
  top: 50%;
  left: 50%;
  background-color: rgba(0, 0, 0, .6);
  border-radius: 4px;
  color: white;
  padding: 10px;
  transform: translate(-50%, -50%);
  text-align: center;
}

.active-panel img {
  border-radius: 50%;
  position: relative;
  width: 80px;
  height: auto;
  margin-top: 30px;
  margin-bottom: 10px;
}

.active-panel .btn-box {
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: rgb(31, 152, 233);
  color: white;
  line-height: 30px;
  width: 80px;
  outline: none;
  border: 0;
}
</style>