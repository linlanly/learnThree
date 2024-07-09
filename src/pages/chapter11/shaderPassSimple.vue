<script setup>
import * as THREE from 'three'
import { onMounted } from 'vue'
import * as Stats from 'stats.js'
import { GUI } from "three/addons/libs/lil-gui.module.min.js"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { MirrorShader } from 'three/addons/shaders/MirrorShader.js';
import { HueSaturationShader } from 'three/addons/shaders/HueSaturationShader.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { BrightnessContrastShader } from 'three/addons/shaders/BrightnessContrastShader.js';
import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
import { SepiaShader } from 'three/addons/shaders/SepiaShader.js';
import { KaleidoShader } from 'three/addons/shaders/KaleidoShader.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
import { TechnicolorShader } from 'three/addons/shaders/TechnicolorShader.js';
import { UnpackDepthRGBAShader } from 'three/addons/shaders/UnpackDepthRGBAShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
let orbitControl, scene, clock, controls, composer
let cube1, cube2, cube3

function createMesh(geometry) {
  const planetTexture = new THREE.TextureLoader().load('src/assets/planets/Earth.png')
  const specularTexture = new THREE.TextureLoader().load('src/assets/planets/EarthSpec.png')
  const normalTexture = new THREE.TextureLoader().load('src/assets/planets/EarthNormal.png')

  const planetMaterial = new THREE.MeshPhongMaterial()
  planetMaterial.specularMap = specularTexture
  planetMaterial.specular = new THREE.Color(0xffffff)
  planetMaterial.map = planetTexture
  planetMaterial.normalMap = normalTexture
  return new THREE.Mesh(geometry, planetMaterial)
}

