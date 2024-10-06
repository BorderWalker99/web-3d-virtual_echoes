import { isPhoneDevice, isMobileDevice, delay, createTitle, createBody, addToDOM, addCircularButton, addPillButton, createCloseButton, createTooltips } from '../functions.js'
import Experience from '../Experience.js'
import gsap from 'gsap'
import { apply3DEffect } from '../functions.js'
import Level4 from './Level4.js'
import * as THREE from 'three'

export default class Level3 {
    constructor() {
        // Optional
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.environment = this.world.environment
        this.sphere = this.world.sphere
        this.neverEnteredLevel4 = true
        this.level2 = this.world.level2
        this.music = this.experience.music

        this.setWorld()
    }

    async setWorld() {
        this.turnOffLights()
        this.enterWorld(this.level2.toWorld)
        this.toWorld = this.level2.toWorld
        // this.enterWorld(1)
        // this.toWorld = 1
    }

    turnOffLights() {
        this.environment.destroy('all')
    }

    setWorldIntro(worldName) {
        this.worldName = worldName
        this.worldIntroContainer = document.createElement('div')
        this.worldIntroContainer.classList.add('text-container')
        this.selectionLabel = document.querySelector('.world-selection-container p')
        // this.fadeOutDuration = window.getComputedStyle(this.worldIntroContainer).animationDuration.replace('s', '') * 1000
        this.fadeOutDuration = 1000
        if (worldName === 'moon') {
            createTitle('Moon', this.worldIntroContainer, true, false, true, '#c1d4de')
            createBody(`
            Welcome to the Moon, a silent, alien landscape of silver 
            plains and towering craters. Start your exploration beneath 
            an infinite starry sky, where the echoes of forgotten astronauts 
            and the mysteries of the cosmos are waiting to be uncovered.
        `, this.worldIntroContainer)
            this.selectionLabel.style.color = '#c1d4de'
        }
        else if (worldName === 'mars') {
            createTitle('Mars', this.worldIntroContainer, true, false, true, '#e8c4b0')
            createBody(`
            Welcome to Mars, the crimson planet shaped by swirling dust storms 
            and rugged mountains. Begin your journey across this ancient, desolate 
            world, where every crater and canyon hides secrets of a lost 
            civilization, waiting to be rediscovered by explorers like you.
        `, this.worldIntroContainer)
            this.selectionLabel.style.color = '#e8c4b0'
        }
        else if (worldName === 'forest') {
            createTitle('Forest', this.worldIntroContainer, true, false, true, '#f6f4d2')
            createBody(`
            Welcome to the Forest, a lush, untamed wilderness bursting with life. 
            Embark on a mystical journey through towering trees and shimmering rivers, 
            where hidden creatures and ancient magic lurk in every shadow, inviting 
            you to uncover their timeless wonders.
        `, this.worldIntroContainer)
            this.selectionLabel.style.color = '#f6f4d2'
        }
        this.buttonContainer = document.createElement('div')
        this.buttonContainer.classList.add('button-container')

        this.buttonCircular = addCircularButton('Switch Realm', this.buttonContainer, true, 'fade-in')

        // const buttonTextElements = this.buttonCircular.querySelectorAll('.button__text > span')
        // window.addEventListener('resize', () => {
        //     buttonTextElements.forEach(buttonText => {
        //         buttonText.style.setProperty('--rotation-angle', `${this.buttonCircular.offsetWidth / 50 * 27}deg `)
        //         console.log(buttonText.style.getPropertyValue('--rotation-angle'))
        //     })
        // })

        this.buttonPill = addPillButton('Awaken', this.buttonContainer, true)
        this.worldIntroContainer.appendChild(this.buttonContainer)
        addToDOM(this.worldIntroContainer)
        this.worldIntroContainer.classList.add('fade-in')
        const timeoutId = setTimeout(() => {
            this.worldIntroContainer.classList.remove('fade-in')
            clearTimeout(timeoutId)
        }, 2000)


        this.buttonCircular.addEventListener('click', async () => {
            this.destroyContainer(this.worldIntroContainer)
            await delay(this.fadeOutDuration)
            this.setCards(true, true)
        }, { once: true })
        this.buttonPill.addEventListener('click', async () => {
            this.destroyContainer(this.worldIntroContainer)
            // console.log(this.fadeOutDuration)
            await delay(this.fadeOutDuration)
            this.camera.controls.enabled = false
            this.camera.group.position.set(0, 0, 0)
            this.camera.instance.lookAt(0, 0, 0)
            // this.setCharacter = true
            await delay(1000)
            this.world.level4 = new Level4()
        }, { once: true })
    }

