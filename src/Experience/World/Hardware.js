import * as THREE from 'three'
import gsap from 'gsap'
import Experience from "../Experience.js"
import Hotspot from './Hotspot.js'
import { isMobileDevice, disposeModel, fadeMesh, createTitle, createBody, addPillButton, addScrollIndicator, addToDOM, delay } from '../functions.js'

export default class Hardware {
    constructor(needBoundingBoxModel, boundingBoxModel, model, modelName, initialPosition, initialRotation, targetPosition, targetRotation, scale, isFirst, isLast, fadeOutDuration, titleText, bodyText, pointsCount, positionsArray, hotSpotTitleList, hotSpotBodyList) {
        this.modelName = modelName
        this.pointsCount = pointsCount
        this.positionsArray = positionsArray
        this.isLast = isLast
        this.initialPosition = initialPosition || { x: 0, y: 0, z: 0 }
        this.initialRotation = initialRotation || { x: 0, y: 0, z: 0 }
        this.targetPosition = targetPosition || { x: 0, y: 0, z: 0 }
        this.targetRotation = targetRotation || { x: 0, y: 0, z: 0 }
        this.scale = scale
        this.titleText = titleText
        this.bodyText = bodyText
        this.hotSpotBodyList = hotSpotBodyList
        this.hotSpotTitleList = hotSpotTitleList

        // Optional
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        this.sphere = this.experience.sphere

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('hardware')
        }

        // Setup
        this.resource = model
        this.model = model.scene
        this.needBoundingBoxModel = needBoundingBoxModel
        if (this.needBoundingBoxModel)
            this.boundingBoxModel = boundingBoxModel.scene
        this.fadeOutDuration = fadeOutDuration


