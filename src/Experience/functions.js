import { gsap } from 'gsap'
import lottie from 'lottie-web'
import * as THREE from 'three'

export function isMobileDevice() {
    const isMobileUserAgent = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)
    const isSmallScreen = (window.innerWidth <= 430 && window.innerHeight <= 932)
    return isMobileUserAgent || isSmallScreen
}

export function isPhoneDevice() {
    const isMobileUserAgent = /iPhone|Android|iPod|Windows Phone/i.test(navigator.userAgent)
    const isSmallScreen = (window.innerWidth <= 430 && window.innerHeight <= 932)
    return isMobileUserAgent || isSmallScreen
}

export function delay(time) {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout)
            resolve()
        }, time)
    })
}

export function waitForScrollOnce(callback) {
    return new Promise((resolve) => {
        const scrollListener = (event) => {
            const direction = event.deltaY > 0 ? 'down' : 'up'
            
            resolve(direction)
            if (typeof callback === 'function') {
                callback(direction)
            }
            window.removeEventListener('wheel', scrollListener)
        }
        window.addEventListener('wheel', scrollListener, { once: true })
    })
}

export function waitForClickOnce(button, callback) {
    return new Promise((resolve) => {
        const clickListener = () => {
            resolve()
            if (typeof callback === 'function') {
                callback()
            }
            button.removeEventListener('click', clickListener)
        }
        button.addEventListener('click', clickListener, { once: true })
    })
}

export function waitForVariableToBeDefined(variableGetter) {
    return new Promise(resolve => {
        const checkVariable = () => {
            const element = variableGetter()
            if (element !== null && element !== undefined) {
                resolve(element)
            } else {
                requestAnimationFrame(checkVariable)
            }
        }
        requestAnimationFrame(checkVariable)
    })
}

export function disposeModel(scene, model) {
    scene.remove(model)
    if (model.geometry) {
        model.geometry.dispose()
    }
    if (model.material) {
        if (Array.isArray(model.material)) {
            model.material.forEach((material) => {
                if (material.map) material.map.dispose()
                material.dispose()
            })
        } else {
            if (model.material.map) model.material.map.dispose()
            model.material.dispose()
        }
    }
    model = null
}

export function fadeMesh(mesh, duration = 1, isPosition = false, positionX, positionY, positionZ, isRotation = false, rotationX, rotationY, rotationZ, endOpacity) {
    mesh.visible = true
    if (isPosition) {
        gsap.to(mesh.position, { duration: duration, x: positionX, y: positionY, z: positionZ, ease: 'power1.inOut' })
    }
    if (isRotation) {
        gsap.to(mesh.rotation, { duration: duration, x: rotationX, y: rotationY, z: rotationZ, ease: 'power1.inOut' })
    }
    if (mesh.isMesh) {
        gsap.to(mesh.material, { duration: duration, opacity: endOpacity, ease: 'power1.inOut' })
    }
    if (mesh instanceof THREE.Group) {
        mesh.children.forEach((child) => {
            if (child.isMesh) {
                gsap.to(child.material, { duration: duration, opacity: endOpacity, ease: 'power1.inOut' })
            }
        })
    }
}

export function createTitle(text, container, apply3D, isModelTitle = false, changeFontColor = false, fontColor) {
    const title = document.createElement('h1')
    const fragment = document.createDocumentFragment()

    if (isModelTitle) {
        title.classList.add('model-title-text')
    } else {
        title.classList.add('title-text')
    }

    if (changeFontColor) {
        title.style.color = fontColor
    }

    // title.classList.add('fade-in')
    const timeoutId = setTimeout(() => {
        title.classList.add('floating-text')
        clearTimeout(timeoutId)
    }, 2000)

    title.innerText = text

    const title3DContainer = document.createElement('div')
    if (apply3D)
        apply3DEffect(title3DContainer)

    title3DContainer.appendChild(title)
    fragment.appendChild(title3DContainer)

    container.classList.add('three-d')
    container.appendChild(fragment)
}

export function createBody(text, container) {
    const body = document.createElement('p')
    const fragment = document.createDocumentFragment()

    body.classList.add('body-text')
    const timeoutId = setTimeout(() => {
        body.classList.add('floating-text')
        clearTimeout(timeoutId)
    }, 2000)

    body.innerHTML = text
    fragment.appendChild(body)
    
    container.classList.add('three-d')
    container.appendChild(fragment)
}

