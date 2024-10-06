import * as THREE from 'three'
import Experience from "../Experience.js"
import Environment from './Environment.js'
import Sphere from './Sphere.js'
import Music from '../Music.js'
import Introduction from './Introduction.js'
import Level1 from './Level1.js'
import Level2 from './Level2.js'
import Level3 from './Level3.js'
import Level4 from './Level4.js'
import { isMobileDevice, waitForClickOnce, delay, addPillButton, addToDOM, waitForVariableToBeDefined } from '../functions.js'

export default class World{
    constructor() {
        // Optional
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.resources = this.experience.resources

        this.resources.on('ready', async () => {
            this.setupWorld()
        })
    }
    setupWorld() {
        // Setup
        this.sphere = new Sphere('#4e3380', '#37245b', '#8c6dc5')
        this.environment = new Environment()

        this.setIntroduction()

        this.setLevel1()

        this.setLevel2()

        this.setLevel3()
    }
    async setIntroduction() {
        // await delay(1000)
        await delay(3000)
        this.introduction = new Introduction()
    }
    async setLevel1() {
        await waitForVariableToBeDefined(() => this.introduction)
        await waitForVariableToBeDefined(() => this.introduction.toLevel1)
        this.level1 = new Level1()
    }
    async setLevel2() {
        await waitForVariableToBeDefined(() => this.level1)
        await waitForVariableToBeDefined(() => this.level1.hardwareOut)
        this.level2 = new Level2()
    }
    async setLevel3() {
        await waitForVariableToBeDefined(() => this.level2)
        await waitForVariableToBeDefined(() => this.level2.toWorld)
        this.level3 = new Level3()
    }

    async setLevel4() {
        await waitForVariableToBeDefined(() => this.level3)
        await waitForVariableToBeDefined(() => this.level3.setCharacter)
        this.level4 = new Level4()
    }
    
    async destroyContainer(container) {
        container.classList.add('fade-out')
        const fadeOutDuration = parseFloat(window.getComputedStyle(container).animationDuration) * 1000
        await delay(fadeOutDuration * 2)
        container.style.display = 'none'
    }
    update() {
        if (this.sphere) {
            this.sphere.update()
        }
        if (this.environment) {
            this.environment.update()
        }
        if (this.level1) {
            this.level1.update()
        }
        if (this.level4) {
            this.level4.update()
        }
    }
}