        this.setCamera()
        this.setModel()
        this.modelIn()
        this.setTextHotspot()
    }

    setCamera() {
        this.camera.controls.enabled = true
        this.camera.controls.enablePan = false
        this.camera.controls.enableZoom = false
    }

    setModel() {
        this.camera.startMove(1, 0.75)
        if (this.needBoundingBoxModel) {
            this.boundingBoxModel.position.set(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z)
            this.boundingBoxModel.rotation.set(this.targetRotation.x, this.targetRotation.y, this.targetRotation.z)
            this.boundingBoxModel.scale.set(this.scale, this.scale, this.scale)
            this.boundingBoxModel.visible = false
            this.scene.add(this.boundingBoxModel)
        }
        this.model.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)
        this.model.rotation.set(this.initialRotation.x, this.initialRotation.y, this.initialRotation.z)
        this.model.scale.set(this.scale, this.scale, this.scale)
        this.scene.add(this.model)

        // Debug
        if (this.debug.active) {
            if (this.needBoundingBoxModel) {
                this.debugFolder.add(this.model.position, 'x').min(-10).max(10).step(0.0001).name('positionX').onChange((value) => {
                    this.boundingBoxModel.position.x = value
                })
                this.debugFolder.add(this.model.position, 'y').min(-10).max(10).step(0.0001).name('positionY').onChange((value) => {
                    this.boundingBoxModel.position.y = value
                })
                this.debugFolder.add(this.model.position, 'z').min(-10).max(10).step(0.0001).name('positionZ').onChange((value) => {
                    this.boundingBoxModel.position.z = value
                })
                this.debugFolder.add(this.model.rotation, 'x').min(-10).max(10).step(0.0001).name('rotationX').onChange((value) => {
                    this.boundingBoxModel.rotation.x = value
                })
                this.debugFolder.add(this.model.rotation, 'y').min(-10).max(10).step(0.0001).name('rotationY').onChange((value) => {
                    this.boundingBoxModel.rotation.y = value
                })
                this.debugFolder.add(this.model.rotation, 'z').min(-10).max(10).step(0.0001).name('rotationZ').onChange((value) => {
                    this.boundingBoxModel.rotation.z = value
                })
                this.debugFolder.add({ scale: this.model.scale.x }, 'scale').min(0).max(10).step(0.0001).name('scale').onChange((value) => {
                    this.model.scale.set(value, value, value)
                    this.boundingBoxModel.scale.set(value, value, value)
                })
            }
            else {
                this.debugFolder.add(this.model.position, 'x').min(-10).max(10).step(0.0001).name('positionX')
                this.debugFolder.add(this.model.position, 'y').min(-10).max(10).step(0.0001).name('positionY')
                this.debugFolder.add(this.model.position, 'z').min(-10).max(10).step(0.0001).name('positionZ')
                this.debugFolder.add(this.model.rotation, 'x').min(-10).max(10).step(0.0001).name('rotationX')
                this.debugFolder.add(this.model.rotation, 'y').min(-10).max(10).step(0.0001).name('rotationY')
                this.debugFolder.add(this.model.rotation, 'z').min(-10).max(10).step(0.0001).name('rotationZ')
                this.debugFolder.add({ scale: this.model.scale.x }, 'scale').min(0).max(10).step(0.0001).name('scale').onChange((value) => {
                    this.model.scale.set(value, value, value)
                })
            }
        }

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // if (child.name.includes('Translucent')){
                //     child.material = child.material.clone()
                //     child.material.transparent = true
                //     child.material.opacity = 0.5
                //     child.material.needsUpdate = true
                // }
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    modelIn() {
        fadeMesh(this.model, 2,
            true,
            this.targetPosition.x, this.targetPosition.y, this.targetPosition.z,
            true,
            this.targetRotation.x, this.targetRotation.y, this.targetRotation.z,
            1)
    }

    async setTextHotspot() {
        await delay(2000)
        this.createText(this.titleText, this.bodyText)
        this.setHotSpots(this.needBoundingBoxModel, this.boundingBoxModel, this.model, this.modelName, this.pointsCount, this.positionsArray, this.hotSpotTitleList, this.hotSpotBodyList)
    }
    async modelOut(isLast = false) {
        fadeMesh(this.camera.instance, 1,
            true,
            0, 0, 6,
            true,
            0, 0, 0,
            1)
        await delay(1000)
        if (isLast == true) {
            fadeMesh(this.model, 2,
                false,
                0, 0, 0,
                true,
                this.initialRotation.x, - this.targetRotation.y, this.initialRotation.z,
                1) // Rotate 180 degree is y axis
            this.model.children.forEach(child => {
                if (child.name == 'Strap') {
                    child.children.forEach(grandChild => {
                        grandChild.material.transparent = true
                        grandChild.material.needsUpdate = true
                        gsap.to(grandChild.material, {
                            opacity: 0,
                            duration: 1,
                            ease: 'power1.out'
                        })
                    })
                }
            })
            await delay(2000)
            console.log(this.model.children)
            this.model.traverse(child => {
                if (child.name == 'Glass01' && child.material) {
                    child.material.transparent = true
                    child.material.needsUpdate = true
                    gsap.to(child.material, {
                        opacity: 0.6,
                        duration: 1,
                        ease: 'power1.out',
                        onComplete: () => {
                            // Step 2: After a 0.8 second delay, animate opacity to 0 in 0.2 seconds
                            gsap.to(child.material, {
                                opacity: 0,
                                duration: 0.2,
                                ease: 'power1.out',
                                delay: 0.8 // Delay before second animation
                            })
                        }
                    })
                }
                else if (child.name == 'Foil' && child.material) {
                    child.material.transparent = true
                    child.material.needsUpdate = true
                    gsap.to(child.material, {
                        opacity: 0.1,
                        duration: 1,
                        ease: 'power1.out',
                        onComplete: () => {
                            // Step 2: After a 0.8 second delay, animate opacity to 0 in 0.2 seconds
                            gsap.to(child.material, {
                                opacity: 0,
                                duration: 0.2,
                                ease: 'power1.out',
                                delay: 0.8 // Delay before second animation
                            })
                        }
                    })
                }
                else if (typeof child.name === 'string' && child.name.includes('Lens') && child.material) {
                    child.material.transparent = true
                    child.material.needsUpdate = true
                    // Step 1: Animate opacity to 0.3 over 1 second
                    gsap.to(child.material, {
                        opacity: 0.5,
                        duration: 1,
                        ease: 'power1.out',
                        onComplete: () => {
                            // Step 2: After a 0.8 second delay, animate opacity to 0 in 0.2 seconds
                            gsap.to(child.material, {
                                opacity: 0,
                                duration: 0.2,
                                ease: 'power1.out',
                                delay: 0.8 // Delay before second animation
                            })
                        }
                    })
                }
                else if (child instanceof THREE.Mesh && child.material) {
                    this.lastMeshBodyTimeout = window.setTimeout(() => {
                        child.material.transparent = true
                        child.material.needsUpdate = true
                        gsap.to(child.material, {
                            opacity: 0,
                            duration: 0.2,
                            ease: 'power1.out',
                        })
                    }, 1800)
                }
            })
            fadeMesh(this.model, 2,
                true,
                this.targetPosition.x + 0.55, this.targetPosition.y - 0.75, (Math.max(1, (650 / this.sizes.width)) >= 1 ? Math.max(1, (650 / this.sizes.width)) * 0.75 : Math.max(1, (650 / this.sizes.width))),
                // this.targetPosition.x + 0.55, this.targetPosition.y - 0.75, this.targetPosition.z + 5,
                false,
                0, 0, 0,
                1)
            gsap.to(this.camera.group.position, {
                duration: 2,
                ease: "power1.inOut",
                x: 0.29,
                y: 0.01,
                z: -5.87
            })

            gsap.to(this.camera.group.rotation, {
                duration: 2,
                ease: "power1.inOut",
                x: 0,
                y: -0.045,
                z: 0.01
            });
            await delay(2000)
        }
        else {
            fadeMesh(this.model, 2,
                true,
                - this.initialPosition.x, this.initialPosition.y, this.initialPosition.z,
                true,
                this.initialRotation.x, - this.initialRotation.y, this.initialRotation.z,
                0)
        }
    }

    async createText(titleText, bodyText) {
        await delay(this.fadeOutDuration)

        const fragment = document.createDocumentFragment()

        this.container = document.createElement('div')
        this.container.classList.add('model-text-container')

        createTitle(titleText, this.container, true, true, false, '#eac6e6')
        createBody(bodyText, this.container)
        if (this.isLast) {
            this.buttonContainer = document.createElement('div')
            this.buttonContainer.classList.add('button-container', 'flex-column')
            if (isMobileDevice())
                this.button = addPillButton('Click to The Previous', this.buttonContainer, true)
            else
                this.indicator = addScrollIndicator(['Scroll Up To The Previous'], this.buttonContainer, true)
            this.button = addPillButton('Click to Explore Realm', this.buttonContainer, true)
        } else {
            if (isMobileDevice()) {
                this.buttonContainer = document.createElement('div')
                this.buttonContainer.classList.add('button-container', 'flex-column')
                this.button = addPillButton('Click To The Previous', this.buttonContainer, true)
                this.button = addPillButton('Click To The Next', this.buttonContainer, true)
            } else {
                this.indicator = addScrollIndicator(['Scroll Up To The Previous', 'Down To The Next'], this.container, true)
            }
        }

        if (this.buttonContainer)
            this.container.appendChild(this.buttonContainer)
        fragment.appendChild(this.container)
        addToDOM(fragment)

        this.container.classList.add('fade-in')
        const timeoutId = setTimeout(() => {
            this.container.classList.remove('fade-in')
            clearTimeout(timeoutId)
        }, 2000)

        if (this.button) {
            this.buttonClickListener = async () => {
                this.destroy()
            }
            this.button.addEventListener('click', this.buttonClickListener, { once: true })
        }
        if (this.indicator) {
            this.scrollListener = async () => {
                this.destroy()
            }
            window.addEventListener('scroll', this.scrollListener, { once: true })
        }
    }

    setHotSpots(needBoundingBoxModel, boundingBoxModel, model, modelName, pointsCount, positionsArray, titleList, bodyList) {
        this.hotspot = new Hotspot(needBoundingBoxModel, boundingBoxModel, model, modelName, pointsCount, positionsArray, titleList, bodyList)
    }

    hotSpotOut() {
        if (this.hotspot) {
            this.hotspot.destroy()
        }
    }

    update() {
        if (this.hotspot) {
            this.hotspot.update()
        }
    }

    async destroy() {
        this.camera.controls.enabled = false
        this.hotSpotOut()
        this.camera.pauseMove()
        this.modelOut(this.isLast)
        await delay(1000)
        this.container.classList.add('fade-out')
        this.fadeOutDuration = window.getComputedStyle(this.container).animationDuration.replace('s', '') * 1000
        await delay(this.fadeOutDuration)
        this.container.remove()
        if (this.isLast) {
            await delay(3000)
            this.hardwareOut = true
        }
        await delay(1000)
        disposeModel(this.scene, this.model)
        if (this.needBoundingBoxModel) {
            disposeModel(this.scene, this.boundingBoxModel)
        }
        if (this.isLast) {
            this.camera.startMove(1, 0.75)
            clearTimeout(this.lastMeshBodyTimeout)
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }
        if (this.button && this.buttonClickListener) {
            this.button.removeEventListener('click', this.buttonClickListener)
        }
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener)
        }
    }
}