export function addToDOM(container) {
    const contentWrapper = document.querySelector('.content-wrapper')
    if (contentWrapper) {
        contentWrapper.appendChild(container)
    } else {
        document.body.appendChild(container)
    }
}

export function addCircularButton(text, container, apply3D, inAnimation) {
    const button = document.createElement('button')
    const fragment = document.createDocumentFragment()

    button.classList.add('button')
    button.classList.add('circular')

    const buttonText = document.createElement('p')
    buttonText.classList.add('button__text')

    text.split('').forEach((letter, index) => {
        const span = document.createElement('span')
        span.style.setProperty('--index', index)
        span.innerText = letter
        buttonText.appendChild(span)
    })

    button.appendChild(buttonText)

    const buttonCircle = document.createElement('div')
    buttonCircle.classList.add('button__circle')

    const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg1.setAttribute('viewBox', '0 0 14 15')
    svg1.setAttribute('fill', 'none')
    svg1.setAttribute('width', '14')
    svg1.classList.add('button__icon')

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('d', 'M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z')
    path1.setAttribute('fill', 'currentColor')
    svg1.appendChild(path1)

    const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg2.setAttribute('viewBox', '0 0 14 15')
    svg2.setAttribute('fill', 'none')
    svg2.setAttribute('width', '14')
    svg2.classList.add('button__icon', 'button__icon--copy')

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute('d', 'M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z')
    path2.setAttribute('fill', 'currentColor')
    svg2.appendChild(path2)

    buttonCircle.appendChild(svg1)
    buttonCircle.appendChild(svg2)
    button.appendChild(buttonCircle)
    // if (inAnimation == 'fade-in')
    //     button.classList.add('fade-in')
    if (inAnimation == 'scale-in')
        button.classList.add('scale-in')

    const button3DContainer = document.createElement('div')
    if (apply3D)
    {
        apply3DEffect(button3DContainer)
        button3DContainer.appendChild(button)
        fragment.appendChild(button3DContainer)
        container.classList.add('three-d')
    }
    else 
    {
        fragment.appendChild(button)
    }
    
    container.appendChild(fragment)

    return button
}

export function addPillButton(text, container, apply3D) {
    const button = document.createElement('button')
    const fragment = document.createDocumentFragment()

    button.classList.add('button')
    button.classList.add('pill')
    button.style.setProperty('--clr', '#7808d0')

    const iconWrapper = document.createElement('span')
    iconWrapper.classList.add('button__icon-wrapper')

    const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg1.setAttribute('viewBox', '0 0 14 15')
    svg1.setAttribute('fill', 'none')
    svg1.setAttribute('width', '10')
    svg1.classList.add('button__icon-svg')

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('d', 'M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z')
    path1.setAttribute('fill', 'currentColor')
    svg1.appendChild(path1)

    const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg2.setAttribute('viewBox', '0 0 14 15')
    svg2.setAttribute('fill', 'none')
    svg2.setAttribute('width', '10')
    svg2.classList.add('button__icon-svg', 'button__icon-svg--copy')

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute('d', 'M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z')
    path2.setAttribute('fill', 'currentColor')
    svg2.appendChild(path2)

    iconWrapper.appendChild(svg1)
    iconWrapper.appendChild(svg2)
    button.appendChild(iconWrapper)

    const buttonText = document.createElement('p')
    buttonText.innerText = text
    buttonText.classList.add('button__text')
    button.appendChild(buttonText)
    // button.classList.add('fade-in')

    const button3DContainer = document.createElement('div')
    if (apply3D)
        apply3DEffect(button3DContainer)
    button3DContainer.appendChild(button)
    fragment.appendChild(button3DContainer)

    container.classList.add('three-d')

    container.appendChild(fragment)

    return button
}

