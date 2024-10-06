import * as THREE from 'three'
import Sizes from "./Utils/Sizes.js"
import Time from "./Utils/Time.js"
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import Debug from './Utils/Debug.js'
import Stats from './Utils/Stats.js'
import Music from './Music.js'
import sources from './sources.js'

let instance = null   // Convert "Experience" into a singleton

export default class Experience
{
    constructor(canvas)
    {
        if(instance)
        {
            return instance
        }

        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas
        
        // Setup
        this.debug = new Debug()
        this.stats = new Stats()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.music = new Music()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
        
        // Sizes resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })
    }
    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        this.stats.updateStart()
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.stats.updateEnd()
    }
}