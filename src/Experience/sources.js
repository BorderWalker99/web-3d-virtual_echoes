export default[
    {
        name: 'defaultEnvMapTexture',
        type: 'cubeTexture',
        path:
        [
            'environmentMaps/default/px.jpg',
            'environmentMaps/default/nx.jpg',
            'environmentMaps/default/py.jpg',
            'environmentMaps/default/ny.jpg',
            'environmentMaps/default/pz.jpg',
            'environmentMaps/default/nz.jpg'
        ]
    },
    {
        name: 'sphereEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/sphere-512.webp'
    },
    {
        name: 'stereoscopyModel',
        type: 'gltfModel',
        path: 'models/stereoscopy/stereoscopy.glb'
    },
    {
        name: 'stereoscopyBoundingBoxModel',
        type: 'gltfModel',
        path: 'models/stereoscopy/stereoscopy-simplified.glb'
    },
    {
        name: 'appleVisionProModel',
        type: 'gltfModel',
        path: 'models/appleVisionPro/appleVisionPro.glb'
    },
    {
        name: 'appleVisionProBoundingBoxModel',
        type: 'gltfModel',
        path: 'models/appleVisionPro/appleVisionPro-simplified.glb'
    },
    {
        name: 'characterModel',
        type: 'gltfModel',
        path: 'models/character/character.glb'
    },
    {
        name: 'moonLargeEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/moon-8k.jpeg'
    },
    {
        name: 'marsLargeEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/mars-8k.jpeg'
    },
    {
        name: 'forestLargeEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/forest-8k.jpeg'
    },
    {
        name: 'moonMediumEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/moon-2k.jpeg'
    },
    {
        name: 'marsMediumEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/mars-2k.jpeg'
    },
    {
        name: 'forestMediumEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/forest-2k.jpeg'
    },
    {
        name: 'moonSmallEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/moon-1k.jpeg'
    },
    {
        name: 'marsSmallEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/mars-1k.jpeg'
    },
    {
        name: 'forestSmallEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/forest-1k.jpeg'
    },
    {
        name: 'moonTinyEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/moon-512.jpeg'
    },
    {
        name: 'marsTinyEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/mars-512.jpeg'
    },
    {
        name: 'forestTinyEnvMapTexture',
        type: 'ldrTexture',
        path: 'environmentMaps/forest-512.jpeg'
    },
]