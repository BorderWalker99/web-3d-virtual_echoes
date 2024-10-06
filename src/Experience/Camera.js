import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import Experience from "./Experience.js"
import { isLandscape, isMobileDevice, delay } from './functions.js'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.world = this.experience.world
        this.vminThreshold = 900
        this.debug = this.experience.debug

        this.cursor = {
            x: 0,
            y: 0
        }

        this.orientation = {
            beta: 0,
            gamma: 0
        }

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('camera')
        }

        this.setInstance('orbit')
        this.setGroup()
        if (isMobileDevice()) {
            this.setOrientationActivateOnClick()
            // this.setOrientationActivateButton()
        }
        this.startMove(1, 0.75)
    }

    setOrientationActivateOnClick() {
        this.orientationPermissionGranted = false
    
        const handleClick = async () => {
            await this.checkDeviceOrientationPermission()
            if (!this.orientationPermissionGranted) {
                console.log('Device orientation permission denied.')
            }
            // Remove the event listener after the first click
            window.removeEventListener('click', handleClick)
        }
    
        // Add the event listener for click events
        window.addEventListener('click', handleClick)
    }

    async setOrientationActivateButton() {
        this.orientationPermissionGranted = false
        this.orientationCheckbox = document.getElementById('orientationCheckboxInput')
        this.orientationToggleSwitch = document.querySelector('#orientationCheckboxInput+.toggleSwitch')
    
        console.log(this.orientationToggleSwitch)
        
        // Button visible
        this.orientationToggleSwitch.style.display = 'flex'
        await delay(2500)
        this.orientationToggleSwitch.style.transform = 'scale(1)'
    
        this.orientationCheckbox.addEventListener('change', async () => {
            if (this.orientationCheckbox.checked) {
                await this.checkDeviceOrientationPermission()
                if (!this.orientationPermissionGranted) {
                    this.orientationCheckbox.checked = false
                    alert('Device orientation permission denied.')
                }
            } else {
                this.orientationPermissionGranted = false
            }
        })
    }
    
    async checkDeviceOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceOrientationEvent.requestPermission()
                if (permissionState === 'granted') {
                    this.orientationPermissionGranted = true
                    this.startDeviceOrientationMove(1, 0.75)
                } else {
                    this.orientationPermissionGranted = false
                }
            } catch (error) {
                this.orientationPermissionGranted = false
            }
        } else {
            // Handle non-iOS 13+ devices
            this.startDeviceOrientationMove(1, 0.75)
            this.orientationPermissionGranted = true
        }
    }

    async setInstance(type = 'orbit') {
        this.instance = new THREE.PerspectiveCamera(
            Math.max(33 * this.vminThreshold / this.sizes.width, 33),
            this.sizes.width / this.sizes.height,
            0.1,
            1000
        )
        this.instance.position.set(0, 0, 5)
        if (this.debug.active) {
            // this.debugFolder.add(this.instance.position, 'x').min(-100).max(100).step(0.01).name('positionX')
            // this.debugFolder.add(this.instance.position, 'y').min(-100).max(100).step(0.01).name('positionY')
            // this.debugFolder.add(this.instance.position, 'z').min(-100).max(100).step(0.01).name('positionZ')
            // this.debugFolder.add(this.instance.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotationX')
            // this.debugFolder.add(this.instance.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotationY')
            // this.debugFolder.add(this.instance.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotationZ')
        }
        this.scene.add(this.instance)

        if (type === 'orbit') {
            this.setOrbitControls()
        } else if (type === 'fps') {
            this.setPointerLockControls()
        }
    }

    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.enabled = false
        this.controlType = 'orbit'
    }

    setPointerLockControls() {
        this.controls = new PointerLockControls(this.instance, this.canvas)
        this.controls.enabled = false
        this.controlType = 'fps'

        this.canvas.addEventListener('click', () => {
            this.controls.lock()
        })

        this.controls.addEventListener('lock', () => {
            console.log('PointerLockControls: locked')
        })

        this.controls.addEventListener('unlock', () => {
            console.log('PointerLockControls: unlocked')
        })
    }

    setGroup() {
        this.group = new THREE.Group()
        this.group.add(this.instance)
        this.scene.add(this.group)

        if (this.debug.active) {
            this.debugFolder.add(this.group.position, 'x').min(-100).max(100).step(0.01).name('positionX')
            this.debugFolder.add(this.group.position, 'y').min(-100).max(100).step(0.01).name('positionY')
            this.debugFolder.add(this.group.position, 'z').min(-100).max(100).step(0.01).name('positionZ')
            this.debugFolder.add(this.group.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotationX')
            this.debugFolder.add(this.group.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotationY')
            this.debugFolder.add(this.group.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotationZ')
        }
    }

    startMove(movingDistance, movingSpeed) {
        if (isMobileDevice()) {
            if (this.orientationPermissionGranted) {
                this.startDeviceOrientationMove(movingDistance, movingSpeed)
            } else {

            }
        } else {
            this.startMouseMove(movingDistance, movingSpeed)
        }
    }
    
    pauseMove() {
        if (isMobileDevice()) {
            if (this.orientationPermissionGranted) {
                this.pauseDeviceOrientationMove()
            } else {

            }
        } else {
            this.pauseMouseMove()
        }
    }

    startMouseMove(movingDistance, movingSpeed) {
        if (this.mouseMovingEvent) {
            window.removeEventListener('mousemove', this.mouseMovingEvent)
            gsap.to(this.group.position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: 'power1.out'
            })
        }

        let parallaxX = 0
        let parallaxY = 0

        this.mouseMovingEvent = (event) => {
            this.cursor.x = event.clientX / this.sizes.width - 0.5
            this.cursor.y = event.clientY / this.sizes.height - 0.5

            parallaxX = - this.cursor.x * movingDistance
            parallaxY = this.cursor.y * movingDistance
            if (this.group) {
                gsap.to(this.group.position, {
                    x: parallaxX,
                    y: parallaxY,
                    duration: movingSpeed,
                    ease: 'power1.out'
                })
            }
        }
        window.addEventListener('mousemove', this.mouseMovingEvent)
    }


    pauseMouseMove() {
        if (this.mouseMovingEvent) {
            window.removeEventListener('mousemove', this.mouseMovingEvent)
            gsap.to(this.group.position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: 'power1.out'
            })
        }
    }

    startDeviceOrientationMove(movingDistance, movingSpeed) {
        if (this.deviceOrientationEvent) {
            window.removeEventListener('deviceorientation', this.deviceOrientationEvent)
            gsap.to(this.group.position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: 'power1.out'
            })
        }

        let parallaxX = 0
        let parallaxY = 0
        const maxRange = movingDistance * 2
        this.deviceOrientationEvent = (event) => {
            if (isLandscape()) {
                [beta, gamma] = [gamma, beta]
            }
            this.orientation.beta = event.beta / 180 // - 180 to 180 degrees
            this.orientation.gamma = event.gamma / 90 // - 90 to 90 degrees

            parallaxX = - this.orientation.gamma * movingDistance * 6
            // parallaxY = this.orientation.beta * movingDistance * 6

            // Limit the range of parallaxX and parallaxY
            parallaxX = Math.max(- maxRange, Math.min(maxRange, parallaxX))
            // parallaxY = Math.max(- maxRange, Math.min(maxRange, parallaxY))

            if (this.group) {
                gsap.to(this.group.position, {
                    x: parallaxX,
                    y: parallaxY,
                    duration: movingSpeed,
                    ease: 'power1.out'
                });
            }
        };

        window.addEventListener('deviceorientation', this.deviceOrientationEvent);
    }

    pauseDeviceOrientationMove() {
        if (this.deviceOrientationEvent) {
            window.removeEventListener('deviceorientation', this.deviceOrientationEvent)
            gsap.to(this.group.position, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1,
                ease: 'power1.out'
            })
        }
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        if (this.controlType === 'orbit') {
            this.controls.update()
        } else if (this.controlType === 'fps') {
            // PointerLockControls does not need to call update
        }
    }
}