function createSomething() {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 6000)

  let renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x889999)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera.position.x = 0;
  camera.position.y = 12;
  camera.position.z = 68;
  camera.lookAt(scene.position)

  let spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(0, 30, 30)
  spotLight.intensity = 2000
  spotLight.castShadow = true;
  spotLight.shadow.camera.fov = 120
  spotLight.shadow.camera.near = 1
  spotLight.shadow.camera.far = 1000
  scene.add(spotLight)

  let ambiColor = '#444444'
  let ambientLight = new THREE.AmbientLight(ambiColor)
  scene.add(ambientLight)

  const plane = new THREE.BoxGeometry(1600, 1600, .1, 40, 40)
  const cube = new THREE.Mesh(plane, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: new THREE.TextureLoader().load('src/assets/general/plaster-diffuse.jpg'),
    normalMap: new THREE.TextureLoader().load('src/assets/general/plaster-normal.jpg'),
    normalScale: new THREE.Vector2(.6, .6)
  }))
  cube.material.map.wrapS = THREE.RepeatWrapping
  cube.material.map.wrapT = THREE.RepeatWrapping
  cube.material.normalMap.wrapS = THREE.RepeatWrapping
  cube.material.normalMap.wrapT = THREE.RepeatWrapping
  cube.rotation.x = Math.PI / 2
  cube.material.map.repeat.set(80, 80)

  cube.receiveShadow = true
  cube.position.z = -150
  cube.position.x = -150
  scene.add(cube)

  cube1 = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 2), new THREE.MeshPhongMaterial({ color: 0xff0000 }))
  cube1.position.x = -15
  cube1.position.y = 5
  cube1.position.z = 15
  cube1.castShadow = true
  scene.add(cube1)

  cube2 = new THREE.Mesh().copy(cube1)
  cube2.material = cube1.material.clone()
  cube2.material.color = new THREE.Color(0x00ff00)
  cube2.position.z = 5
  cube2.position.x = -20
  scene.add(cube2)

  cube3 = cube1.clone()
  cube3.material = cube1.material.clone()
  cube3.material.color = new THREE.Color(0x0000ff)
  cube3.position.z = -8
  cube3.position.x = -25
  scene.add(cube3)

  orbitControl = new OrbitControls(camera, renderer.domElement)
  orbitControl.listenToKeyEvents(window)

  let doc = document.getElementById('threeDoc')

  if (doc) {
    const mtlLoader = new MTLLoader()
    mtlLoader.load('src/assets/sol/LibertStatue.mtl', material => {
      const objLoader = new OBJLoader()
      objLoader.load('src/assets/sol/LibertStatue.obj', result => {
        result.children.forEach(child => {
          child.castShadow = true
        })
        result.scale.set(20, 20, 20)
        result.position.x = 15
        result.position.z = 5
        scene.add(result)
      })
    })
    const mirror = new ShaderPass(MirrorShader)
    mirror.enabled = false

    const hue = new ShaderPass(HueSaturationShader)
    hue.enabled = false

    const vignette = new ShaderPass(VignetteShader)
    vignette.enabled = false

    const colorCorrection = new ShaderPass(ColorCorrectionShader)
    colorCorrection.enabled = false

    const rgbShift = new ShaderPass(RGBShiftShader)
    rgbShift.enabled = false

    const bright = new ShaderPass(BrightnessContrastShader)
    bright.uniforms.brightness.value = 0
    bright.uniforms.contrast.value = 0
    bright.enabled = false

    const colorify = new ShaderPass(ColorifyShader)
    colorify.uniforms.color.value = new THREE.Color(0xffffff)
    colorify.enabled = false

    const sepia = new ShaderPass(SepiaShader)
    sepia.uniforms.amount.value = 1
    sepia.enabled = false

    const kal = new ShaderPass(KaleidoShader)
    kal.enabled = false

    const lum = new ShaderPass(LuminosityShader)
    lum.enabled = false

    const techni = new ShaderPass(TechnicolorShader)
    techni.enabled = false

    const unpack = new ShaderPass(UnpackDepthRGBAShader)
    unpack.enabled = false

    const renderPass = new RenderPass(scene, camera)
    const effectCopy = new ShaderPass(CopyShader)
    effectCopy.renderToScreen = true

    composer = new EffectComposer(renderer)
    composer.addPass(renderPass)
    composer.addPass(bright)
    composer.addPass(sepia)
    composer.addPass(mirror)
    composer.addPass(colorify)
    composer.addPass(colorCorrection)
    composer.addPass(rgbShift)
    composer.addPass(vignette)
    composer.addPass(hue)
    composer.addPass(kal)
    composer.addPass(lum)
    composer.addPass(techni)
    composer.addPass(unpack)
    composer.addPass(effectCopy)

    controls = {
      brightness: .01,
      contrast: .01,
      select: 'none',
      color: 0xffffff,
      amount: 1,
      powRGB_R: 2,
      powRGB_G: 2,
      powRGB_B: 2,
      mulRGB_R: 1,
      mulRGB_G: 1,
      mulRGB_B: 1,
      rgbAmount: .005,
      angle: 0,
      side: 1,
      offset: 1,
      darkness: 1,
      hue: .01,
      saturation: .01,
      kalAngle: 0,
      kalSides: 6,
      rotate: false,
      switchShader() {
        switch (controls.select) {
          case 'none':
            controls.enableShader();
            break;
          case 'colorify':
            controls.enableShader(colorify);
            break;
          case 'brightness':
            controls.enableShader(bright);
            break;
          case 'sepia':
            controls.enableShader(sepia);
            break;
          case 'colorCorrection':
            controls.enableShader(colorCorrection);
            break;
          case 'rgbShift':
            controls.enableShader(rgbShift);
            break;
          case 'mirror':
            controls.enableShader(mirror);
            break;
          case 'vignette':
            controls.enableShader(vignette);
            break;
          case 'hueAndSaturation':
            controls.enableShader(hue);
            break;
          case 'kaleidoscope':
            controls.enableShader(kal);
            break;
          case 'luminosity':
            controls.enableShader(lum);
            break;
          case 'technicolor':
            controls.enableShader(techni);
            break;
          case 'unpackDepth':
            controls.enableShader(unpack);
            break;
        }
      },
      changeBrightness() {
        bright.uniforms.brightness.value = controls.brightness
        bright.uniforms.contrast.value = controls.contrast
      },
      changeColor() {
        colorify.uniforms.color.value = new THREE.Color(controls.color)
      },
      changeSepia() {
        sepia.uniforms.amount.value = controls.amount
      },
      changeCorrection() {
        colorCorrection.uniforms.mulRGB.value = new THREE.Vector3(controls.mulRGB_R, controls.mulRGB_G, controls.mulRGB_B)
        colorCorrection.uniforms.powRGB.value = new THREE.Vector3(controls.powRGB_R, controls.powRGB_G, controls.powRGB_B)
      },
      changeRGBShifter() {
        rgbShift.uniforms.amount.value = controls.rgbAmount
        rgbShift.uniforms.angle.value = controls.angle
      },
      changeMirror() {
        mirror.uniforms.side.value = controls.side
      },
      changeVignette() {
        vignette.uniforms.darkness.value = controls.darkness
        vignette.uniforms.offset.value = controls.offset
      },
      changeHue() {
        hue.uniforms.hue.value = controls.hue
        hue.uniforms.saturation.value = controls.saturation
      },
      changeKal() {
        kal.uniforms.sides.value = controls.kalSides
        kal.uniforms.angle.value = controls.kalAngle
      },
      enableShader(shader) {
        for (let i = 0; i < composer.passes.length - 1; i++) {
          if (composer.passes[i] == shader) {
            composer.passes[i].enabled = true
          } else {
            composer.passes[i].enabled = false
          }
        }
      }
    };
    const gui = new GUI();
    gui.add(controls, 'select', ['none', "colorify", 'brightness', 'sepia', 'colorCorrection', 'rgbShift', 'mirror', 'vignette', 'hueAndSaturation', 'kaleidoscope', 'luminosity', 'technicolor']).onChange(controls.switchShader)

    const bnFolder = gui.addFolder('Brightness')
    bnFolder.add(controls, 'brightness', -5, 5).onChange(controls.changeBrightness)
    bnFolder.add(controls, 'contrast', -10, 10).onChange(controls.changeBrightness)

    const clFolder = gui.addFolder('Colorify')
    clFolder.addColor(controls, 'color').onChange(controls.changeColor)

    const colFolder = gui.addFolder('Color Correction')
    colFolder.add(controls, 'powRGB_R', -10, 10).onChange(controls.changeCorrection)
    colFolder.add(controls, 'powRGB_B', -10, 10).onChange(controls.changeCorrection)
    colFolder.add(controls, 'powRGB_G', -10, 10).onChange(controls.changeCorrection)
    colFolder.add(controls, 'mulRGB_R', -10, 10).onChange(controls.changeCorrection)
    colFolder.add(controls, 'mulRGB_G', -10, 10).onChange(controls.changeCorrection)
    colFolder.add(controls, 'mulRGB_B', -10, 10).onChange(controls.changeCorrection)

    const sepiaFolder = gui.addFolder('Sepia')
    sepiaFolder.add(controls, 'amount', -10, 10).onChange(controls.changeSepia)

    const shiftFolder = gui.addFolder('RGB Shift')
    shiftFolder.add(controls, 'rgbAmount', -10, 10).onChange(controls.changeRGBShifter)
    shiftFolder.add(controls, 'angle', -10, 10).onChange(controls.changeRGBShifter)

    const mirrorFolder = gui.addFolder('mirror')
    mirrorFolder.add(controls, 'side', -10, 10).onChange(controls.changeMirror)

    const vignetteFolder = gui.addFolder('vignette')
    vignetteFolder.add(controls, 'darkness', -10, 10).onChange(controls.changeVignette)
    vignetteFolder.add(controls, 'offset', -10, 10).onChange(controls.changeVignette)

    const hueFolder = gui.addFolder('hue and saturation')
    hueFolder.add(controls, 'hue', -10, 10).onChange(controls.changeHue)
    hueFolder.add(controls, 'saturation', -10, 10).onChange(controls.changeHue)

    const kalFolder = gui.addFolder('Kaleidoscope')
    kalFolder.add(controls, 'kalAngle', -10, 10).onChange(controls.changeKal)
    kalFolder.add(controls, 'kalSides', -10, 10).onChange(controls.changeKal)
    kalFolder.add(controls, 'rotate')
    let stats = initStats()
    doc.append(renderer.domElement)
    renderThreeBefore(renderer, scene, camera, stats)
  }
}

function renderThreeBefore(renderer, scene, camera, stats) {
  function renderThree() {
    stats.update()
    let delta = clock.getDelta()
    orbitControl.update(delta)

    if (controls.rotate) {
      cube1.rotation.y += .01
      cube2.rotation.y += .01
      cube3.rotation.y += .01
    }

    composer.render(delta)
    requestAnimationFrame(renderThree)
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
onMounted(() => {
  createSomething()
})
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