export async function addLottieAnimation(animationPath, loop = true, autoplay = true) {
    const animationContainer = document.createElement('div')

    animationContainer.classList.add('lottie-container')

    let direction = 1

    const lottieAnimation = lottie.loadAnimation({
        container: animationContainer,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: animationPath
    })

    const completeListener = () => {
        direction = direction === 1 ? -1 : 1
        lottieAnimation.setDirection(direction)
        lottieAnimation.play()
    }

    lottieAnimation.addEventListener('complete', completeListener)

    addToDOM(animationContainer)

    await delay(100)
    animationContainer.style.opacity = 1

    const scaleAnimation = () => {
        const minScaleValue = 0.85
        const scaleValue = Math.max(Math.min(window.innerWidth, window.innerHeight) / 1000, minScaleValue)
        animationContainer.style.transform = `scale(${scaleValue})`
        animationContainer.style.setProperty('--initial-scale', scaleValue * 0.8)
        animationContainer.style.setProperty('--final-scale', scaleValue)
    }

    scaleAnimation()
    window.addEventListener('resize', scaleAnimation)

    await delay(500)
    const triggerListeners = async () => {
        animationContainer.style.opacity = 0
        await delay(1000)
        animationContainer.remove()
        // Remove all event listeners to clean up
        document.removeEventListener('mousedown', mouseDownListener)
        document.removeEventListener('touchstart', touchStartListener)
        window.removeEventListener('resize', scaleAnimation)
        lottieAnimation.removeEventListener('complete', completeListener)
    }
    
    // Mouse down event listener
    const mouseDownListener = async () => {
        clearTimeout(timer) // Clear the timer since the event was triggered
        await triggerListeners()
    }
    
    // Touch start event listener
    const touchStartListener = async () => {
        clearTimeout(timer) // Clear the timer since the event was triggered
        await triggerListeners()
    }
    
    // Set a timer to automatically trigger if no interaction occurs within 3 seconds
    const timer = setTimeout(async () => {
        await triggerListeners() // Trigger the event listeners if timeout occurs
    }, 6000)
    
    if (isMobileDevice()) {
        // For mobile devices, add touchstart event listener
        document.addEventListener('touchstart', touchStartListener, { once: true })
    } else {
        // For non-mobile devices, add mousedown event listener
        document.addEventListener('mousedown', mouseDownListener, { once: true })
    }

    return animationContainer
}

export function addScrollIndicator(textArray, container, apply3D) {
    const fragment = document.createDocumentFragment();

    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('scroll-container');

    const indicator = document.createElement('button');
    indicator.classList.add('scroll-indicator');

    const scrollDiv = document.createElement('div');
    scrollDiv.classList.add('scroll');
    indicator.appendChild(scrollDiv);

    scrollContainer.appendChild(indicator);

    if(textArray.length)
    {
        const textContainer = document.createElement('div');
        textContainer.classList.add('scroll-text-container');

        textArray.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            textContainer.appendChild(p);
        });

        scrollContainer.appendChild(textContainer);
    }

    const indicator3DContainer = document.createElement('div');
    if (apply3D) {
        apply3DEffect(indicator3DContainer);
    }
    indicator3DContainer.appendChild(scrollContainer);
    fragment.appendChild(indicator3DContainer);

    indicator.classList.add('fade-in');

    container.classList.add('three-d');
    container.appendChild(fragment);

    return indicator;
}

export function createCloseButton() {
    const fragment = document.createDocumentFragment()

    const closeButton = document.createElement('div')
    closeButton.classList.add('close-button')

    const line1 = document.createElement('div')
    line1.classList.add('line')

    const line2 = document.createElement('div')
    line2.classList.add('line')

    closeButton.appendChild(line1)
    closeButton.appendChild(line2)

    fragment.appendChild(closeButton)

    return closeButton
}

export function isLandscape() {
    if (window.screen.orientation) {
        return window.screen.orientation.angle === 90 || window.screen.orientation.angle === - 90
    } else if (window.screen.orientation) {
        return window.screen.orientation === 90 || window.screen.orientation === - 90
    }
    return false
};

export async function apply3DEffect(element, duration = 0.4) {

    let cursor = { x: 0, y: 0 }
    let orientation = { beta: 0, gamma: 0 }
    let rotateX = 0
    let rotateY = 0
    const maxRange = 1

    if (isMobileDevice()) {
        // const deviceOrientationEvent = (event) => {
        //     if (isLandscape()) {
        //         [beta, gamma] = [gamma, beta]
        //     }

        //     orientation.beta = event.beta / 180  // - 180 to 180 degrees
        //     orientation.gamma = event.gamma / 90  // - 90 to 90 degrees

        //     // rotateX = Math.max(- maxRange, Math.min(maxRange, orientation.beta * 8))
        //     rotateY = Math.max(- maxRange, Math.min(maxRange, orientation.gamma * 8))

        //     element.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
        // }
        // window.addEventListener('deviceorientation', deviceOrientationEvent)
    }
    else {
        element.style.transition = `transform ${duration}s ease-out`
        const mouseMoveListener = (event) => {
            cursor.x = event.clientX / window.innerWidth - 0.5
            cursor.y = - event.clientY / window.innerHeight + 0.5

            rotateX = cursor.y * 1.5
            rotateY = cursor.x * 1.1

            element.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
        }

        document.addEventListener('mousemove', mouseMoveListener)
    }
}

