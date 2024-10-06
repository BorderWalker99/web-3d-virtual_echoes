uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;
uniform float uLightRepetitions;
uniform vec3 uLightColor;
uniform vec3 uLightPosition;
uniform vec3 uShadowPosition;
uniform bool uTrigger;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vZDepth;
varying float vYDepth;

#include ../../includes/ambientLight.glsl
#include ../../includes/directionalLight.glsl
#include ../../includes/spotLight.glsl
#include ../../includes/remap.glsl

#define PI 3.141592653589793

const float SPOT_ANGLE_1 = 7.0 * PI / 16.0;
const float SPOT_ANGLE_2 = -6.0 * PI / 16.0;

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
)
{
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv *= repetitions;
    uv = mod(uv, 1.0);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

    return mix(color, pointColor, point);
}

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    // vec3 light = vec3(0.0);

    // light += ambientLight(
    //     vec3(1.0),  // Light color
    //     1.0         // Light intensity
    // );

    // light += spotLight(
    //     vec3(1.0),  // Light color
    //     1.0,        // Light intensity
    //     normal,
    //     uSpotLightPosition1,
    //     viewDirection,
    //     1.5,        // Specular power
    //     vPosition,
    //     0.1,        // Light decay
    //     0.8,        // Spot angle
    //     0.1         // Spot penumbra
    // );

    // light += spotLight(
    //     vec3(1.0),  // Light color
    //     1.0,        // Light intensity
    //     normal,
    //     uSpotLightPosition2,
    //     viewDirection,
    //     1.5,        // Specular power
    //     vPosition,
    //     0.1,        // Light decay
    //     0.8,        // Spot angle
    //     0.1         // Spot penumbra
    // );

    // color *= light;

    // Halftone
    float shadowRepetitions = uShadowRepetitions;
    float lightRepetitions = uLightRepetitions;
    float alpha = 1.0;

    if (uTrigger) {
        float duration = 1.5; // 2 seconds
        float t = min(uTime / duration, 1.0); // Clamp t to [0, 1]
        float easeOutT = 1.0 - pow(1.0 - t, 2.0); // Ease-out function
        shadowRepetitions = mix(uShadowRepetitions, 200.0, easeOutT);
        lightRepetitions = mix(uLightRepetitions, 200.0, easeOutT);
        alpha = mix(1.0, 0.0, easeOutT); // Alpha goes from 1.0 to 0.0
    }

    color = halftone(
        color,
        shadowRepetitions,
        uShadowPosition,
        0.1,
        1.5,
        uShadowColor,
        normal
    );

    color = halftone(
        color,
        lightRepetitions,
        uLightPosition,
        - 0.2,
        1.5,
        uLightColor,
        normal
    );

    // Adjust color based on Z depth
    // float zDepthFactor = remap(vZDepth, -8.0, 8.0, 1.0, 0.25);
    // // float yDepthFactor = remap(vYDepth, -8.0, 8.0, 0.0, 2.0);
    // // float depthFactor = mix(zDepthFactor, yDepthFactor, 0.5); // Combine Z and Y depth factors
    // color *= zDepthFactor; // Closer to camera, darker the color

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}