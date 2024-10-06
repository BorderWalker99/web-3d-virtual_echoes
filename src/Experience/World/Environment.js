import * as THREE from 'three'
import Experience from "../Experience.js"
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js'
import { isMobileDevice } from '../functions.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.sphere = this.experience.world.sphere

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('light')
        }

        if (isMobileDevice()) {
            this.shadowMapSize = 2048
        }
        else {
            this.shadowMapSize = 4096
        }

        this.setAmbientLight()
        this.setSpotLight(0, 4, 0, 0, 1, 0, 50, 7* Math.PI / 16, 0.25, true, 50, -5 * Math.PI / 8, -3 * Math.PI / 8, 0.003, -1, false, 8)
        this.setSpotLight(0, 4, 0, 0, 1, 0, 50, - 6* Math.PI / 16, 0.25, true, 50, 3 * Math.PI / 8, 5 * Math.PI / 8, 0.003, 1, false, 8)
        this.setEnvironmentMap()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight()
        this.ambientLight.intensity = 0.15
        this.scene.add(this.ambientLight)
    }

    setDirectionalLight(color, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, intensity, shadowRange) {
        if (!this.directionalLights) {
            this.directionalLights = []
            this.directionalLightHelpers = []
        }
        const directionalLight = new THREE.DirectionalLight()
        directionalLight.color.set(color)
        directionalLight.intensity = intensity
        directionalLight.position.set(positionX, positionY, positionZ)
        directionalLight.rotation.set(rotationX, rotationY, rotationZ)

        directionalLight.shadow.camera.left = shadowRange * - 1
        directionalLight.shadow.camera.right = shadowRange
        directionalLight.shadow.camera.top = shadowRange
        directionalLight.shadow.camera.bottom = shadowRange * - 1
        directionalLight.shadow.camera.near = 5
        directionalLight.shadow.camera.far = 100

        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = this.shadowMapSize
        directionalLight.shadow.mapSize.height = this.shadowMapSize
        this.directionalLights.push(directionalLight)
        this.scene.add(directionalLight)

        let debugObject = {}
        debugObject.color = color

        if (this.debug.active) {
            this.debugFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.1).name('directionalLightIntensity')
            this.debugFolder.add(directionalLight.position, 'x').min(-1000).max(1000).step(0.1).name('positionX')
            this.debugFolder.add(directionalLight.position, 'y').min(-1000).max(1000).step(0.1).name('positionY')
            this.debugFolder.add(directionalLight.position, 'z').min(-1000).max(1000).step(0.1).name('positionZ')
            this.debugFolder.add(directionalLight.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotationX')
            this.debugFolder.add(directionalLight.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotationY')
            this.debugFolder.add(directionalLight.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotationZ')
            this.debugFolder.addColor(debugObject, 'color').name('color').onChange(() => {
                directionalLight.color = new THREE.Color(debugObject.color)
            })
        }

        // Add a DirectionalLightHelper
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
        // this.directionalLightHelpers.push(directionalLightHelper)
        // this.scene.add(directionalLightHelper)

        // Add a ShadowHelper
        // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
        // this.scene.add(shadowHelper)
    }

    setSpotLight(x, y, z, targetX, targetY, targetZ, distance, angle, penumbra, isRotate, intensity, minAngle, maxAngle, speed, direction, castShadow, far) {
        this.lightRotate = isRotate
        if (!this.spotLights) {
            this.spotLights = []
            this.spotLightHelpers = []
            this.spotLightRotateAngles = []
            this.spotLightRotateSpeeds = []
            this.spotLightMinAngles = []
            this.spotLightMaxAngles = []
            this.spotLightDirections = []
        }
        // console.log('setSpotLight called with parameters:', { x, y, z, targetX, targetY, targetZ, distance, angle, penumbra, isRotate, intensity, minAngle, maxAngle, speed, direction, castShadow, far })

        const spotLight = new THREE.SpotLight()
        spotLight.color = new THREE.Color(0xffffff)
        spotLight.intensity = intensity
        spotLight.position.set(x, y, z)
        spotLight.target.position.set(targetX, targetY, targetZ)
        spotLight.distance = distance // The range of the spotlight
        spotLight.angle = angle // The cone angle of the spotlight
        spotLight.penumbra = penumbra // Smooth the edge of the spotlight
        spotLight.castShadow = castShadow

        spotLight.shadow.camera.left = -100
        spotLight.shadow.camera.right = 100
        spotLight.shadow.camera.top = 100
        spotLight.shadow.camera.bottom = -100
        spotLight.shadow.camera.near = 0.2
        spotLight.shadow.camera.far = far

        spotLight.shadow.mapSize.width = this.shadowMapSize
        spotLight.shadow.mapSize.height = this.shadowMapSize

        this.spotLights.push(spotLight)
        this.scene.add(spotLight)

        // const helper = new THREE.CameraHelper(spotLight.shadow.camera)
        // this.scene.add(helper)

        // Add a SpotLightHelper
        const spotLightHelper = new THREE.SpotLightHelper(spotLight, 5)
        this.spotLightHelpers.push(spotLightHelper)
        // this.scene.add(spotLightHelper)

        if (this.debug.active) {
            this.debugFolder.add(spotLight, 'distance').min(0).max(1000).step(0.1).name('spotLightDistance').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight, 'angle').min(0).max(Math.PI / 2).step(0.01).name('spotLightAngle').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight, 'penumbra').min(0).max(2).step(0.01).name('spotLightPenumbra').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.position, 'x').min(-100).max(100).step(0.1).name('positionX').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.position, 'y').min(-100).max(100).step(0.1).name('positionY').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.position, 'z').min(-100).max(100).step(0.1).name('positionZ').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.target.position, 'x').min(-10).max(10).step(0.1).name('targetX').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.target.position, 'y').min(-10).max(10).step(0.1).name('targetY').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight.target.position, 'z').min(-10).max(10).step(0.1).name('targetZ').onChange(() => {
                spotLightHelper.update()
            })
            this.debugFolder.add(spotLight, 'intensity').min(0).max(10000).step(0.1).name('spotLightIntensity').onChange(() => {
                spotLightHelper.update()
            })
            // this.debugFolder.add(spotLight.shadow.camera, 'left').min(-20).max(0).step(0.1).name('shadowLeft').onChange(() => {
            //     spotLight.shadow.camera.updateProjectionMatrix();
            // })
            // this.debugFolder.add(spotLight.shadow.camera, 'right').min(0).max(20).step(0.1).name('shadowRight').onChange(() => {
            //     spotLight.shadow.camera.updateProjectionMatrix()
            // })
            // this.debugFolder.add(spotLight.shadow.camera, 'top').min(0).max(20).step(0.1).name('shadowTop').onChange(() => {
            //     spotLight.shadow.camera.updateProjectionMatrix()
            // })
            // this.debugFolder.add(spotLight.shadow.camera, 'bottom').min(-20).max(0).step(0.1).name('shadowBottom').onChange(() => {
            //     spotLight.shadow.camera.updateProjectionMatrix()
            // })
            // this.debugFolder.add(spotLight.shadow.camera, 'near').min(0.1).max(10).step(0.1).name('shadowNear').onChange(() => {
            //     spotLight.shadow.camera.updateProjectionMatrix()
            // })
            this.debugFolder.add(spotLight.shadow.camera, 'far').min(5).max(200).step(0.1).name('shadowFar').onChange(() => {
                spotLight.shadow.camera.updateProjectionMatrix()
            })

        }
        if (isRotate) {
            this.spotLightRotateAngles.push(0)
            this.spotLightRotateSpeeds.push(speed)
            this.spotLightMinAngles.push(minAngle)
            this.spotLightMaxAngles.push(maxAngle)
            this.spotLightDirections.push(direction)
        }
    }

    setPointLight(minAngle, maxAngle, speed, direction) {
        this.lightRotate = true
        if (!this.pointLights) {
            this.pointLights = []
            this.pointLightHelpers = []
            this.pointLightRotateAngles = []
            this.pointLightRotateSpeeds = []
            this.pointLightMinAngles = []
            this.pointLightMaxAngles = []
            this.pointLightDirections = []
        }
        const pointLight = new THREE.PointLight()
        pointLight.intensity = 20
        pointLight.position.set(5, 5, 5)
        pointLight.distance = 50 // The range of the point light

        pointLight.shadow.camera.left = -8
        pointLight.shadow.camera.right = 8
        pointLight.shadow.camera.top = 8
        pointLight.shadow.camera.bottom = -8
        pointLight.shadow.camera.near = 2
        pointLight.shadow.camera.far = 8

        pointLight.castShadow = true
        pointLight.shadow.mapSize.width = this.shadowMapSize 
        pointLight.shadow.mapSize.height = this.shadowMapSize
        this.pointLights.push(pointLight)
        this.scene.add(pointLight)

        if (this.debug.active) {
            // this.debugFolder.add(pointLight, 'distance').min(0).max(100).step(0.1).name('pointLightDistance')
            // this.debugFolder.add(pointLight, 'decay').min(0).max(2).step(0.01).name('pointLightDecay')
            // this.debugFolder.add(pointLight.position, 'x').min(-10).max(10).step(0.1).name('positionX')
            // this.debugFolder.add(pointLight.position, 'y').min(-10).max(10).step(0.1).name('positionY')
            // this.debugFolder.add(pointLight.position, 'z').min(-10).max(10).step(0.1).name('positionZ')
        }

        // Add a PointLightHelper
        // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
        // this.pointLightHelpers.push(pointLightHelper)
        // this.scene.add(pointLightHelper)

        this.pointLightRotateAngles.push(0)
        this.pointLightRotateSpeeds.push(speed)
        this.pointLightMinAngles.push(minAngle)
        this.pointLightMaxAngles.push(maxAngle)
        this.pointLightDirections.push(direction)
    }

    setEnvironmentMap() {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.5
        this.environmentMap.sphereTexture = this.resources.items.defaultEnvMapTexture
        this.environmentMap.worldTexture = this.resources.items.sphereEnvMapTexture

        this.environmentMap.sphereTexture.colorSpace = THREE.SRGBColorSpace
        this.environmentMap.worldTexture.colorSpace = THREE.SRGBColorSpace
        this.environmentMap.worldTexture.mapping = THREE.EquirectangularReflectionMapping

        this.scene.environment = this.environmentMap.worldTexture

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child.material) {
                    if (child.material instanceof CustomShaderMaterial) {
                        // child.material.envMap = this.environmentMap.sphereTexture
                    } else {
                        child.material.envMap = this.environmentMap.worldTexture
                    }
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }

        this.environmentMap.updateMaterials()
    }

    setSkybox(bgMapTexture, envMapTexture, intensity = 0.2) {
        if (this.environmentMap) {
            this.lightRotate = false
            const bgTexture = this.resources.items[bgMapTexture]
            bgTexture.name = bgMapTexture
            const envTexture = this.resources.items[envMapTexture]
            envTexture.name = envMapTexture
    
            this.environmentMap.worldTexture = envTexture
            this.environmentMap.worldTexture.colorSpace = THREE.SRGBColorSpace
            this.environmentMap.worldTexture.mapping = THREE.EquirectangularReflectionMapping
            this.environmentMap.bgTexture = bgTexture
            this.environmentMap.bgTexture.colorSpace = THREE.SRGBColorSpace
            this.environmentMap.bgTexture.mapping = THREE.EquirectangularReflectionMapping
            this.environmentMap.intensity = intensity

            this.scene.environment = this.environmentMap.worldTexture
    
            if (this.skybox) {
                this.scene.remove(this.skybox)
                this.skybox.geometry.dispose()
                this.skybox.material.dispose()
                this.skybox = null
            }

            // Normal: radius 70
            if (bgMapTexture.includes('mars')) {
                this.skybox = new GroundedSkybox(this.environmentMap.bgTexture, 20, 200, 128, this.environmentMap.intensity)
                // this.skybox.material.wireframe = true
            }
            else if (bgMapTexture.includes('forest')){
                this.skybox = new GroundedSkybox(this.environmentMap.bgTexture, 35, 65, 128, this.environmentMap.intensity)
            }
            else if (bgMapTexture.includes('moon')) {
                this.skybox = new GroundedSkybox(this.environmentMap.bgTexture, 35, 80, 128, this.environmentMap.intensity)
            }
            this.skybox.receiveShadow = true
            this.scene.add(this.skybox)
        }
    }

    destroy(light = 'all') {
        console.log(`Destroying lights of type: ${light}`)
    
        if (light === 'all') {
            this.lightRotate = false
            if (this.ambientLight) {
                this.scene.remove(this.ambientLight)
                if (this.ambientLight.dispose) this.ambientLight.dispose()
                this.ambientLight = null
            }
            if (this.spotLights) {
                this.spotLights.forEach(light => {
                    console.log(`Removing spot light: ${light.uuid}`)
                    this.scene.remove(light)
                    if (light.dispose) light.dispose()
                })
                this.spotLights = []
            }
    
            if (this.pointLights) {
                this.pointLights.forEach(light => {
                    console.log(`Removing point light: ${light.uuid}`)
                    this.scene.remove(light)
                    if (light.dispose) light.dispose()
                })
                this.pointLights = []
            }

            if (this.directionalLights) {
                this.directionalLights.forEach(light => {
                    console.log(`Removing directional light: ${light.uuid}`)
                    this.scene.remove(light)
                    if (light.dispose) light.dispose()
                })
                this.directionalLights = []
            }
        }
    
        else if (light === 'ambientLight') {
            if (this.ambientLight) {
                this.scene.remove(this.ambientLight)
                if (this.ambientLight.dispose) this.ambientLight.dispose()
                this.ambientLight = null
            }
        }
    
        else if (light === 'spotLight') {
            if (this.spotLights) {
                this.spotLights.forEach(light => {
                    this.scene.remove(light)
                    if (light.dispose) light.dispose() 
                })
                this.spotLights = []
            }
        }
    
        else if (light === 'pointLight') {
            if (this.pointLights) {
                this.pointLights.forEach(light => {
                    this.scene.remove(light)
                    if (light.dispose) light.dispose()
                })
                this.pointLights = []
            }
        }

        else if (light === 'directionalLight') {
            this.directionalLights.forEach(light => {
                console.log(`Removing directional light: ${light.uuid}`) 
                this.scene.remove(light)
                if (light.dispose) light.dispose()
            })
            this.directionalLights = []
        }
    
        else if (light === 'skybox') {
            if (this.skybox) {
                this.scene.remove(this.skybox)
                this.skybox.geometry.dispose()
                this.skybox.material.dispose()
                this.skybox = null
            }
        }
        
    
        else if (light === 'environmentMap') {
            if (this.environmentMap) {
                if (this.environmentMap.sphereTexture) {
                    this.environmentMap.sphereTexture.dispose()
                }
                if (this.environmentMap.worldTexture) {
                    this.environmentMap.worldTexture.dispose()
                }
                this.environmentMap = null
            }
        } else {
            console.warn('Unknown light type:', light)
        }
    }

    update() {
        if (this.spotLights && this.lightRotate) {
            this.sphere.startRotate = true
            for (let i = 0; i < this.spotLights.length; i++) {
                this.spotLightRotateAngles[i] += this.spotLightDirections[i] * this.spotLightRotateSpeeds[i]

                if (this.spotLightRotateAngles[i] > this.spotLightMaxAngles[i]) {
                    this.spotLightRotateAngles[i] = this.spotLightMaxAngles[i]
                    this.spotLightRotateSpeeds[i] *= -1 // Reverse direction
                } else if (this.spotLightRotateAngles[i] < this.spotLightMinAngles[i]) {
                    this.spotLightRotateAngles[i] = this.spotLightMinAngles[i]
                    this.spotLightRotateSpeeds[i] *= -1 // Reverse direction
                }

                this.spotLights[i].position.x = Math.cos(this.spotLightRotateAngles[i]) * 4
                this.spotLights[i].position.z = Math.sin(this.spotLightRotateAngles[i]) * 4

                this.spotLights[i].target.position.set(0, 1, 0)
                if (this.spotLightHelpers[i]) {
                    this.spotLightHelpers[i].update()
                }
            }
        }

        if (this.pointLights && this.lightRotate) {
            for (let i = 0; i < this.pointLights.length; i++) {
                this.pointLightRotateAngles[i] += this.pointLightDirections[i] * this.pointLightRotateSpeeds[i]

                if (this.pointLightRotateAngles[i] > this.pointLightMaxAngles[i]) {
                    this.pointLightRotateAngles[i] = this.pointLightMaxAngles[i]
                    this.pointLightRotateSpeeds[i] *= -1 // Reverse direction
                } else if (this.pointLightRotateAngles[i] < this.pointLightMinAngles[i]) {
                    this.pointLightRotateAngles[i] = this.pointLightMinAngles[i]
                    this.pointLightRotateSpeeds[i] *= -1 // Reverse direction
                }

                this.pointLights[i].position.x = Math.cos(this.pointLightRotateAngles[i]) * 4
                this.pointLights[i].position.z = Math.sin(this.pointLightRotateAngles[i]) * 4

                if (this.pointLightHelpers[i]) {
                    this.pointLightHelpers[i].update()
                }
            }
        }
    }
}