export function createTooltips(tools, isPreview) {
    const keyboardTooltipsContainer = document.createElement('div')
    keyboardTooltipsContainer.classList.add('tooltips')
    if (isPreview) {
        keyboardTooltipsContainer.classList.add('center')
    }
    else {
        keyboardTooltipsContainer.classList.add('left-bottom')
    }
    keyboardTooltipsContainer.id = 'keyboard-tooltips'

    const tooltipsInnerContainer = document.createElement('div')
    tooltipsInnerContainer.classList.add('tooltips-inner')

    const fragment = document.createDocumentFragment()

    const keysElements = {}

    if (tools.includes('w')) {
        // W to move forward
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const keyWElement = document.createElement('div')
        keyWElement.classList.add('key')
        keyWElement.textContent = 'W'
        keysElements['w'] = keyWElement
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Press W to move forward'
        captionContainer.appendChild(keyWElement)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('p')) {
        // P to take a picture
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const keyPElement = document.createElement('div')
        keyPElement.classList.add('key')
        keyPElement.textContent = 'P'
        keysElements['p'] = keyPElement
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Press P to take a picture'
        captionContainer.appendChild(keyPElement)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('drag-turn')) {
        // Drag to turn
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const dragIndicator = addScrollIndicator([], captionContainer, false)
        dragIndicator.classList.add('small-indicator')
        dragIndicator.classList.add('drag-indicator')
        dragIndicator.classList.add('left-right')
        dragIndicator.classList.remove('fade-in')
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Drag left and right to turn'
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)

    }

    if (tools.includes('drag-turn-360')) {
        // Drag to turn
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const dragIndicator = addScrollIndicator([], captionContainer, false)
        dragIndicator.classList.add('small-indicator')
        dragIndicator.classList.add('drag-indicator')
        dragIndicator.classList.add('left-right')
        dragIndicator.classList.remove('fade-in')
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Drag to explore 360° view'
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)

    }

    if (tools.includes('scroll-zoom')) {
        // Scroll to zoom
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const scrollIndicator = addScrollIndicator([], captionContainer, false)
        scrollIndicator.classList.add('small-indicator')
        scrollIndicator.classList.add('align-with-long')
        scrollIndicator.classList.remove('fade-in')
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Scroll to zoom'
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('drag-pan')) {
        // Drag to pan
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const dragIndicator = addScrollIndicator([], captionContainer, false)
        dragIndicator.classList.add('small-indicator')
        dragIndicator.classList.add('align-with-long')
        dragIndicator.classList.add('drag-indicator')
        dragIndicator.classList.add('up-down')
        dragIndicator.classList.remove('fade-in')
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Drag up and down to pan'
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('enter')) {
        // Enter to capture
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const keyEnterElement = document.createElement('div')
        keyEnterElement.classList.add('key', 'long')
        keyEnterElement.textContent = 'Enter'
        keysElements['p'] = keyEnterElement
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Press Enter to capture'
        captionContainer.appendChild(keyEnterElement)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('esc')) {
        // Esc to exit
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const keyEnterElement = document.createElement('div')
        keyEnterElement.classList.add('key', 'long')
        keyEnterElement.textContent = 'Esc'
        keysElements['p'] = keyEnterElement
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Press Esc to exit'
        captionContainer.appendChild(keyEnterElement)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('pinch-zoom')) {
        // Pinch to zoom
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const animationContainer = document.createElement('div')
        animationContainer.classList.add('lottie-container')
        lottie.loadAnimation({
            container: animationContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'json/pinch-zoom-anime.json'
        })
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Pinch to zoom'
        captionContainer.appendChild(animationContainer)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    if (tools.includes('scroll-pan')) {
        // Scroll to zoom
        const captionContainer = document.createElement('div')
        captionContainer.classList.add('caption-container')

        const animationContainer = document.createElement('div')
        animationContainer.classList.add('lottie-container')
        animationContainer.id = 'scroll-lottie'
        lottie.loadAnimation({
            container: animationContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'json/scroll-pan-anime.json'
        })
        const caption = document.createElement('p')
        caption.classList.add('caption')
        caption.textContent = 'Scroll to pan'
        captionContainer.appendChild(animationContainer)
        captionContainer.appendChild(caption)

        tooltipsInnerContainer.appendChild(captionContainer)
    }

    fragment.appendChild(tooltipsInnerContainer)

    keyboardTooltipsContainer.appendChild(fragment)
    return keyboardTooltipsContainer
}