import { delay, apply3DEffect, isMobileDevice, addCircularButton, createCloseButton, addToDOM, createTooltips } from '../functions.js'
import Experience from '../Experience.js'
import * as THREE from 'three'
import gsap from 'gsap'
import lottie from 'lottie-web'
import { saveAs } from 'file-saver'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'

export default class Level4 {
    constructor() {
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.environment = this.world.environment
        this.sphere = this.world.sphere
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.sizes = this.experience.sizes
        this.skybox = this.world.environment.skybox
        this.level3 = this.world.level3

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('level4')
        }

        this.sizes.on('resize', () => {
            this.previewResize()
        })

        this.setInitial()
        this.setCharacter()
    }

    setInitial() {
        this.camera.instance.position.set(0, 0, 5)
        this.camera.instance.lookAt(0, 0, 0)
        this.camera.instance.up.set(0, 1, 0)
        this.camera.instance.updateProjectionMatrix()

        if (this.camera.group) {
            this.camera.group.position.set(0, 0, 0)
            this.camera.group.rotation.set(0, 0, 0)
            this.camera.group.scale.set(1, 1, 1)
        }

        if (this.previewCamera) {
            this.previewCamera.position.copy(this.camera.instance.position)
            this.previewCamera.quaternion.copy(this.camera.instance.quaternion)
            this.previewCamera.up.copy(this.camera.instance.up)
            this.previewCamera.updateProjectionMatrix()
        }

        this.isMoving = false
        this.isStopping = false
        this.moveDirection = new THREE.Vector3(0, 0, -1)
        this.joystickForwardDirection = new THREE.Vector3(0, 0, -1)
        this.movingRange = 0
        this.currentAction = null
        this.isMouseDown = false
        this.previousMousePosition = { x: 0, y: 0 }
        this.isStandingUp = false
        this.isAnimating = false
        this.headBone = null
        this.neverEnterPreviewMode = true
        this.cameraShutterSound = document.getElementById('camera-shutter')
        this.cameraZoomSound = document.getElementById('camera-zoom')
        this.trashSound = document.getElementById('trash')

        this.isPreviewMode = false
        this.previewContainer = null
        this.previewCamera = null

        this.originalGroupRotation = new THREE.Euler()
        this.isDragging = false
        this.lastMouseY = 0
        this.dragRotationAxis = new THREE.Vector3(1, 0, 0)
        this.worldUp = new THREE.Vector3(0, 1, 0)
        this.maxPolarAngle = Math.PI * 0.13
        this.zoomSpeed = 0.7

        if (this.keyboardContainer) {
            this.keyboardContainer.remove()
            this.keyboardContainer = null
        }
        if (this.joyStickCanvas) {
            this.joyStickCanvas.remove()
            this.joyStickCanvas = null
        }

        this.removeControls

        if (this.mixer) {
            this.mixer.stopAllAction()
        }

        if (this.debug && this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('level4')
        }
    }

    async addHelpButtons() {
        this.worldSwitchButton = addCircularButton('Switch Realm', document.body, false, 'scale-in')
        if (isMobileDevice())
            this.takePhotoButton = this.addTakePhotoButton()
        else
            this.tooltipsButton = this.addTooltipsButton()

        await delay(100)
        this.worldSwitchButton.style.transform = 'scale(1)'
        if (this.tooltipsButton)
            this.tooltipsButton.style.transform = 'scale(1)'
        if (this.takePhotoButton)
            this.takePhotoButton.style.transform = 'scale(1)'

        this.worldSwitchButton.addEventListener('click', async () => {
            await this.removeControls()
            this.standUpAction.reset()
            this.standUpAction.time = 0
            this.standUpAction.paused = true
            this.standUpAction.play()
            this.standUpAction.crossFadeFrom(this.idleAction, 1, true)
            this.standingUpPositionChange(1, 0.3)
            this.destroyButton(this.worldSwitchButton)
            if (this.tooltipsButton)
                this.destroyButton(this.tooltipsButton)
            if (this.takePhotoButton)
                this.destroyButton(this.takePhotoButton)
            await delay(1000)
            this.isStandingUp = false
            this.currentAction = this.standUpAction
            this.setCards(true)
        }, { once: true })
    }

    addTooltipsButton() {
        const fragment = document.createDocumentFragment()

        const tooltipsButton = document.createElement('div')
        tooltipsButton.classList.add('tooltips-button')

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('viewBox', '0 0 320 512')

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z')

        svg.appendChild(path)

        let tooltips = null

        tooltips = createTooltips(['w', 'p', 'drag-turn'], false)

        tooltipsButton.appendChild(svg)
        tooltipsButton.appendChild(tooltips)

        fragment.appendChild(tooltipsButton)

        addToDOM(fragment)

        return tooltipsButton
    }

    addTakePhotoButton() {
        const fragment = document.createDocumentFragment()

        const photoButton = document.createElement('div')
        photoButton.classList.add('photo-button')

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('viewBox', '0 0 24 25')
        svg.setAttribute('fill', 'none')
        svg.classList.add('svg-icon')

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        g.setAttribute('stroke', '#fff')
        g.setAttribute('stroke-linecap', 'round')
        g.setAttribute('fill-rule', 'evenodd')
        g.setAttribute('clip-rule', 'evenodd')

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path1.setAttribute('d', 'm4 9c0-1.10457.89543-2 2-2h2l.44721-.89443c.33879-.67757 1.03131-1.10557 1.78889-1.10557h3.5278c.7576 0 1.4501.428 1.7889 1.10557l.4472.89443h2c1.1046 0 2 .89543 2 2v8c0 1.1046-.8954 2-2 2h-12c-1.10457 0-2-.8954-2-2z')

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path2.setAttribute('d', 'm15 13c0 1.6569-1.3431 3-3 3s-3-1.3431-3-3 1.3431-3 3-3 3 1.3431 3 3z')

        g.appendChild(path1)
        g.appendChild(path2)
        svg.appendChild(g)
        photoButton.appendChild(svg)
        fragment.appendChild(photoButton)

        addToDOM(fragment)

        this.photoButtonClickHandler = async (event) => {
            this.playAction(this.photoAction)
            this.photoAction.setLoop(THREE.LoopOnce)
            this.photoAction.clampWhenFinished = true
            this.photoActionInHandler = async (event) => {
                if (event.action === this.photoAction) {
                    await this.transitionToPreviewMode()
                    this.mixer.removeEventListener('finished', this.photoActionInHandler)
                }
            }
            this.mixer.addEventListener('finished', this.photoActionInHandler)
        }

        photoButton.addEventListener('click', this.photoButtonClickHandler, { once: true })

        return photoButton
    }

    async setCharacter() {
        this.character = this.resources.items.characterModel
        this.model = this.character.scene
        this.toWorld = this.world.level3.toWorld

        this.model.scale.set(0.5, 0.5, 0.5)
        this.model.position.set(0, - 10, 4)
        this.model.rotation.set(0, - 3, 0)
        this.camera.pauseMove()

        if (this.toWorld === 1) {
            this.movingRange = 32
            // this.environment.setSpotLight(1.7, 9, -18, 0, 0, -1, 850, 0.65, 0.2, false, 3700, 0, 0, 0, 0, true, 600)
            this.environment.setDirectionalLight('#ffffff', -1.5, 13, -21, 0, 1.78, 0.5, 5, 40)
            this.modelEnvMapIntensity = 0.05
            this.stepSound = document.getElementById('footsteps')
        }

        if (this.toWorld === 2) {
            this.movingRange = 60
            this.environment.setDirectionalLight('#f5c3a8', 20, 20, 17, 0, -0.26, 0.26, 5, 100)
            this.modelEnvMapIntensity = 0.1
            this.stepSound = document.getElementById('footsteps')
        }

        if (this.toWorld === 3) {
            this.movingRange = 25
            this.environment.setDirectionalLight('#fbf0cb', 15, 15, - 5, -0.3, 0.5, 0, 10, 32.5)
            this.modelEnvMapIntensity = 0.07
            this.stepSound = document.getElementById('footsteps')
        }

        this.skybox.material.needsUpdate = true
        this.setShadowPlane()

        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child.material) {
                child.material.envMap = this.environment.environmentMap.worldTexture
                child.material.envMapIntensity = this.modelEnvMapIntensity
                child.material.needsUpdate = true
            }
        })

        this.camera.instance.position.set(0, 0, 0)
        this.mixer = new THREE.AnimationMixer(this.model)
        this.standUpAction = this.mixer.clipAction(this.character.animations[2])
        this.idleAction = this.mixer.clipAction(this.character.animations[0])
        this.walkAction = this.mixer.clipAction(this.character.animations[3])
        this.photoAction = this.mixer.clipAction(this.character.animations[1])

        console.log(this.character)

        this.standUpAction.setLoop(THREE.LoopOnce)
        this.standUpAction.clampWhenFinished = true
        this.standUpAction.play()
        this.isStandingUp = true
        this.moveDirection.set(0, 0, -1)
        this.joystickForwardDirection.set(0, 0, -1)
        // console.log(this.moveDirection)

        this.mixer.addEventListener('finished', async (event) => {
            if (event.action === this.standUpAction) {
                this.isStandingUp = false
                this.idleAction.reset().play()
                this.idleAction.crossFadeFrom(this.standUpAction, 0.75, true)
                this.idleAction.setLoop(THREE.LoopRepeat)
                this.currentAction = this.idleAction
                await this.addControls()
                await this.addHelpButtons()
            }
        }, { once: true })

        this.headBone = this.model.getObjectByName('mixamorigHeadTop_End')
        this.headPosition = new THREE.Vector3()

        if (this.debug.active) {
            this.debugFolder.add(this.model.position, 'x').min(-100).max(100).step(0.01).name('positionX')
            this.debugFolder.add(this.model.position, 'y').min(-100).max(100).step(0.01).name('positionY')
            this.debugFolder.add(this.model.position, 'z').min(-100).max(100).step(0.01).name('positionZ')
            this.debugFolder.add(this.model.rotation, 'x').min(-10).max(10).step(0.01).name('rotationX')
            this.debugFolder.add(this.model.rotation, 'y').min(-10).max(10).step(0.01).name('rotationY')
            this.debugFolder.add(this.model.rotation, 'z').min(-10).max(10).step(0.01).name('rotationZ')
            this.debugFolder.add({ scale: this.model.scale.x }, 'scale').min(0).max(10).step(0.0001).name('scale').onChange((value) => {
                this.model.scale.set(value, value, value)
            })
        }

        this.movingSpeed = 0
        this.zeroSpeedTime = 0
    }

    setShadowPlane() {
        this.skyboxPosition = this.world.environment.skybox.position.clone()
        this.skyboxRadius = this.world.environment.skybox.geometry.parameters.radius

        this.shadowPlane = new THREE.CircleGeometry(this.skyboxRadius, 10)

        this.shadowPlaneMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            opacity: 1,
            side: THREE.DoubleSide,
            blending: THREE.MultiplyBlending,
        })

        // this.camera.controls.enabled = true
        // this.camera.controls.enableZoom = true
        this.shadowPlane = new THREE.Mesh(this.shadowPlane, this.shadowPlaneMaterial)

        this.shadowPlane.position.copy(this.skyboxPosition)
        this.shadowPlane.position.y = - 9.9

        if (this.debug.active) {
            this.debugFolder.add(this.shadowPlane.position, 'y').min(-100).max(100).step(0.01).name('shadowPlanePositionY')
        }

        this.shadowPlane.rotateX(-Math.PI / 2)

        this.shadowPlane.receiveShadow = true

        this.scene.add(this.shadowPlane)
    }

    async addControls() {
        if (isMobileDevice()) {
            await this.addJoystickControls()
            this.addTouchMoveControls()
        } else {
            this.addKeyboardControls()
            this.addMouseControls()
        }
    }

    async removeControls() {
        if (isMobileDevice()) {
            await this.removeJoystickControls()
            this.removeTouchMoveControls()
        } else {
            await this.removeKeyboardControls()
            this.removeMouseControls()
        }
    }

    


    addKeyboardControls() {
        this.keyboardDownHandler = async (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.isMoving = true
                    this.isStopping = false
                    this.playAction(this.walkAction)
                    if (this.keyboardContainer) {
                        if (this.toWorld === 1) {
                            this.keysElements['w'].classList.add('pressed-black')
                        }
                        else {
                            this.keysElements['w'].classList.add('pressed-white')
                        }
                    }
                    break
                case 'p':
                    this.playAction(this.photoAction)
                    this.photoAction.setLoop(THREE.LoopOnce)
                    this.photoAction.clampWhenFinished = true
                    this.photoActionInHandler = async (event) => {
                        if (event.action === this.photoAction) {
                            await this.transitionToPreviewMode()
                            this.mixer.removeEventListener('finished', this.photoActionInHandler)
                        }
                    }
                    this.mixer.addEventListener('finished', this.photoActionInHandler)
                    break
            }
        }

        this.keyboardUpHandler = (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.isMoving = false
                    this.isStopping = true
                    this.zeroSpeedTime = 0
                    this.playAction(this.idleAction)
                    if (this.keyboardContainer) {
                        if (this.toWorld === 1) {
                            this.keysElements[event.key].classList.remove('pressed-black')
                        }
                        else {
                            this.keysElements[event.key].classList.remove('pressed-white')
                        }
                    }
                    break
            }
        }

        window.addEventListener('keydown', this.keyboardDownHandler)
        window.addEventListener('keyup', this.keyboardUpHandler)
    }

    // addKeyboardControls() {
    //     this.keyboardDownHandler = (event) => {
    //         switch (event.key) {
    //             case 'w':
    //                 this.moveDirection.set(0, 0, -1)
    //                 this.isMoving = true
    //                 this.isStopping = false
    //                 this.playAction(this.walkAction)
    //                 break
    //             case 's':
    //                 this.moveDirection.set(0, 0, 1)
    //                 this.isMoving = true
    //                 this.isStopping = false
    //                 this.playAction(this.walkAction)
    //                 break
    //             case 'a':
    //                 this.moveDirection.set(-1, 0, 0)
    //                 this.isMoving = true
    //                 this.isStopping = false
    //                 this.playAction(this.walkAction)
    //                 break
    //             case 'd':
    //                 this.moveDirection.set(1, 0, 0)
    //                 this.isMoving = true
    //                 this.isStopping = false
    //                 this.playAction(this.walkAction)
    //                 break
    //         }
    //     }
    //     this.keyboardUpHandler = (event) => {
    //         switch (event.key) {
    //             case 'w':
    //             case 's':
    //             case 'a':
    //             case 'd':
    //                 this.isMoving = false
    //                 this.isStopping = true
    //                 this.zeroSpeedTime = 0
    //                 this.playAction(this.idleAction)
    //                 break
    //         }
    //     }
    //     window.addEventListener('keydown', this.keyboardDownHandler)

    //     window.addEventListener('keyup', this.keyboardUpHandler)
    // }

    async transitionToPreviewMode() {
        const originalPosition = this.camera.instance.position.clone()

        // Get the model head's world position
        this.headBone.getWorldPosition(this.headPosition)


        // Convert model head's world position to camera's local position
        const targetPosition = this.headPosition.clone().applyMatrix4(this.camera.group.matrixWorld.clone().invert())

        const direction = new THREE.Vector3().subVectors(targetPosition, this.camera.instance.position)

        direction.multiplyScalar(0.45)

        // Create a black overlay
        const overlay = document.createElement('div')
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: '0',
            zIndex: '1000'
        })
        addToDOM(overlay)

        // Animate the camera position and overlay opacity
        await new Promise((resolve) => {
            const duration = 1000 // 1 second in milliseconds
            const easeOut = (t) => t * (2 - t) // ease-out function

            let startTime = null
            const animate = (time) => {
                if (!startTime) startTime = time
                const elapsed = time - startTime
                const t = Math.min(elapsed / duration, 1)
                const easedT = easeOut(t)

                // Update camera position
                this.camera.instance.position.lerpVectors(originalPosition, direction, easedT)
                this.camera.instance.updateProjectionMatrix()

                // Update overlay opacity
                overlay.style.opacity = easedT

                if (t < 1) {
                    requestAnimationFrame(animate)
                } else {
                    resolve()
                }
            }

            requestAnimationFrame(animate)
        })

        // Restore the camera's original position
        this.camera.instance.position.copy(originalPosition)
        this.camera.instance.updateProjectionMatrix()

        // Enter preview mode
        await this.enterPreviewMode()

        // Remove the overlay
        overlay.remove()
    }

    renderPreview() {
        // Render the scene with post-processing
        this.composer.render()
    }

    async enterPreviewMode() {
        // Clean up any existing preview resources
        if (this.previewRenderer) {
            this.previewRenderer.dispose();
            this.previewRenderer = null;
        }
        if (this.composer) {
            this.composer.dispose();
            this.composer = null;
        }
        if (this.previewCamera) {
            this.camera.group.remove(this.previewCamera);
            this.previewCamera = null;
        }
        // Hide the character
        this.model.visible = false
        this.shadowPlane.visible = false

        await this.removeControls()
        this.isPreviewMode = true

        const textareas = document.querySelectorAll('textarea')
        if (textareas.length > 0) {
            textareas.forEach(textarea => textarea.remove())
        }

        this.originalGroupRotation.copy(this.camera.group.rotation)

        // Update rotation axis based on model's current direction
        this.updateDragRotationAxis()

        // Create preview container
        this.previewContainer = document.createElement('div')
        this.previewContainer.style.position = 'absolute'
        this.previewContainer.style.top = '0'
        this.previewContainer.style.left = '0'
        this.previewContainer.style.width = '100%'
        this.previewContainer.style.height = '100%'
        this.previewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
        this.previewContainer.style.zIndex = '1000'

        // Create preview renderer
        this.previewRenderer = new THREE.WebGLRenderer({ antialias: true })
        this.previewRenderer.setSize(this.sizes.width, this.sizes.height)
        this.previewContainer.appendChild(this.previewRenderer.domElement)

        // Create preview camera
        this.previewCamera = this.camera.instance.clone()
        this.previewCamera.position.y += 1.5
        this.camera.group.add(this.previewCamera)
        this.previewCamera.position.z += 5 // Start with camera moved back 5 units

        // Black mask
        this.blackMask = document.createElement('div')
        this.blackMask.classList.add('full-black')

        // Camera viewport
        const fragment = document.createDocumentFragment()
        this.cameraViewport = document.createElement('div')
        this.cameraViewport.classList.add('camera-viewport')
        const crosshair = document.createElement('div')
        crosshair.classList.add('crosshair')
        this.cameraViewport.appendChild(crosshair)
        fragment.appendChild(this.cameraViewport)

        // Add to DOM
        addToDOM(this.previewContainer)
        addToDOM(this.blackMask)
        addToDOM(fragment)

        // Create EffectComposer for post-processing
        this.composer = new EffectComposer(this.previewRenderer)
        this.composer.setSize(this.sizes.width, this.sizes.height)
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Add render pass
        const renderPass = new RenderPass(this.scene, this.previewCamera)
        this.composer.addPass(renderPass)

        // Add Bokeh pass for realistic blur effect
        this.bokehPass = new BokehPass(this.scene, this.previewCamera, {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01,
            width: this.sizes.width,
            height: this.sizes.height
        })
        this.composer.addPass(this.bokehPass)

        // Add FXAA pass for anti-aliasing
        const fxaaPass = new ShaderPass(FXAAShader)
        fxaaPass.uniforms['resolution'].value.set(1 / this.sizes.width, 1 / this.sizes.height)
        this.composer.addPass(fxaaPass)

        this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
        this.composer.addPass(this.gammaCorrectionPass)


        // Animate the transition from black screen to clear view
        await delay(100)
        this.blackMask.style.opacity = '0'
        await delay(1000)
        // Remove black mask
        this.blackMask.remove()

        if (this.level3.neverEnteredLevel4) {
            // Add preview tooltips
            let previewKeyboardTooltips = null
            if (isMobileDevice())
                previewKeyboardTooltips = createTooltips(['pinch-zoom', 'scroll-pan'], true)
            else
                previewKeyboardTooltips = createTooltips(['scroll-zoom', 'drag-pan', 'enter', 'esc'], true)
            const previewKeyboardTooltipsCloseButton = createCloseButton()

            this.previewTooltipsContainer = document.createElement('div')
            this.previewTooltipsContainer.classList.add('tooltips-container')
            this.previewTooltipsContainer.appendChild(previewKeyboardTooltips)
            this.previewTooltipsContainer.appendChild(previewKeyboardTooltipsCloseButton)
            this.previewTooltipsContainer.classList.add('fade-in')
            addToDOM(this.previewTooltipsContainer)
            await delay(1000)
            this.previewTooltipsContainer.classList.add('floating-text')

            await new Promise((resolve) => {
                previewKeyboardTooltipsCloseButton.addEventListener('click', () => {
                    this.previewTooltipsContainer.classList.remove('floating-text')
                    this.previewTooltipsContainer.classList.remove('fade-in')
                    this.previewTooltipsContainer.classList.add('fade-out')
                    window.setTimeout(() => {
                        this.previewTooltipsContainer.remove()
                        resolve()
                    }, 1000)
                }, { once: true })
            })
        }
        // Create a timeline for the blur effect and camera shake
        const totalDuration = 1.5 // Total duration in seconds
        const zoomDuration = 0.8 // Duration of each zoom in/out
        const numZooms = 1 // Number of zoom in/out pairs
        const remainingTime = totalDuration - (numZooms * 2 * zoomDuration) // Time left for pauses
        const pauseDurations = Array.from({ length: numZooms - 1 }, () => Math.random() * remainingTime / (numZooms - 1))

        const timeline = gsap.timeline({
            onComplete: () => {
                // Smoothly transition to only render pass
                gsap.to(this.bokehPass.uniforms['maxblur'], {
                    value: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
            }
        })

        // Add random zoom in and out animation
        const zoomTimeline = gsap.timeline()
        for (let i = 0; i < numZooms; i++) {
            const zoomIn = Math.random() * 4 + 2 // Random zoom in factor
            const zoomOut = Math.random() * 4 + 2 // Random zoom out factor
            this.cameraZoomSound.loop = false
            this.cameraZoomSound.currentTime = 0
            this.cameraZoomSound.play()
            zoomTimeline.to(this.previewCamera.position, {
                z: `+=${zoomIn}`,
                duration: zoomDuration,
                ease: "power2.inOut"
            }).to(this.previewCamera.position, {
                z: `-=${zoomOut}`,
                duration: zoomDuration,
                ease: "power2.inOut"
            })

            if (i < numZooms - 1) {
                zoomTimeline.to({}, { duration: pauseDurations[i] }) // Insert random pause
            }
        }

        // Add blur and clear animations to the timeline with seamless transitions
        timeline.to(this.bokehPass.uniforms['maxblur'], { value: 0.02, duration: totalDuration / 4, ease: "power2.inOut" })
            .to(this.bokehPass.uniforms['maxblur'], { value: 0, duration: totalDuration / 4, ease: "power2.inOut" })
            .to(this.bokehPass.uniforms['maxblur'], { value: 0.01, duration: totalDuration / 4, ease: "power2.inOut" })
            .to(this.bokehPass.uniforms['maxblur'], { value: 0, duration: totalDuration / 4, ease: "power2.inOut" })

        // Run both timelines simultaneously
        gsap.timeline().add(zoomTimeline).add(timeline, 0)


        // Render preview with post-processing
        this.renderPreview()

        this.level3.neverEnteredLevel4 = false
        this.neverEnterPreviewMode = false

        if (isMobileDevice()) {
            // Handle capture and exit
            this.previewCloseButton = createCloseButton()
            this.previewCloseButton.classList.add('top-left')
            addToDOM(this.previewCloseButton)

            this.cameraButton = this.createCameraButton()
            addToDOM(this.cameraButton)

            this.previewCloseButtonClickHandler = async () => {
                if (this.isPreviewMode) {
                    await this.exitPreviewMode()
                    if (this.previewCloseButton) {
                        this.previewCloseButton.removeEventListener('click', this.previewCloseButtonClickHandler)
                    }
                    if (this.cameraButton) {
                        this.cameraButton.removeEventListener('click', this.cameraButtonClickHandler)
                    }
                }
            }

            this.cameraButtonClickHandler = async () => {
                if (this.isPreviewMode) {
                    await this.captureScreenshot()
                    if (this.previewCloseButton) {
                        this.previewCloseButton.removeEventListener('click', this.previewCloseButtonClickHandler)
                    }
                    if (this.cameraButton) {
                        this.cameraButton.removeEventListener('click', this.cameraButtonClickHandler)
                    }
                }
            }

            this.previewCloseButton.addEventListener('click', this.previewCloseButtonClickHandler)
            this.cameraButton.addEventListener('click', this.cameraButtonClickHandler)

            // Add touch event listeners for mobile devices
            this.previewContainer.addEventListener('touchstart', this.handlePreviewTouchStart.bind(this))
            this.previewContainer.addEventListener('touchmove', this.handlePreviewScroll.bind(this))
            this.previewContainer.addEventListener('touchend', this.handlePreviewTouchEnd.bind(this))
            this.previewContainer.addEventListener('touchcancel', this.handlePreviewTouchEnd.bind(this))
        }
        else {
            // Handle capture and exit
            this.keyboardPreviewDownHandler = async (event) => {
                if (this.isPreviewMode) {
                    switch (event.key) {
                        case 'Enter':
                            await this.captureScreenshot()
                            break
                        case 'Escape':
                            await this.exitPreviewMode()
                            break
                    }
                }
            }
            window.addEventListener('keydown', this.keyboardPreviewDownHandler)

            // Add wheel event listener
            this.previewContainer.addEventListener('wheel', this.handlePreviewWheel.bind(this))
            this.previewContainer.addEventListener('mousedown', this.handlePreviewMouseDown.bind(this))
            this.previewContainer.addEventListener('mousemove', this.handlePreviewDrag.bind(this))
            this.previewContainer.addEventListener('mouseup', this.handlePreviewMouseUp.bind(this))
            this.previewContainer.addEventListener('mouseleave', this.handlePreviewMouseUp.bind(this))
        }
    }

    createCameraButton() {
        const fragment = document.createDocumentFragment()

        const cameraButton = document.createElement('div')
        cameraButton.className = 'camera-button'

        const outerCircle = document.createElement('div')
        outerCircle.className = 'outer-circle'

        const innerCircle = document.createElement('div')
        innerCircle.className = 'inner-circle'

        outerCircle.appendChild(innerCircle)
        cameraButton.appendChild(outerCircle)
        fragment.appendChild(cameraButton)

        return cameraButton
    }

    updateDragRotationAxis() {
        // Get the model's forward direction
        const modelForward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion)

        // Calculate the right vector (perpendicular to model's forward and world up)
        this.dragRotationAxis.crossVectors(this.worldUp, modelForward).normalize()

        // If the result is zero (model is looking straight up or down), use the world X axis
        if (this.dragRotationAxis.lengthSq() < 0.0001) {
            this.dragRotationAxis.set(1, 0, 0)
        }
    }

    handlePreviewWheel(event) {
        event.preventDefault()
        if (event.deltaY < 0) {
            // Zoom in
            this.previewCamera.position.z = Math.max((this.previewCamera.position.z - this.zoomSpeed), - 30)
        } else {
            // Zoom out
            this.previewCamera.position.z = Math.min((this.previewCamera.position.z + this.zoomSpeed), 16)
        }
        console.log(this.previewCamera.position.z)
        this.renderPreview()
    }

    handlePreviewMouseDown(event) {
        this.isDragging = true
        this.lastMouseY = event.clientY
        this.updateDragRotationAxis()
    }

    handlePreviewDrag(event) {
        if (!this.isDragging) return

        const deltaY = event.clientY - this.lastMouseY
        this.lastMouseY = event.clientY

        // Adjust rotation speed as needed
        const rotationSpeed = 0.005
        let rotationAngle = deltaY * rotationSpeed

        // Update rotation axis before applying rotation
        this.updateDragRotationAxis()

        // Check if the rotation would exceed the limit
        const newRotation = this.checkRotationLimit(rotationAngle)

        // Apply the allowed rotation
        if (newRotation !== 0) {
            const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(this.dragRotationAxis, newRotation)
            this.camera.group.quaternion.premultiply(rotationQuaternion)
        }

        this.renderPreview()
    }


    handlePreviewScroll(event) {
        event.preventDefault()

        if (event.touches.length === 1 && !this.isTwoFingerTouch) {
            // Single touch: handle rotation
            const touch = event.touches[0]
            const deltaY = touch.clientY - this.lastTouchY
            this.lastTouchY = touch.clientY

            // Adjust rotation speed as needed
            const rotationSpeed = 0.005
            let rotationAngle = deltaY * rotationSpeed

            // Update rotation axis before applying rotation
            this.updateDragRotationAxis()

            // Check if the rotation would exceed the limit
            const newRotation = this.checkRotationLimit(rotationAngle)

            // Apply the allowed rotation
            if (newRotation !== 0) {
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(this.dragRotationAxis, newRotation)
                this.camera.group.quaternion.premultiply(rotationQuaternion)
            }

            this.renderPreview()
        } else if (event.touches.length === 2) {
            // Two-finger touch: handle zoom
            this.isTwoFingerTouch = true
            const touch1 = event.touches[0]
            const touch2 = event.touches[1]

            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            )

            if (this.previousTouchDistance !== null) {
                const deltaDistance = currentDistance - this.previousTouchDistance
                const zoomSpeed = 0.06
                this.previewCamera.position.z = Math.min(Math.max(this.previewCamera.position.z - deltaDistance * zoomSpeed, -30), 16)
            }

            this.previousTouchDistance = currentDistance
            this.renderPreview()
        }
    }

    handlePreviewTouchStart(event) {
        if (event.touches.length === 1) {
            this.isTwoFingerTouch = false
            this.lastTouchY = event.touches[0].clientY
        } else if (event.touches.length === 2) {
            this.isTwoFingerTouch = true
            this.previousTouchDistance = Math.sqrt(
                Math.pow(event.touches[1].clientX - event.touches[0].clientX, 2) +
                Math.pow(event.touches[1].clientY - event.touches[0].clientY, 2)
            )
        }
    }

    handlePreviewTouchEnd(event) {
        if (event.touches.length < 2) {
            this.previousTouchDistance = null
            this.isTwoFingerTouch = false
        }
    }

    checkRotationLimit(proposedRotation) {
        // Get the camera's up direction in world space
        const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.group.quaternion)

        // Calculate the current angle between camera up and world up
        const currentAngle = cameraUp.angleTo(this.worldUp)

        // Calculate what the new angle would be after the proposed rotation
        const tempQuaternion = new THREE.Quaternion().setFromAxisAngle(this.dragRotationAxis, proposedRotation)
        const tempUp = cameraUp.clone().applyQuaternion(tempQuaternion)
        const newAngle = tempUp.angleTo(this.worldUp)

        // Check if the new angle would exceed the limit
        if (newAngle > this.maxPolarAngle) {
            // Calculate the maximum allowed rotation
            const maxRotation = this.maxPolarAngle - currentAngle
            return Math.sign(proposedRotation) * Math.min(Math.abs(proposedRotation), Math.abs(maxRotation))
        }

        // If within limits, return the original proposed rotation
        return proposedRotation
    }

    handlePreviewMouseUp() {
        this.isDragging = false
    }

    async captureScreenshot() {
        if (!this.isPreviewMode) return

        // Ensure we render the preview one last time before capturing
        this.renderPreview()

        // Capture the screenshot
        const screenshotDataUrl = this.previewRenderer.domElement.toDataURL('image/png')

        // Exit preview mode
        await this.exitPreviewMode()

        // Display the screenshot
        await this.displayScreenshot(screenshotDataUrl)
    }

    async exitPreviewMode(showHelpButtons = true) {
        this.isPreviewMode = false

        // Remove event listeners
        if (this.previewContainer) {
            if (isMobileDevice()) {
                this.previewContainer.removeEventListener('touchstart', this.handlePreviewTouchStart)
                this.previewContainer.removeEventListener('touchmove', this.handlePreviewScroll)
                this.previewContainer.removeEventListener('touchend', this.handlePreviewTouchEnd)
                this.previewContainer.removeEventListener('touchcancel', this.handlePreviewTouchEnd)
            } else {
                this.previewContainer.removeEventListener('mousedown', this.handlePreviewMouseDown)
                this.previewContainer.removeEventListener('mousemove', this.handlePreviewDrag)
                this.previewContainer.removeEventListener('mouseup', this.handlePreviewMouseUp)
                this.previewContainer.removeEventListener('mouseleave', this.handlePreviewMouseUp)
                this.previewContainer.removeEventListener('wheel', this.handlePreviewWheel)
            }
        }

        // Remove preview container
        if (this.previewContainer) {
            this.previewContainer.remove()
            this.previewContainer = null
        }

        // Remove camera viewport
        if (this.cameraViewport) {
            this.cameraViewport.remove()
            this.cameraViewport = null
        }

        // Remove black mask
        if (this.blackMask) {
            this.blackMask.remove()
            this.blackMask = null
        }

        // Remove preview tooltips container
        if (this.previewTooltipsContainer) {
            this.previewTooltipsContainer.remove()
            this.previewTooltipsContainer = null
        }

        // Remove preview close button
        if (this.previewCloseButton) {
            this.previewCloseButton.removeEventListener('click', this.previewCloseButtonClickHandler)
            this.previewCloseButton.remove()
            this.previewCloseButton = null
        }

        // Remove camera button
        if (this.cameraButton) {
            this.cameraButton.removeEventListener('click', this.cameraButtonClickHandler)
            this.cameraButton.remove()
            this.cameraButton = null
        }

        // Remove keyboard event listener
        window.removeEventListener('keydown', this.keyboardPreviewDownHandler)

        // Restore camera group rotation
        this.camera.group.rotation.copy(this.originalGroupRotation)

        // Dispose of preview renderer and composer
        if (this.previewRenderer) {
            this.previewRenderer.dispose()
            this.previewRenderer = null
        }
        if (this.composer) {
            this.composer.dispose()
            this.composer = null
        }

        // Remove preview camera
        if (this.previewCamera) {
            this.camera.group.remove(this.previewCamera)
            this.previewCamera = null
        }

        // Show the character and shadow plane again
        this.model.visible = true
        this.shadowPlane.visible = true

        // Play idleAction
        this.idleAction.reset().play()
        this.idleAction.crossFadeFrom(this.photoAction, 0.75, true)
        this.idleAction.setLoop(THREE.LoopRepeat)
        this.currentAction = this.idleAction

        if (this.takePhotoButton)
            this.takePhotoButton.addEventListener('click', this.photoButtonClickHandler, { once: true })

        // Add controls back
        await this.addControls()
    }

    debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    debouncedEnterPreviewMode = this.debounce(this.enterPreviewMode.bind(this), 300)


    async displayScreenshot(dataUrl) {
        this.cameraShutterSound.loop = false
        this.cameraShutterSound.volume = 0.3
        this.cameraShutterSound.currentTime = 0
        this.cameraShutterSound.play()

        this.worldSwitchButton.style.transform = 'scale(0)'
        if (this.takePhotoButton)
            this.takePhotoButton.style.transform = 'scale(0)'
        if (this.tooltipsButton)
            this.tooltipsButton.style.transform = 'scale(0)'

        await this.removeControls()
        this.camera.group.rotation.copy(this.originalGroupRotation)

        // Create DocumentFragment for better performance
        const fragment = document.createDocumentFragment()

        // Create container
        const container = document.createElement('div')
        container.classList.add('screenshot-container')

        const throwAway = document.createElement('div')
        throwAway.classList.add('throw-away-wrapper')

        const frame = document.createElement('div')
        frame.classList.add('screenshot-frame')

        // Create image element
        const img = document.createElement('img')
        img.src = dataUrl

        frame.appendChild(img)

        // Create delete button
        const deleteButton = document.createElement('div')
        deleteButton.classList.add('delete-button')
        deleteButton.innerHTML = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 14"
            class="svgIcon bin-top"
        >
            <g clip-path="url(#clip0_35_24)">
                <path
                    fill="black"
                    d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                ></path>
            </g>
            <defs>
                <clipPath id="clip0_35_24">
                    <rect fill="white" height="14" width="69"></rect>
                </clipPath>
            </defs>
        </svg>
    
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 57"
            class="svgIcon bin-bottom"
        >
            <g clip-path="url(#clip0_35_22)">
                <path
                    fill="black"
                    d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                ></path>
            </g>
            <defs>
                <clipPath id="clip0_35_22">
                    <rect fill="white" height="57" width="69"></rect>
                </clipPath>
            </defs>
        </svg>
    `
        // Create save button
        const saveButton = document.createElement('div')
        saveButton.classList.add('save-button')
        saveButton.innerHTML = `
        <svg class="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
        <span class="icon2"></span>
        <!--  <span class="tooltip">Download</span> -->
        `
        // Add container to fragment
        throwAway.appendChild(frame)
        container.appendChild(throwAway)
        container.appendChild(deleteButton)
        container.appendChild(saveButton)
        fragment.appendChild(container)

        // Use addToDOM function to add fragment to DOM
        addToDOM(fragment)

        frame.classList.add('scale-rotate-in')
        await delay(800)
        deleteButton.style.transform = 'scale(1.0)'
        saveButton.style.transform = 'scale(1.0)'
        frame.classList.remove('scale-rotate-in')
        frame.classList.add('floating-text')

        // Add event listener for close button
        if (this.previewContainer) {
            this.previewContainer.removeEventListener('mousedown', this.handlePreviewMouseDown)
            this.previewContainer.removeEventListener('mousemove', this.handlePreviewDrag)
            this.previewContainer.removeEventListener('mouseup', this.handlePreviewMouseUp)
            this.previewContainer.removeEventListener('mouseleave', this.handlePreviewMouseUp)
            this.previewContainer.removeEventListener('wheel', this.handlePreviewWheel)
        }

        window.removeEventListener('keydown', this.keyboardPreviewDownHandler)
        this.isPreviewMode = false

        const deleteClickHandler = async () => {
            this.trashSound.loop = false
            this.trashSound.volume = 0.4
            this.trashSound.playbackRate = 1.8
            this.trashSound.currentTime = 0
            this.trashSound.play()

            // Apply throw-away animation to frame
            frame.classList.add('throw-away')

            // Scale down close button
            deleteButton.style.transform = 'scale(0)'
            saveButton.style.transform = 'scale(0)'

            // Wait for animation to complete
            await delay(800)

            // Remove the entire container
            container.remove()

            cleanupPreviewResources()

            removeTheOtherListener()

            await this.addControls()
        }

        const saveClickHandler = async () => {
            if (isMobileDevice()) {
                // Use FileSaver.js to save the file on mobile devices
                const blob = await (await fetch(dataUrl)).blob()
                saveAs(blob, `virtual_journey_shot_${this.level3.worldName}.png`)
            } else {
                // Create a temporary anchor element
                const link = document.createElement('a')
                link.href = dataUrl
                link.download = `virtual_journey_shot_${this.level3.worldName}.png`

                // Trigger the download
                link.click()
            }

            frame.classList.add('down-load')

            // Scale down close button
            deleteButton.style.transform = 'scale(0)'
            saveButton.style.transform = 'scale(0)'

            // Wait for animation to complete
            await delay(800)

            // Remove the entire container
            container.remove()

            cleanupPreviewResources()

            removeTheOtherListener()

            await this.addControls()
        }

        const removeTheOtherListener = () => {
            deleteButton.removeEventListener('click', deleteClickHandler)
            saveButton.removeEventListener('click', saveClickHandler)

            this.worldSwitchButton.style.transform = 'scale(1)'
            if (this.takePhotoButton)
                this.takePhotoButton.style.transform = 'scale(1)'
            if (this.tooltipsButton)
                this.tooltipsButton.style.transform = 'scale(1)'
        }

        const cleanupPreviewResources = () => {
            dataUrl = null

            if (this.previewRenderer) {
                this.previewRenderer.dispose()
                this.previewRenderer = null
            }

            if (this.composer) {
                this.composer.dispose()
                this.composer = null
            }

            if (this.previewCamera) {
                this.camera.group.remove(this.previewCamera)
                this.previewCamera = null
            }

            if (this.previewContainer) {
                this.previewContainer.remove()
                this.previewContainer = null
            }
            if (this.cameraViewport) {
                this.cameraViewport.remove()
                this.cameraViewport = null
            }
            if (this.blackMask) {
                this.blackMask.remove()
                this.blackMask = null
            }
            if (this.previewTooltipsContainer) {
                this.previewTooltipsContainer.remove()
                this.previewTooltipsContainer = null
            }
            if (this.previewCloseButton) {
                this.previewCloseButton.removeEventListener('click', this.previewCloseButtonClickHandler)
                this.previewCloseButton.remove()
                this.previewCloseButton = null
            }
            if (this.cameraButton) {
                this.cameraButton.removeEventListener('click', this.cameraButtonClickHandler)
                this.cameraButton.remove()
                this.cameraButton = null
            }

            window.removeEventListener('keydown', this.keyboardPreviewDownHandler)
        }

        deleteButton.addEventListener('click', deleteClickHandler, { once: true })

        saveButton.addEventListener('click', saveClickHandler, { once: true })

        // Ensure the screenshot is displayed before the next frame render
        requestAnimationFrame(() => {
            img.style.display = 'block'
        })
    }


    async removeKeyboardControls() {
        window.removeEventListener('keydown', this.keyboardDownHandler)
        window.removeEventListener('keyup', this.keyboardUpHandler)
        // await this.removeKeyboardIndicator()
    }

    addMouseControls() {
        this.mouseDownHandler = (event) => {
            this.isMouseDown = true
            this.previousMousePosition.x = event.clientX
            this.previousMousePosition.y = event.clientY
        }
        this.mouseUpHandler = () => {
            this.isMouseDown = false
        }
        this.mouseMoveHandler = (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.previousMousePosition.x

                const rotation = new THREE.Euler(0, 0, 0, 'YXZ')
                rotation.y -= deltaX * 0.02
                this.updateMoveDirection(rotation)

                this.camera.group.rotation.y -= deltaX * 0.02

                this.previousMousePosition.x = event.clientX
            }
        }

        window.addEventListener('mousedown', this.mouseDownHandler)

        window.addEventListener('mouseup', this.mouseUpHandler)

        window.addEventListener('mousemove', this.mouseMoveHandler)
    }

    updateMoveDirection(rotation) {
        // Create a vector representing "forward"
        const forward = this.moveDirection

        // Create a quaternion representing the model's rotation
        const quaternion = new THREE.Quaternion()
        quaternion.setFromEuler(rotation)

        // Apply the model's rotation to the "forward" vector
        forward.applyQuaternion(quaternion)

        // Update moveDirection
        this.moveDirection.copy(forward)
    }


    removeMouseControls() {
        window.removeEventListener('mousedown', this.mouseDownHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
        window.removeEventListener('mousemove', this.mouseMoveHandler)
    }

    async addJoystickControls() {
        this.joyStickCanvas = document.createElement('canvas')
        this.joyStickCanvas.classList.add('canvas-2d', 'opacity-in')
        this.joyStickCanvas.width = window.innerWidth
        this.joyStickCanvas.height = window.innerHeight

        addToDOM(this.joyStickCanvas)


        await delay(1000)
        this.joyStickCanvas.classList.remove('opacity-in')

        this.joyStickCanvasCtx = this.joyStickCanvas.getContext('2d')

        this.joystickRadius = Math.min(this.sizes.width, this.sizes.height) * 0.175
        this.joystickCenterX = this.sizes.width - this.joystickRadius - 35
        this.joystickCenterY = this.sizes.height - this.joystickRadius - 35

        this.joyStickPositions = {
            fixedX: this.joystickCenterX,
            fixedY: this.joystickCenterY,
            innerX: this.joystickCenterX,
            innerY: this.joystickCenterY
        }

        this.joyStickaAngle = undefined

        this.touchMoveCalculator = (x, y) => {
            const dx = x - this.joyStickPositions.fixedX
            const dy = y - this.joyStickPositions.fixedY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < this.joystickRadius) {
                this.joyStickPositions.innerX = x
                this.joyStickPositions.innerY = y
            } else {
                this.joyStickPositions.innerX = this.joyStickPositions.fixedX + (dx / distance) * this.joystickRadius
                this.joyStickPositions.innerY = this.joyStickPositions.fixedY + (dy / distance) * this.joystickRadius
            }

            this.joyStickaAngle = Math.atan2(
                this.joyStickPositions.innerY - this.joyStickPositions.fixedY,
                this.joyStickPositions.innerX - this.joyStickPositions.fixedX
            )

            const forwardAngle = Math.atan2(this.joystickForwardDirection.x, this.joystickForwardDirection.z) - Math.PI
            this.moveDirection.set(Math.cos(this.joyStickaAngle), 0, Math.sin(this.joyStickaAngle))
            this.moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), forwardAngle)
            this.isMoving = true
            this.isStopping = false
            this.playAction(this.walkAction)
        }

        this.touchEndOrCancelCalculator = () => {
            this.joyStickPositions.innerX = this.joyStickPositions.fixedX
            this.joyStickPositions.innerY = this.joyStickPositions.fixedY
            this.joyStickaAngle = undefined
            this.isMoving = false
            this.isStopping = true
            this.zeroSpeedTime = 0
            this.joystickForwardDirection.copy(this.moveDirection)
            this.playAction(this.idleAction)
        }

        this.touchMoveHandler = (event) => {
            event.preventDefault()
            const touch = event.touches[0]
            const touchX = touch.clientX
            const touchY = touch.clientY

            if (touchX > this.joystickCenterX - this.joystickRadius && touchX < this.joystickCenterX + this.joystickRadius &&
                touchY > this.joystickCenterY - this.joystickRadius && touchY < this.joystickCenterY + this.joystickRadius) {
                this.touchMoveCalculator(touchX, touchY)
            }
        }

        this.touchEndOrCancelHandler = (event) => {
            event.preventDefault()
            this.touchEndOrCancelCalculator()
        }

        this.joyStickCanvas.addEventListener("touchmove", this.touchMoveHandler)
        this.joyStickCanvas.addEventListener("touchend", this.touchEndOrCancelHandler)
        this.joyStickCanvas.addEventListener("touchcancel", this.touchEndOrCancelHandler)

        this.joyStickCanvasResizeHandler = () => {
            this.joyStickCanvas.width = window.innerWidth
            this.joyStickCanvas.height = window.innerHeight

            this.joystickRadius = Math.min(this.sizes.width, this.sizes.height) * 0.175
            this.joystickCenterX = this.sizes.width - this.joystickRadius - 35
            this.joystickCenterY = this.sizes.height - this.joystickRadius - 35

            this.joyStickPositions.fixedX = this.joystickCenterX
            this.joyStickPositions.fixedY = this.joystickCenterY
            this.joyStickPositions.innerX = this.joystickCenterX
            this.joyStickPositions.innerY = this.joystickCenterY
        }

        window.addEventListener('resize', this.joyStickCanvasResizeHandler)
    }

    async removeJoystickControls() {
        if (this.joyStickCanvas) {
            this.joyStickCanvas.removeEventListener('touchstart', this.touchStartHandler)
            this.joyStickCanvas.removeEventListener('touchmove', this.touchMoveHandler)
            this.joyStickCanvas.removeEventListener('touchend', this.touchEndOrCancelHandler)
            this.joyStickCanvas.removeEventListener('touchcancel', this.touchEndOrCancelHandler)
            window.removeEventListener('resize', this.joyStickCanvasResizeHandler)
            this.joyStickCanvas.classList.add('opacity-out')
            await delay(500)
            this.joyStickCanvas.remove()
            this.joyStickCanvas = null
            this.joyStickCanvasCtx = null
        }
    }

    addTouchMoveControls() {
        this.touchStartHandler = (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0]
                const touchX = touch.clientX
                const touchY = touch.clientY

                // Check if the touch is within the joystick area
                const isInJoystickArea = touchX > this.joystickCenterX - this.joystickRadius &&
                    touchX < this.joystickCenterX + this.joystickRadius &&
                    touchY > this.joystickCenterY - this.joystickRadius &&
                    touchY < this.joystickCenterY + this.joystickRadius

                if (!isInJoystickArea) {
                    this.isTouchMoving = true
                    this.previousTouchPosition = { x: touchX, y: touchY }
                }
            }
        }

        this.touchMoveHandler = (event) => {
            if (this.isTouchMoving && event.touches.length === 1) {
                const touch = event.touches[0]
                const deltaX = touch.clientX - this.previousTouchPosition.x

                // Create a quaternion representing the rotation around the Y axis
                const rotationQuaternion = new THREE.Quaternion()
                rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), - deltaX * 0.01) // Adjust the rotation speed as needed

                // Apply the rotation to moveDirection
                this.moveDirection.applyQuaternion(rotationQuaternion)

                this.previousTouchPosition.x = touch.clientX
            }
        }

        this.touchEndHandler = () => {
            this.isTouchMoving = false
        }

        window.addEventListener('touchstart', this.touchStartHandler)
        window.addEventListener('touchmove', this.touchMoveHandler)
        window.addEventListener('touchend', this.touchEndHandler)
        window.addEventListener('touchcancel', this.touchEndHandler)
    }

    removeTouchMoveControls() {
        window.removeEventListener('touchstart', this.touchStartHandler)
        window.removeEventListener('touchmove', this.touchMoveHandler)
        window.removeEventListener('touchend', this.touchEndHandler)
        window.removeEventListener('touchcancel', this.touchEndHandler)
    }

    playAction(action) {
        if (this.currentAction !== action) {
            action.reset().play()
            action.crossFadeFrom(this.currentAction, 1, true)
            this.currentAction = action
        }
    }

    async destroyButton(button) {
        button.style.transform = 'scale(0)'
        await delay(1000)
        button.remove()
    }

    async setCards(apply3D) {
        // this.camera.controls.enabled = false
        this.selectionContainer = document.querySelector('.world-selection-container')
        this.selectionContainer.classList.remove('hidden')
        this.selectionContainer.classList.add('fade-in')

        this.cardContainer = document.querySelector('.card-container')
        this.cardCloseButton = document.getElementById('card-close-button')
        await delay(1000)
        this.cardCloseButton.style.transform = 'scale(1.0)'
        await delay(500)

        this.cardContainer = document.querySelector('.card-container')
        this.selectionContainer.classList.add('floating-text')
        this.cardContainer.classList.add('three-d')
        this.selectionContainer.classList.remove('fade-in')

        this.card1 = this.cardContainer.querySelector('.card-1')
        this.card2 = this.cardContainer.querySelector('.card-2')
        this.card3 = this.cardContainer.querySelector('.card-3')

        if (apply3D && !isMobileDevice()) {
            apply3DEffect(this.card1)
            apply3DEffect(this.card2)
            apply3DEffect(this.card3)
        }

        this.cardCloseButtonListener = async () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            await delay(500)
            this.hideContainer(this.selectionContainer)
            this.standUpAction.reset()
            this.standUpAction.paused = false
            this.standUpAction.play()
            this.isStandingUp = true
            this.removeOtherListeners()
        }
        this.card1ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.level3.toWorld = 1
            this.level3.enterWorld(this.level3.toWorld)
            this.removeOtherListeners()
        }
        this.card2ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.level3.toWorld = 2
            this.level3.enterWorld(this.level3.toWorld)
            this.removeOtherListeners()
        }
        this.card3ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.level3.toWorld = 3
            this.level3.enterWorld(this.level3.toWorld)
            this.removeOtherListeners()
        }

        this.removeOtherListeners = () => {
            this.cardCloseButton.removeEventListener('click', this.cardCloseButtonListener)
            this.card1.removeEventListener('click', this.card1ClickListener)
            this.card2.removeEventListener('click', this.card2ClickListener)
            this.card3.removeEventListener('click', this.card3ClickListener)
        }

        this.cardCloseButton.addEventListener('click', this.cardCloseButtonListener, { once: true })
        this.card1.addEventListener('click', this.card1ClickListener, { once: true })
        this.card2.addEventListener('click', this.card2ClickListener, { once: true })
        this.card3.addEventListener('click', this.card3ClickListener, { once: true })
    }

    standingUpPositionChange(duration = 1, offset = 0.1) {
        const halfDuration = duration / 2
        const originalY = this.model.position.y

        gsap.timeline()
            .to(this.model.position, {
                y: originalY + offset,
                duration: halfDuration,
                ease: "power1.out"
            })
            .to(this.model.position, {
                y: originalY,
                duration: halfDuration,
                ease: "power1.in"
            })
    }

    async hideContainer(container) {
        container.classList.remove('fade-in', 'floating-text')
        container.classList.add('fade-out')
        const fadeOutDuration = parseFloat(window.getComputedStyle(container).animationDuration) * 1000
        await delay(fadeOutDuration)
        container.classList.remove('fade-out')
        container.classList.add('hidden')

        if (this.card1 && this.card1ClickListener) {
            this.card1.removeEventListener('click', this.card1ClickListener)
        }
        if (this.card2 && this.card2ClickListener) {
            this.card2.removeEventListener('click', this.card2ClickListener)
        }
        if (this.card3 && this.card3ClickListener) {
            this.card3.removeEventListener('click', this.card3ClickListener)
        }
    }

    previewResize() {
        if (this.previewCamera) {
            this.previewCamera.aspect = this.sizes.width / this.sizes.height
            this.previewCamera.updateProjectionMatrix()
        }
        if (this.previewRenderer) {
            this.previewRenderer.setSize(this.sizes.width, this.sizes.height)
            this.previewRenderer.setPixelRatio(this.sizes.pixelRatio)
        }
        if (this.composer) {
            this.composer.setSize(this.sizes.width, this.sizes.height)
            this.composer.setPixelRatio(this.sizes.pixelRatio)
        }
    }

    update() {
        if (this.mixer) {
            this.mixer.update(this.time.delta * 0.001)
        }
        this.walkingSpeed = this.time.delta * 0.01
        this.startWalkingDelay = this.time.delta * 26
        if (this.headBone) {
            if (this.isMoving) {
                if (this.stepSound.paused) {
                    this.stepSound.currentTime = 0
                    this.stepSound.volume = 0.8
                    this.stepSound.playbackRate = 1.0
                    this.stepSound.play()
                }
                if (this.movingSpeed === 0) {
                    this.zeroSpeedTime += this.time.delta
                    if (this.zeroSpeedTime >= this.startWalkingDelay) {
                        this.movingSpeed = THREE.MathUtils.lerp(this.movingSpeed, this.walkingSpeed, this.time.delta * 0.08)
                        this.stepSound.playbackRate = THREE.MathUtils.lerp(this.stepSound.playbackRate, 1.3, this.time.delta * 0.08)
                    }
                } else {
                    this.movingSpeed = THREE.MathUtils.lerp(this.movingSpeed, this.walkingSpeed, this.time.delta * 0.08)
                    this.stepSound.playbackRate = THREE.MathUtils.lerp(this.stepSound.playbackRate, 1.3, this.time.delta * 0.08)
                }
            } else if (this.isStopping) {
                this.stepSound.playbackRate = THREE.MathUtils.lerp(this.stepSound.playbackRate, 1.0, this.time.delta * 0.08)
                this.movingSpeed = THREE.MathUtils.lerp(this.movingSpeed, 0, this.time.delta * 1)
                if (this.movingSpeed < 0.001) {
                    this.movingSpeed = 0
                    this.isStopping = false
                    this.stepSound.pause()
                }
            }
            const newPosition = this.model.position.clone().add(this.moveDirection.clone().multiplyScalar(this.movingSpeed))

            // Limit the movement range
            const distance = Math.sqrt(newPosition.x * newPosition.x + newPosition.z * newPosition.z)

            if (distance > this.movingRange) {
                const scale = this.movingRange / distance
                newPosition.x *= scale
                newPosition.z *= scale
            }

            this.model.position.copy(newPosition)

            // Update model rotation to face the movement direction
            const targetRotation = Math.atan2(this.moveDirection.x, this.moveDirection.z)

            // Calculate the difference between the current and target rotation
            let rotationDiff = targetRotation - this.model.rotation.y

            // Normalize the rotation difference to ensure it falls between -π and π
            rotationDiff = (rotationDiff + Math.PI) % (2 * Math.PI) - Math.PI

            // Apply linear interpolation (lerp) to smoothly rotate the model, ensuring shortest path
            this.model.rotation.y = THREE.MathUtils.lerp(this.model.rotation.y, this.model.rotation.y + rotationDiff, 0.1)

            this.headBone.getWorldPosition(this.headPosition)

            const tempHeadPosition = this.headPosition.clone()
            tempHeadPosition.y -= 1
            tempHeadPosition.add(this.moveDirection.clone().normalize().multiplyScalar(- 13))

            // Update camera position to follow the head
            this.camera.group.position.copy(tempHeadPosition)

            // Apply camera.group rotation to lookAtDirection
            this.camera.instance.lookAt(this.headPosition)

            // console.log(this.camera.group.rotation.x)
        }
        // Render joystick controls
        if (this.joyStickCanvasCtx) {
            // Update joystick position and size
            this.camera.group.rotation.set(
                this.model.rotation.x,
                this.model.rotation.y + Math.PI,
                this.model.rotation.z
            )

            this.joystickRadius = Math.min(this.sizes.width, this.sizes.height) * 0.175
            this.joystickCenterX = this.sizes.width - this.joystickRadius - 35
            this.joystickCenterY = this.sizes.height - this.joystickRadius - 35

            this.joyStickPositions.fixedX = this.joystickCenterX
            this.joyStickPositions.fixedY = this.joystickCenterY

            // Clear the canvas
            this.joyStickCanvasCtx.clearRect(0, 0, this.joyStickCanvas.width, this.joyStickCanvas.height)

            // Draw the outer circle of the joystick
            this.joyStickCanvasCtx.beginPath()
            this.joyStickCanvasCtx.fillStyle = "#0004"
            this.joyStickCanvasCtx.arc(this.joyStickPositions.fixedX, this.joyStickPositions.fixedY, this.joystickRadius, 0, 2 * Math.PI)
            this.joyStickCanvasCtx.fill()
            this.joyStickCanvasCtx.closePath()

            // Draw the inner circle of the joystick (control knob)
            this.joyStickCanvasCtx.beginPath()
            this.joyStickCanvasCtx.fillStyle = "#0008"
            this.joyStickCanvasCtx.arc(this.joyStickPositions.innerX, this.joyStickPositions.innerY, this.joystickRadius * 0.3, 0, 2 * Math.PI)
            this.joyStickCanvasCtx.fill()
            this.joyStickCanvasCtx.closePath()
        }
        if (this.isPreviewMode && this.composer) {
            this.renderPreview();
        }
    }
}