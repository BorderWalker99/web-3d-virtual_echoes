import * as THREE from 'three'
import { isMobileDevice, delay, waitForScrollOnce, waitForClickOnce, waitForVariableToBeDefined } from '../functions.js'
import Hardware from './Hardware.js'
import Experience from '../Experience.js'

export default class Level1{
    constructor() {
        // Optional
        this.experience = new Experience()
        this.world = this.experience.world
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('hotspot')
        }

        this.setLevel1()
    }
    setLevel1() {
        this.setHardwares()
    }

    setHardwares() {
        const hardwareParametersList = []
        this.addStereoscopy(hardwareParametersList)
        this.addAppleVisionPro(hardwareParametersList)
        this.setHardwareModels(hardwareParametersList)
    }

    addStereoscopy(hardwareParametersList) {
        hardwareParametersList.push({
            needBoundingBoxModel: true,
            boundingBoxModel: this.resources.items.stereoscopyBoundingBoxModel,
            model: this.resources.items.stereoscopyModel,
            modelName: 'stereoscopy',
            initialPosition: {
                x: -10,
                y: 0,
                z: 2.5
            },
            initialRotation: {
                x: 0,
                y: 2,
                z: 0
            },
            targetPosition: {
                x: -0.08,
                y: 0.86,
                z: 0.17
            },
            targetRotation: {
                x: 0,
                y: 3.18,
                z: 0
            },
            scale: 0.12,
            titleText: '1849 Stereoscopy',
            bodyText: `
            The Brewster Stereoscope, invented by Sir David Brewster, was
            regarded as the first VR equipment ever in the history by using 
            two lenses to merge slightly different images, creating a 3D 
            illusion through binocular vision.
            `,
            pointsCount: 5,
            positionsArray: [
                new THREE.Vector3(- 0.1, 1.55, 0.2),
                new THREE.Vector3(- 0.55, 0.65, 1.28),
                new THREE.Vector3(0, 1.09, - 0.75),
                new THREE.Vector3(0, 0.8, 1.4),
                new THREE.Vector3(1.14, 1.1, 0.65)
            ],
            hotSpotTitleList: [
                'Viewer or Housing',
                'Lenses',
                'Stereoscopic Cards or Slides',
                'Hood or Eyepiece',
                'Adjustment Knob'
            ],
            hotSpotBodyList: [
                `This is the main body of the stereoscope. It is usually made of wood or
                metal and houses the lenses and the mechanism for holding the stereoscopic cards. The viewer is designed
                to block out external light, enhancing the 3D effect of the images.`,
                `The Brewster Stereoscope uses a pair of lenses situated at the front of the
                device. These lenses are designed to focus and align the two slightly different images presented to each
                eye, creating a single three-dimensional image. The lenses can often be adjusted to accommodate the
                viewer's eyesight.`,
                `These are the dual-image cards specifically designed for use
                with the stereoscope. Each card has two photographs taken from slightly different angles. When viewed
                through the stereoscope, these photographs merge into one three-dimensional image. The cards slide into
                a holder at the front of the device.`,
                `Many Brewster Stereoscopes come with a hood or eyepiece around the
                lenses. This part helps to block out additional light and to position the viewer’s eyes correctly in
                relation to the lenses, optimizing the 3D effect.`,
                `Depending on the model, Brewster Stereoscopes may include knobs to
                adjust the distance between the lenses or to focus the image. These adjustments can help accommodate
                different users' eyesight and enhance the clarity of the 3D effect.`
            ]
        })
    }
    addAppleVisionPro(hardwareParametersList) {
        hardwareParametersList.push({
            needBoundingBoxModel: true,
            boundingBoxModel: this.resources.items.appleVisionProBoundingBoxModel,
            model: this.resources.items.appleVisionProModel,
            modelName: 'appleVisionPro',
            initialPosition: {
                x: -10,
                y: 0,
                z: 2.5
            },
            initialRotation: {
                x: 0,
                y: 0.4,
                z: 0
            },
            targetPosition: {
                x: -0.08,
                y: 0.75,
                z: 0.17
            },
            targetRotation: {
                x: 0.16,
                y: - 1.58,
                z: 0
            },
            scale: 0.12,
            titleText: '2024 Apple Vision Pro',
            bodyText: `
            The Apple Vision Pro, launched in 2024, opens a new era of VR, 
            where you control everything with your eyes, hands, and voice. 
            From here, you will step into the next level.
            `,
            pointsCount: 5,
            positionsArray: [
            new THREE.Vector3(- 0.15, 0.8, 1.7),
            new THREE.Vector3(- 0.15, 1.35, 1.1),
            new THREE.Vector3(0, 1.0, - 1.5),
            new THREE.Vector3(0.4, 0.8, 0.9),
            new THREE.Vector3(-1.05, 1.15, 1.1)],
            hotSpotTitleList: [
                'Front Glass Panel',
                'Headset Frame',
                'Modular Strap System',
                'Dual Micro-OLED Displays',
                'Crown Dial'
            ],
            hotSpotBodyList: [
                `The front of the Vision Pro features a seamless, curved glass panel, which serves as both a protective 
            surface and a way to reflect the wearer’s eyes, creating a more natural interaction for those around them. 
            This glass panel is smooth and minimalist, contributing to the device’s sleek and modern look.`,
                `The aluminum alloy frame that surrounds the device is lightweight yet durable. It gives the Vision Pro 
            a solid structural integrity while maintaining a light enough form for long-term comfort. The frame houses 
            many of the sensors, cameras, and microphones, all carefully embedded to maintain the streamlined design.`,
                `The Vision Pro uses an adjustable, modular strap system that wraps around the head to provide a secure 
            yet comfortable fit. The “Light Seal” padding around the eyes is made from soft, breathable materials 
            that conform to the user’s face, creating a snug fit that minimizes light leakage and enhances the 
            immersive experience.`,
                `The Vision Pro’s visual performance is driven by two micro-OLED displays housed behind the glass 
            panel. These displays offer an ultra-high resolution of 23 million pixels, providing exceptional 
            clarity for virtual and augmented reality experiences. The pixel density is so high that 
            individual pixels are virtually indistinguishable, giving users a highly immersive visual experience.`,
                `On the side of the Vision Pro is a digital crown—similar to the one found on the Apple Watch—which 
            allows users to adjust the levelof immersion. By turning the crown, users can transition between 
            full virtual reality and augmented reality, adjusting how much of the real-world environment is 
            visible alongside virtual content.`
            ]
        })
    }
    // Each hardware include: model, modelName, initialPosition, initialRotation, targetPosition, targetRotation, scale, titleText, bodyText, pointsCount, positionsArray, hotSpotTitleList, hotSpotBodyList
    async setHardwareModels(hardwareParametersList) {
        this.hardwareList = []
        for (let i = 0; i < hardwareParametersList.length; i++) {
            this.currentModel = this.nextModel
    
            if (this.debug.active) {
                this.debugFolder.add(hardwareParametersList[i].positionsArray[1], 'x').min(-10).max(10).step(0.001).name('point1 x')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[1], 'y').min(-10).max(10).step(0.001).name('point1 y')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[1], 'z').min(-10).max(10).step(0.001).name('point1 z')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[2], 'x').min(-10).max(10).step(0.001).name('point4 x')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[2], 'y').min(-10).max(10).step(0.001).name('point4 y')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[2], 'z').min(-10).max(10).step(0.001).name('point4 z')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[4], 'x').min(-10).max(10).step(0.001).name('point5 x')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[4], 'y').min(-10).max(10).step(0.001).name('point5 y')
                this.debugFolder.add(hardwareParametersList[i].positionsArray[4], 'z').min(-10).max(10).step(0.001).name('point5 z')
            }
    
            const hardware = new Hardware(
                hardwareParametersList[i].needBoundingBoxModel,
                hardwareParametersList[i].boundingBoxModel,
                hardwareParametersList[i].model,
                hardwareParametersList[i].modelName,
                hardwareParametersList[i].initialPosition,
                hardwareParametersList[i].initialRotation,
                hardwareParametersList[i].targetPosition,
                hardwareParametersList[i].targetRotation,
                hardwareParametersList[i].scale,
                i === 0,
                i === hardwareParametersList.length - 1,
                this.fadeOutDuration,
                hardwareParametersList[i].titleText,
                hardwareParametersList[i].bodyText,
                hardwareParametersList[i].pointsCount,
                hardwareParametersList[i].positionsArray,
                hardwareParametersList[i].hotSpotTitleList,
                hardwareParametersList[i].hotSpotBodyList
            )
    
            this.hardwareList.push(hardware)
            console.log(hardware)
    
            if (i === hardwareParametersList.length - 1) {
                await waitForVariableToBeDefined(() => hardware.button)
                hardware.button.addEventListener('click', async () => {
                    hardware.destroy()
                    await waitForVariableToBeDefined(() => hardware.hardwareOut)
                    this.hardwareOut = true
                }, { once: true })
            } else {
                if (isMobileDevice()) {
                    await waitForVariableToBeDefined(() => hardware.button)
                    await waitForClickOnce(hardware.button)
                } else {
                    await waitForVariableToBeDefined(() => hardware.indicator)
                    await waitForScrollOnce()
                }
                if (hardware.container) {
                    hardware.destroy()
                    await delay(3000)
                }
            }
        }
    }
    update() {
        if (this.hardwareList) {
            this.hardwareList.forEach(hardware => {
                hardware.update()
            })
        }
    }
}
