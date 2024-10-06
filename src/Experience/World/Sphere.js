import * as THREE from 'three'
import Experience from "../Experience.js"
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { delay, fadeMesh } from '../functions.js'
import sphereVertexShader from '../shaders/halftone_sphere/vertex.glsl'
import sphereFragmentShader from '../shaders/halftone_sphere/fragment.glsl'

export default class Sphere {
    constructor(colorA, colorB, colorC) {
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.environment = this.experience.environment
        this.sizes = this.experience.sizes
        this.time = this.experience.time
        this.debug = this.experience.debug
        // this.colorA = colorA   // '#6d366b'
        // this.colorB = colorB  // '#7e4e75'
        this.sphereColor = colorA 
        this.shadowColor = colorB
        this.lightColor = colorC
        this.rotationSpeed = 0.0075
        this.rotationX = 1
        this.rotationDirection = -1
        this.startRotate = false

        // SpotLight properties
        this.lightPosition = new THREE.Vector3(1, 1, 0)
        this.shadowPosition = new THREE.Vector3(
            -this.lightPosition.x,
            -this.lightPosition.y,
            -this.lightPosition.z
        )

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('sphere')
        }

        // Setup
        this.setGeometry()
        // this.setShaderWithBaseMaterial()
        this.setShaderMaterial()
        this.setMesh()
        this.setCamera()
    }

    async setCamera()
    {
        // this.camera.instance.position.set(0, 0, 25)
        // await delay(2500)
        // fadeMesh(this.camera.instance, 2, true, 0, 0, 6, false, 0, 0, 0, 1)
        this.camera.instance.position.set(0, 0, 6)
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(8, 32, 32)
    }

    // setShaderWithBaseMaterial()
    // {
    //     this.material = new CustomShaderMaterial({
    //     // CSM
    //     baseMaterial: THREE.MeshPhysicalMaterial,
    //     vertexShader: sphereVertexShader,
    //     fragmentShader: sphereFragmentShader,
    //     uniforms: {
    //         uColorA: new THREE.Uniform(new THREE.Color(this.colorA)),
    //         uColorB: new THREE.Uniform(new THREE.Color(this.colorB)),
    //         uTargetColorA: new THREE.Uniform(new THREE.Color(this.colorA)),
    //         uTargetColorB: new THREE.Uniform(new THREE.Color(this.colorB)),
    //         uTime: new THREE.Uniform(0),
    //         uTrigger: new THREE.Uniform(0)
    //     },
    //     silent: true,
    //     side: THREE.DoubleSide,
    
    //     // MeshPhysicalMaterial
    //     metalness: 0,
    //     roughness: 0.5,
    //     color: '#ffffff',
    //     transmission: 0,
    //     ior: 1.5,
    //     thickness: 1.5,
    //     wireframe: false
    //     })

    //     // Debug
    //     if(this.debug.active)
    //         {
    //             const debugObject = {
    //                 sphereBaseColor: '#6d366b',
    //                 sphereLineColor: '#7e4e75'
    //             }
    //             this.debugFolder
    //                 .addColor(debugObject, 'sphereBaseColor')
    //                 .onChange(() => {
    //                     this.material.uniforms.uColorA.value.set(new THREE.Color(debugObject.sphereBaseColor))
    //                 })
    //             this.debugFolder
    //                 .addColor(debugObject, 'sphereLineColor')
    //                 .onChange(() => {
    //                     this.material.uniforms.uColorB.value.set(new THREE.Color(debugObject.sphereLineColor))
    //                 })
    //         }
    // }

    setShaderMaterial() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: sphereVertexShader,
            fragmentShader: sphereFragmentShader,
            uniforms: {
                uColor: new THREE.Uniform(new THREE.Color(this.sphereColor)),
                uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width, this.sizes.height)),
                uShadowRepetitions: new THREE.Uniform(25),
                uShadowColor: new THREE.Uniform(new THREE.Color(this.shadowColor)),
                uLightRepetitions: new THREE.Uniform(35),
                uLightColor: new THREE.Uniform(new THREE.Color(this.lightColor)),
                uLightPosition: new THREE.Uniform(this.lightPosition),
                uShadowPosition: new THREE.Uniform(this.shadowPosition),
                uTrigger: new THREE.Uniform(false),
                uTime: new THREE.Uniform(0),
            },
            side: THREE.DoubleSide,
            // transparent: true
        });

        // Debug
        if (this.debug.active) {
            const debugObject = {
                sphereColor: this.sphereColor,
                sphereShadowColor: this.shadowColor,
                sphereLightColor: this.lightColor
            };
            this.debugFolder
                .addColor(debugObject, 'sphereColor')
                .onChange(() => {
                    this.material.uniforms.uColor.value.set(new THREE.Color(debugObject.sphereColor));
                });
            this.debugFolder
                .addColor(debugObject, 'sphereShadowColor')
                .onChange(() => {
                    this.material.uniforms.uShadowColor.value.set(new THREE.Color(debugObject.sphereShadowColor));
                });
            this.debugFolder
                .addColor(debugObject, 'sphereLightColor')
                .onChange(() => {
                    this.material.uniforms.uLightColor.value.set(new THREE.Color(debugObject.sphereLightColor));
                });
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.z = - 1
        this.scene.add(this.mesh)
    }

    update()
    {
        this.mesh.rotation.y += this.time.delta * 0.00005

        if (this.startRotate) {
            // Update lightPosition x-coordinate
            this.rotationX += this.rotationSpeed * this.rotationDirection;
            if (this.rotationX <= -1 || this.rotationX >= 1) {
                this.rotationDirection *= -1; // Reverse direction
            }
        
            this.lightPosition.x = this.rotationX;
        
            // Update shadowPosition to be symmetric to lightPosition
            this.shadowPosition.x = -this.lightPosition.x;
        
            // Update uniforms
            this.material.uniforms.uLightPosition.value = this.lightPosition;
            this.material.uniforms.uShadowPosition.value = this.shadowPosition;
    }

    // Check if trigger is active
    if (this.material.uniforms.uTrigger.value) {
        const duration = 1.5;
        this.material.uniforms.uTime.value += this.time.delta * 0.001;

        // Clamp uTime to duration to stop it from increasing indefinitely
        if (this.material.uniforms.uTime.value > duration) {
            this.material.uniforms.uTime.value = duration;
        }
    }
    }
}