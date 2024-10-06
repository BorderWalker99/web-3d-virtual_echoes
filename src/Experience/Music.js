import Experience from './Experience.js'
import { delay, isMobileDevice } from './functions.js'


export default class Music {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.bgmPaused = true

        this.resources.on('ready', async () => {
            this.setMusic()
        })
    }


    async setMusic() {
        await delay(1000)
        this.musicCheckbox = document.getElementById('musicCheckboxInput')
        this.toggleSwitch = document.querySelector('#musicCheckboxInput+.toggleSwitch')
        this.bgm = document.getElementById('sphere-music')

        await delay(1000)
        this.toggleSwitch.style.transform = 'scale(1)'

        this.defaultActivateMusicHandler = () => {
            this.bgm.play()
            this.bgmPaused = false
        }

        window.addEventListener('click', this.defaultActivateMusicHandler, { once: true })

        this.musicCheckboxHandler = () => {
            if (this.musicCheckbox.checked) {
                this.bgm.pause()
                this.bgmPaused = true
                window.removeEventListener('click', this.defaultActivateMusicHandler)
            } else {
                this.bgm.play()
                this.bgmPaused = false
                window.removeEventListener('click', this.defaultActivateMusicHandler)
            }
        }

        this.musicCheckbox.addEventListener('change', this.musicCheckboxHandler)
    }

    async switchMusic(musicType) {
        const musicIdMap = {
            mars: 'mars-music',
            moon: 'moon-music',
            forest: 'forest-music',
            sphere: 'sphere-music'
        }

        const newMusicId = musicIdMap[musicType]
        if (!newMusicId) {
            console.error(`Invalid music type: ${musicType}`)
            return
        }

        const newBgm = document.getElementById(newMusicId)
        if (!newBgm) {
            console.error(`Music element with id ${newMusicId} not found`)
            return
        }

        if (this.bgm && !this.bgmPaused) {
            if (!isMobileDevice()) {
                this.bgm.volume = 1
                const fadeOutInterval = setInterval(async () => {
                    if (this.bgm.volume > 0.1) {
                        this.bgm.volume -= 0.1
                    } else {
                        clearInterval(fadeOutInterval)
                        await delay(1500)
                        this.bgm.pause()
                        this.bgmPaused = true
                        this.bgm.volume = 1 // Reset volume for the next play
                        this.bgm = newBgm
                        this.bgm.currentTime = 0
                        this.bgm.play()
                        this.bgmPaused = false
                    }
                }, 100)
            } else {
                this.bgm.pause()
                this.bgmPaused = true
                this.bgm = newBgm
                this.bgm.currentTime = 0
                await delay(2000)
                this.bgm.play()
                this.bgmPaused = false
            }
        } else {
            // If the current bgm is paused, just switch to the new bgm
            this.bgm = newBgm
        }
        if (this.musicCheckboxHandler) {

            this.musicCheckbox.removeEventListener('change', this.musicCheckboxHandler)
            this.musicCheckboxHandler = () => {
                if (this.musicCheckbox.checked) {
                    this.bgm.pause()
                    this.bgmPaused = true
                } else {
                    this.bgm.play()
                    this.bgmPaused = false
                }
            }

            this.musicCheckbox.addEventListener('change', this.musicCheckboxHandler)
        }
    }
}