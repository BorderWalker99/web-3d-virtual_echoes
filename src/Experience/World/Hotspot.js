import * as THREE from 'three'
import Experience from "../Experience.js"
import { delay } from '../functions.js'

export default class Hotspot {
    constructor(needBoundingBoxModel, boundingBoxModel, model, modelName, pointsCount, positionsArray, titleList, bodyList) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.sizes = this.experience.sizes
        this.debug = this.experience.debug
        this.camera = this.experience.camera

        this.model = model
        this.needBoundingBoxModel = needBoundingBoxModel
        this.boundingBoxModel = boundingBoxModel
        this.modelName = modelName
        this.pointsCount = pointsCount
        this.positionsArray = positionsArray
        this.titleList = titleList
        this.bodyList = bodyList

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('hotspot')
        }

        // Setup
        this.setHotSpots()
    }

    async setHotSpots() {
        this.hotSpots = this.positionsArray.map((position, index) => {
            const fragment = document.createDocumentFragment()
        
            const element = document.createElement('div')
            element.classList.add('point', `point-${index}`, this.modelName)
        
            const labelDiv = document.createElement('div')
            labelDiv.classList.add('label')
            labelDiv.innerHTML = index + 1
        
            const captionDiv = document.createElement('div')
            captionDiv.classList.add('caption')
        
            const bgDiv = document.createElement('div')
            bgDiv.classList.add('bgblue')
        
            const textDiv = document.createElement('div')
            textDiv.classList.add('text')
        
            const titleSpan = document.createElement('span')
            titleSpan.classList.add('title')
            titleSpan.innerHTML = this.titleList[index] + "<br>"
        
            const descriptionText = document.createTextNode(this.bodyList[index])
        
            textDiv.appendChild(titleSpan)
            textDiv.appendChild(descriptionText)
            bgDiv.appendChild(textDiv)
            captionDiv.appendChild(bgDiv)
        
            element.appendChild(labelDiv)
            element.appendChild(captionDiv)
        
            fragment.appendChild(element)
            document.body.appendChild(fragment)
        
            return {
                position: position,
                element: element
            }
        })

        await delay(100)
        this.raycaster = new THREE.Raycaster()
    }

    update() {
        if (this.raycaster) {
            // Get the world position of the camera
            const cameraWorldPosition = new THREE.Vector3();
            this.camera.instance.getWorldPosition(cameraWorldPosition);
    
            for (const point of this.hotSpots) {
                const screenPosition = point.position.clone();
                screenPosition.project(this.camera.instance);
    
                this.raycaster.setFromCamera(screenPosition, this.camera.instance);
                let intersects = [];
                if (this.needBoundingBoxModel) {
                    intersects = this.raycaster.intersectObjects(this.boundingBoxModel.children, true);
                } else {
                    intersects = this.raycaster.intersectObjects(this.model.children, true);
                }
    
                if (intersects.length == 0) {
                    point.element.classList.add('visible');
                } else {
                    const intersectionDistance = intersects[0].distance;
                    const pointDistance = point.position.distanceTo(cameraWorldPosition);
    
                    if (intersectionDistance < pointDistance) {
                        point.element.classList.remove('visible');
                    } else {
                        point.element.classList.add('visible');
                    }
                }
    
                const translateX = screenPosition.x * this.sizes.width * 0.5;
                const translateY = -screenPosition.y * this.sizes.height * 0.5;
                point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        }
    }
    destroy ()
    {
        if (this.hotSpots) {
            this.hotSpots.forEach(async (point) => {
                if (this.raycaster) {
                    this.raycaster = null
                }
                point.element.classList.remove('visible')
                await delay(1500)
                point.element.remove()
            })
        }
    }
}