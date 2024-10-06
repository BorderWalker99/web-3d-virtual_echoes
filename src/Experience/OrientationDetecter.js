import Experience from './Experience.js'
import { delay } from './functions.js'
import { isMobileDevice } from './functions.js'

export default class OrientationDetecter {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.camera = this.experience.camera

        this.resources.on('ready', async () =>
        {
            this.setOrientationDetecter()
        })
    }

    async setOrientationDetecter() {
        await delay(1000)
        this.scaleOrientationDetecter()
        window.addEventListener('resize', this.scaleOrientationDetecter.bind(this))

        this.orientationCheckbox = document.getElementById('orientationCheckboxInput')
        this.orientationCheckbox.addEventListener('change', () => {
            if (this.orientationCheckbox.checked) {
                this.camera.orientationPermissionGranted = true
                this.camera.checkDeviceOrientationPermission()
            } else {
                this.camera.orientationPermissionGranted = true
                this.camera.checkDeviceOrientationPermission()
            }
        })

        // Set initial scale after a timeout
        window.setTimeout(() => {
            this.setInitialScale()
        }, 2500)
    }
    
    scaleOrientationDetecter() {
        const orientationCheckbox = document.getElementById('orientationCheckboxInput')
        const toggleSwitch = document.querySelector('.toggleSwitch')
        
        if (orientationCheckbox && toggleSwitch) {
            const minScaleValue = 0.75 // Set the minimum scale value
            const scaleValue = Math.max(Math.min(window.innerWidth, window.innerHeight) / 750, minScaleValue) // Adjust this denominator to control scale sensitivity
            orientationCheckbox.style.transform = `scale(${scaleValue})`
            toggleSwitch.style.transform = `scale(${scaleValue})`
            orientationCheckbox.style.setProperty('--initial-scale', scaleValue * 0.8)
            toggleSwitch.style.setProperty('--initial-scale', scaleValue * 0.8)
            orientationCheckbox.style.setProperty('--final-scale', scaleValue)
            toggleSwitch.style.setProperty('--final-scale', scaleValue)

            // Store the scale value for later use
            this.scaleValue = scaleValue
        }
    }

    setInitialScale() {
        const toggleSwitch = document.querySelector('.toggleSwitch')
        if (toggleSwitch && this.scaleValue) {
            toggleSwitch.style.transform = `scale(${this.scaleValue})`
        }
    }
}