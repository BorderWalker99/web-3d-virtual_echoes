import { isPhoneDevice, isMobileDevice, delay, apply3DEffect, waitForVariableToBeDefined } from '../functions.js'
import Experience from '../Experience.js'

export default class Level2 {
    constructor() {
        this.experience = new Experience()
        this.world = this.experience.world
        this.environment = this.world.environment
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.sphere = this.world.sphere
        this.neverEnteredLevel3 = true

        this.initialize()
    }

    async initialize() {
        // this.setSphereColor()
        this.setCards()
    }

    async setSphereColor() {
        this.sphere.material.uniforms.uTargetColorA.value.set('#376177')
        this.sphere.material.uniforms.uTargetColorB.value.set('#406e87')
        this.sphere.material.uniforms.uTrigger.value = 1
        window.setTimeout(() => {
            this.sphere.material.uniforms.uTrigger.value = 0
        }, 3000)
        this.sphereColorChanged = true
    }

    async setCards(apply3D = true) {
        this.selectionContainer = document.querySelector('.world-selection-container')
        this.selectionContainer.classList.remove('hidden')
        this.selectionContainer.classList.add('fade-in')

        this.cardContainer = document.querySelector('.card-container')
        await delay(1000)
        this.cardContainer.classList.add('three-d')
        this.selectionContainer.classList.remove('fade-in')
        this.selectionContainer.classList.add('floating-text')

        this.card1 = this.cardContainer.querySelector('.card-1')
        this.card2 = this.cardContainer.querySelector('.card-2')
        this.card3 = this.cardContainer.querySelector('.card-3')


        if (apply3D) {
            apply3DEffect(this.card1)
            apply3DEffect(this.card2)
            apply3DEffect(this.card3)
        }

        this.card1ClickListener = () => {
            this.destroyContainer(this.selectionContainer)
            this.toWorld = 1
        }
        this.card2ClickListener = () => {
            this.destroyContainer(this.selectionContainer)
            this.toWorld = 2
        }
        this.card3ClickListener = () => {
            this.destroyContainer(this.selectionContainer)
            this.toWorld = 3
        }

        this.card1.addEventListener('click', this.card1ClickListener, { once: true })
        this.card2.addEventListener('click', this.card2ClickListener, { once: true })
        this.card3.addEventListener('click', this.card3ClickListener, { once: true })
    }

    async destroyContainer(container) {
        container.classList.remove('fade-in', 'floating-text')
        container.classList.add('fade-out')
        const fadeOutDuration = parseFloat(window.getComputedStyle(container).animationDuration) * 1000
        await delay(fadeOutDuration)
        container.classList.add('hidden')
        container.classList.remove('fade-out')

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
}