    async enterWorld(toWorld) {
        this.destroyWorld()
        if (toWorld === 1) {
            this.music.switchMusic('moon')
        }
        else if (toWorld === 2) {
            this.music.switchMusic('mars')
        }
        else if (toWorld === 3) {
            this.music.switchMusic('forest')
        }
        this.toWorld = toWorld
        this.camera.startMove(1, 0.75)
        this.environment.destroy('all')
        switch (toWorld) {
            case 1:
                console.log('To Luna: fly you to the moon!')
                this.camera.instance.position.set(0, 0, 5)
                if (isPhoneDevice())
                    this.environment.setSkybox('moonLargeEnvMapTexture', 'moonTinyEnvMapTexture', 1)
                else {
                    this.environment.setSkybox('moonLargeEnvMapTexture', 'moonSmallEnvMapTexture', 1)
                    console.log('no mobile!')
                }
                gsap.to(this.environment.skybox.position, { x: this.environment.skybox.position.x, y: this.environment.skybox.position.y + 25, z: this.environment.skybox.position.z, duration: 1.5, ease: 'bounce.out' })
                this.camera.controls.enabled = true
                this.camera.controls.enableDamping = true
                this.camera.controls.enablePan = false
                this.camera.controls.enableZoom = false
                this.sphere.material.transparent = true
                this.sphere.material.uniforms.uTrigger.value = true
                this.sphere.startRotate = false
                await delay(2500)
                if(this.level2.neverEnteredLevel3)
                {
                    // Add preview tooltips
                    const previewKeyboardTooltips = createTooltips(['drag-turn-360'], true)
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
                this.level2.neverEnteredLevel3 = false
                this.setWorldIntro('moon')
                break
            case 2:
                console.log('fly to the mars')
                this.camera.instance.position.set(0, 0, 5)
                if (isPhoneDevice()) {
                    this.environment.setSkybox('marsLargeEnvMapTexture', 'marsTinyEnvMapTexture', 1)
                    console.log('mobile!')
                }
                else
                    this.environment.setSkybox('marsLargeEnvMapTexture', 'marsSmallEnvMapTexture', 1)
                gsap.to(this.environment.skybox.position, { x: this.environment.skybox.position.x, y: this.environment.skybox.position.y + 10, z: this.environment.skybox.position.z, duration: 1.5, ease: 'bounce.out' })
                this.camera.controls.enabled = true
                this.camera.controls.enableDamping = true
                this.camera.controls.enablePan = false
                this.camera.controls.enableZoom = false
                this.sphere.material.transparent = true
                this.sphere.material.uniforms.uTrigger.value = true
                this.sphere.startRotate = false
                await delay(2500)
                if(this.level2.neverEnteredLevel3)
                    {
                        // Add preview tooltips
                        const previewKeyboardTooltips = createTooltips(['drag-turn-360'], true)
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
                    this.level2.neverEnteredLevel3 = false
                this.setWorldIntro('mars')
                break
            case 3:
                console.log('fly to the forest')
                this.camera.instance.position.set(0, 0, 5)
                if (isPhoneDevice())
                    this.environment.setSkybox('forestLargeEnvMapTexture', 'forestTinyEnvMapTexture', 1)
                else
                    this.environment.setSkybox('forestLargeEnvMapTexture', 'forestSmallEnvMapTexture', 1)
                gsap.to(this.environment.skybox.position, { x: this.environment.skybox.position.x, y: this.environment.skybox.position.y + 25, z: this.environment.skybox.position.z, duration: 1.5, ease: 'bounce.out' })
                this.camera.controls.enabled = true
                this.camera.controls.enableDamping = true
                this.camera.controls.enablePan = false
                this.camera.controls.enableZoom = false
                this.sphere.material.transparent = true
                this.sphere.material.uniforms.uTrigger.value = true
                this.sphere.startRotate = false
                await delay(2500)
                if(this.level2.neverEnteredLevel3)
                    {
                        // Add preview tooltips
                        const previewKeyboardTooltips = createTooltips(['drag-turn-360'], true)
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
                    this.level2.neverEnteredLevel3 = false
                this.setWorldIntro('forest')
                break
        }
    }

    async setCards(apply3D) {
        this.camera.controls.enabled = false

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
            this.hideContainer(this.selectionContainer)

            await delay(1000)
            this.camera.controls.enabled = true
            this.setWorldIntro(this.worldName)
            this.removeOtherListeners()
        }
        this.card1ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.toWorld = 1
            this.enterWorld(this.toWorld)
            this.removeOtherListeners()
        }
        this.card2ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.toWorld = 2
            this.enterWorld(this.toWorld)
            this.removeOtherListeners()
        }
        this.card3ClickListener = () => {
            this.cardCloseButton.style.transform = 'scale(0.0)'
            this.hideContainer(this.selectionContainer)
            this.toWorld = 3
            this.enterWorld(this.toWorld)
            this.removeOtherListeners()
        }

        this.removeOtherListeners = () => {
            this.cardCloseButton.removeEventListener('click', this.cardCloseButtonListener);
            this.card1.removeEventListener('click', this.card1ClickListener);
            this.card2.removeEventListener('click', this.card2ClickListener);
            this.card3.removeEventListener('click', this.card3ClickListener);
        }

        this.cardCloseButton.addEventListener('click', this.cardCloseButtonListener, { once: true })
        this.card1.addEventListener('click', this.card1ClickListener, { once: true })
        this.card2.addEventListener('click', this.card2ClickListener, { once: true })
        this.card3.addEventListener('click', this.card3ClickListener, { once: true })
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

    async destroyContainer(container) {
        container.classList.remove('fade-in', 'floating-text')
        container.classList.add('fade-out')
        const fadeOutDuration = parseFloat(window.getComputedStyle(container).animationDuration) * 1000
        await delay(fadeOutDuration)
        container.remove()
    }

    destroyWorld() {
        // Remove and dispose of the skybox
        if (this.environment && this.environment.skybox) {
            this.scene.remove(this.environment.skybox)
            if (this.environment.skybox.geometry) {
                this.environment.skybox.geometry.dispose()
            }
            if (this.environment.skybox.material) {
                this.environment.skybox.material.dispose()
            }
        }
    
        // Dispose of environment maps
        if (this.environment && this.environment.environmentMap) {
            if (this.environment.environmentMap.worldTexture) {
                this.environment.environmentMap.worldTexture.dispose()
            }
            if (this.environment.environmentMap.bgTexture) {
                this.environment.environmentMap.bgTexture.dispose()
            }
        }
    
        // Remove lights
        this.environment.destroy('all')
    
        // Remove Level4 model if it exists
        if (this.world.level4) {
            if (this.world.level4.model) {
                this.scene.remove(this.world.level4.model)
            }
            if (this.world.level4.shadowPlane) {
                this.scene.remove(this.world.level4.shadowPlane)
            }
            if (this.world.level4.mixer) {
                this.world.level4.mixer.stopAllAction()
            }
            this.world.level4.removeControls()
            if (this.world.level4.buttonCircular) {
                this.world.level4.destroyButton(this.world.level4.buttonCircular)
            }
            if (this.world.level4.previewContainer) {
                this.world.level4.previewContainer.remove()
            }
            if (this.world.level4.cameraButton) {
                this.world.level4.cameraButton.remove()
            }
            if (this.world.level4.previewCloseButton) {
                this.world.level4.previewCloseButton.remove()
            }
            if (this.world.level4.previewTooltipsContainer) {
                this.world.level4.previewTooltipsContainer.remove()
            }
            if (this.world.level4.joyStickCanvas) {
                this.world.level4.joyStickCanvas.remove()
            }
            this.world.level4 = null
        }
    
        // Remove DOM elements
        if (this.worldIntroContainer) {
            this.destroyContainer(this.worldIntroContainer)
        }
    
        // Remove event listeners
        if (this.buttonCircular) {
            this.buttonCircular.removeEventListener('click', this.card1ClickListener)
        }
        if (this.buttonPill) {
            this.buttonPill.removeEventListener('click', this.card2ClickListener)
        }
        if (this.card1) {
            this.card1.removeEventListener('click', this.card1ClickListener)
        }
        if (this.card2) {
            this.card2.removeEventListener('click', this.card2ClickListener)
        }
        if (this.card3) {
            this.card3.removeEventListener('click', this.card3ClickListener)
        }
    
        // Reset camera
        this.camera.controls.enabled = false
        this.camera.instance.position.set(0, 0, 5)
        this.camera.instance.lookAt(0, 0, 0)
    
        // Reset properties
        this.toWorld = null
    }
}