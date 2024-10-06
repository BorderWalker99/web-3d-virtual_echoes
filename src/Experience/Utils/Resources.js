import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import EventEmitter from "./EventEmitter.js"
import Experience from '../Experience.js'

export default class Resources extends EventEmitter
{
    constructor(sources)
    {
        super()

        // Options
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.sources = sources
        
        // Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoadingOverlay()
        // this.setLoadingBar()
        // this.setLoadingRubixCube()
        this.setLoadingSpinningBall()
        this.setLoaders()
        this.startTime = Date.now()
        this.startLoading()
    }

    setLoaders()
    {
        this.loaders = {}
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.dracoLoader = new DRACOLoader()
        this.loaders.dracoLoader.setDecoderPath('/draco/')
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
        this.loaders.rgbeLoader = new RGBELoader()
    }

    startLoading()
    {
        this.currentProgressValue = 0;
        // Load each source
        for(const source of this.sources)
        {
            if(source.type == 'gltfModel')
            {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type == 'texture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type == 'cubeTexture')
            {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type == 'hdrTexture')
            {
                this.loaders.rgbeLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type == 'ldrTexture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file)
    {
        this.items[source.name] = file

        this.loaded++

        if (this.loadingBar)
        {
            this.progressRatio = this.loaded / this.toLoad
            this.loadingBar.style.transform = `scaleX(${this.progressRatio})`
        }

        if (this.loadingRubixCube || this.loadingSpinningBall)
        { 
            const updateLoadingProgress = () => {
                this.progressRatio = this.loaded / this.toLoad
                const targetValue = Math.round(this.progressRatio * 100)
            
                if (this.currentProgressValue < targetValue) {
                    this.currentProgressValue += 1
                }
                else if (this.currentProgressValue > targetValue) {
                    this.currentProgressValue -= 1
                }
            
                this.loadingProgressValue.textContent = `${this.currentProgressValue}%`
            
                if (this.currentProgressValue !== targetValue) {
                    requestAnimationFrame(updateLoadingProgress.bind(this))
                }
            }
            
            requestAnimationFrame(updateLoadingProgress.bind(this));
        }

        if(this.loaded == this.toLoad)
        {
            this.trigger('ready')
            window.setTimeout(() => {
                // Fade out the overlay
                if (this.overlay)
                    gsap.to(this.overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

                // Fade out the loading bar
                if (this.loadingBar)
                {
                    this.loadingBar.classList.add('ended')
                    this.loadingBar.style.transform = ''
                }

                // Fade out the loading rubix cube
                if (this.loadingRubixCube || this.loadingSpinningBall)
                {
                    this.loadingContainer.classList.add('ended')
                    window.setTimeout(() => {
                        this.loadingContainer.remove()
                    }, 1500)
                }
            }, 500)
            window.setTimeout(() => {
                this.loadingTime = Date.now() - this.startTime + 2500
            }, 4500)
        }
    }

    setLoadingOverlay()
    {
        this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        this.overlayMaterial = new THREE.ShaderMaterial({
            // wireframe: true,
            transparent: true,
            uniforms:
            {
                uAlpha: { value: 1 }
            },
            vertexShader: `
                void main()
                {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uAlpha;
        
                void main()
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
                }
            `
        })
        this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)
        this.scene.add(this.overlay)
    }


    setLoadingBar()
    {
        // Create loading bar
        this.loadingBar = document.createElement('div')
        this.loadingBar.classList.add('loading-bar')

        document.body.appendChild(this.loadingBar)
    }

    setLoadingRubixCube()
    {
        // Create Rubix Cube
        this.loadingRubixCube = document.createElement('div')
        this.loadingRubixCube.classList.add('loading-rubixcube')

        for (let i = 1; i <= 9; i++) {
            const square = document.createElement('div')
            square.classList.add('square')
            square.id = `sq${i}`
            this.loadingRubixCube.appendChild(square)
        }

        // Create progress value
        this.loadingProgressValue = document.createElement('div')
        this.loadingProgressValue.textContent = '0%'
        this.loadingProgressValue.classList.add('loading-progress-value')

        // Create loadingContainer
        this.loadingContainer = document.createElement('div')
        this.loadingContainer.classList.add('loading-container')
        this.loadingContainer.appendChild(this.loadingRubixCube)
        this.loadingContainer.appendChild(this.loadingProgressValue)

        document.body.appendChild(this.loadingContainer)
    }

    setLoadingSpinningBall()
    {
        // Create spinning ball
        this.loadingSpinningBall = document.createElement('div')
        this.loadingSpinningBall.classList.add('spinner')

        const loadingSpinningBall1 = document.createElement('div')
        loadingSpinningBall1.classList.add('spinner1')

        this.loadingSpinningBall.appendChild(loadingSpinningBall1)

         // Create progress value
         this.loadingProgressValue = document.createElement('div')
         this.loadingProgressValue.textContent = '0%'
         this.loadingProgressValue.classList.add('loading-progress-value')
 
         // Create loadingContainer
         this.loadingContainer = document.createElement('div')
         this.loadingContainer.classList.add('loading-container')
         this.loadingContainer.appendChild(this.loadingSpinningBall)
         this.loadingContainer.appendChild(this.loadingProgressValue)

         document.body.appendChild(this.loadingContainer)
    }
}