import Experience from '../Experience.js'
import { isMobileDevice, delay, createTitle, createBody, addToDOM, addPillButton } from '../functions.js'

export default class Introduction {
    constructor() {
        // Optional
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.environment = this.world.environment
        this.sphere = this.world.sphere
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.introContainer = document.createElement('div')
        this.introContainer.classList.add('text-container')
        // this.camera.controls.enabled = true
        // this.camera.controls.enableZoom = true
        createTitle('Virtual Echoes', this.introContainer, true, false, '#eac6e6')
        createBody( `
        Welcome to <span class="highlight">Virtual Echoes</span>, a virtual quest 
        through the evolution of VR where the past and future converge. Awaken and embark on an 
        epic journey through worlds unknown. Don’t forget to <span class="highlight">snap a 
        picture</span> at the end —— it’s yours to keep.
    `, this.introContainer )
        this.button =  addPillButton( 'Click To Explore', this.introContainer, true )
        addToDOM( this.introContainer )
        this.introContainer.classList.add('fade-in')
        const timeoutId = setTimeout(() => {
            this.introContainer.classList.remove('fade-in')
            clearTimeout(timeoutId)
        }, 2000)
        this.button.addEventListener('click', async () => {
            this.destroy()

            await delay(this.fadeOutDuration)

            this.toLevel1 = true

        }, { once: true })
    }

    async destroy() {
        this.introContainer.classList.add('fade-out')
        this.fadeOutDuration = window.getComputedStyle(this.introContainer).animationDuration.replace('s', '') * 1000
        await delay (this.fadeOutDuration)
        this.introContainer.remove()
    }
}