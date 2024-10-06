# Virtual Echoes

**Virtual Echoes** is a 3D interactive virtual journey experience built with Three.js, allowing users to explore multiple virtual worlds and enjoy immersive experiences through character control and camera preview functionality.

## Features

- **Audio Integration**: The virtual world supports background music and ambient sound effects to enhance immersion.
- **VR Device Showcase**: Includes 3D models of VR devices, allowing users to rotate and explore different components of the devices.
- **Multiple Virtual World Environments**: Explore environments like the Moon, Mars, and forests.
- **3D Character Control and Animation**: Users can control characters using the keyboard or virtual joystick, performing complex animations.
- **Camera Preview Mode**: Built-in camera system that supports preview mode and screenshot functionality, allowing users to capture scenes from any angle.
- **Responsive Design**: Optimized for mobile devices with touch support and device orientation control.
- **Event Listener Optimization**: Interactive events such as `mousemove`, `click`, and `deviceorientation` are managed efficiently, with unused listeners cleaned up when no longer necessary.


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/virtual-echoes.git
   cd virtual-echoes
   ```
   
2. Install dependencies:
   ```bash
   npm install
   ```
   
3. Start the development server:
   ```bash
   http://localhost:8080
   ```
   

## Usage

- Use **WASD keys** or the **virtual joystick** to control character movement.
- Click the **camera button** to enter preview mode, and use **mouse drag** or **touch swipe** to rotate the view.
- Press **Enter key** or click the **snapshot button** to capture a screenshot.
- On mobile devices, use the **device orientation sensor** to control the view rotation and interact through touch gestures.
- Enter **VR Device Showcase Mode**, allowing users to rotate and view the components of virtual device models.

## Tech Stack

- **Three.js**: Powers the 3D rendering and scene management.
- **GSAP**: Handles smooth animations and transitions in the scene.
- **Lottie**: Integrates animations for UI and interactive elements.
- **Vite**: A modern build tool that optimizes the development and build process.
- **WebGL**: Provides high-performance graphics rendering.

## Project Structure

```bash
Virtual Echoes/
│
├── .vercel/                      # Vercel configuration files for deployment
├── resources/                    # Folder containing external resources like models, textures, and audio files
├── static/                       # Static assets such as images, fonts, etc.
├── src/                          # Main source folder for the project
│   ├── index.html                # Entry point HTML file for the application
│   ├── script.js                 # Main JavaScript file initializing the project
│   ├── style.css                 # Global styles for the project
│   ├── Experience/               # Core folder containing all key modules
│   │   ├── Experience.js         # Main Experience class, initializing all components
│   │   ├── Renderer.js           # Renderer module handling Three.js rendering
│   │   ├── Camera.js             # Camera control and setup, including interaction handling
│   │   ├── Music.js              # Background music management for different scenes
│   │   ├── OrientationDetecter.js# Detects device orientation for mobile interactivity
│   │   ├── sources.js            # Manages sources for resources like models, textures, and sounds
│   │   ├── functions.js          # Utility functions used across various modules
│   │   ├── World/                # World management containing levels and environmental elements
│   │   │   ├── World.js          # Main world manager, orchestrates different levels and interactions
│   │   │   ├── Level1.js         # Script for the first level setup
│   │   │   ├── Level2.js         # Script for the second level setup
│   │   │   ├── Level3.js         # Script for the third level setup
│   │   │   ├── Level4.js         # Script for the fourth level setup
│   │   │   ├── Hotspot.js        # Manages hotspots for interactive areas in the scenes
│   │   │   ├── Introduction.js   # Initial introduction scene before entering main levels
│   │   │   ├── Sphere.js         # Manages sphere-related 3D objects and interactions
│   │   │   ├── Environment.js    # Controls the lighting, background, and environmental elements of scenes
│   │   │   ├── Hardware.js       # VR hardware model for display and interaction in VR Device Showcase mode
│   │   ├── Utils/                # Utility modules for time, size, debugging, etc.
│   │   │   ├── Sizes.js          # Handles responsive size adjustments based on screen size
│   │   │   ├── Time.js           # Manages time tracking for animations and updates
│   │   │   ├── EventEmitter.js   # Custom event emitter for managing custom events
│   │   │   ├── Resources.js      # Manages loading of 3D models, textures, and other resources
│   │   │   ├── Stats.js          # Performance stats and monitoring for development
│   │   │   ├── Debug.js          # Debugging tools for inspecting variables and performance
│   │   ├── includes/             # Folder for shared GLSL shader files
│   ├── shaders/                  # Custom shaders used in the project
├── package.json                  # Node.js project dependencies and script definitions
├── package-lock.json             # Locks down the specific dependency versions
├── vite.config.js                # Configuration file for Vite, the build tool
├── README.md                     # Project documentation
```

## Performance Optimizations

- **Model Optimization**: Uses Draco compression to reduce the size of `.glb` models, improving load times.
- **Event Listener Management**: Removes unnecessary `mousemove`, `click`, and `deviceorientation` event listeners when not in use to reduce resource consumption.
- **Lazy Loading Resources**: Implements lazy loading for larger assets like 3D models and audio, ensuring resources are only loaded when needed, minimizing initial load times.
- **Device Adaptation**: Uses `User-Agent` and `CSS media queries` to adapt to different screen sizes and resolutions, ensuring a smooth experience on mobile devices.
- **Dynamic Resolution Adjustment**: Adjusts rendering resolution dynamically based on device performance, optimizing performance on high-resolution devices.

## Contributing

I welcome contributions via Pull Requests to improve the project. For major changes, please open an issue to discuss what you'd like to change.

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/), allowing for free use and modification.
