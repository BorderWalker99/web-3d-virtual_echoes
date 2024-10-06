uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uTargetColorA;
uniform vec3 uTargetColorB;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

#include ../../includes/random2D.glsl

void main()
{
    vec2 gridDensity = vec2(28.0, 16.0);

    vec2 gridPos = fract(vUv * gridDensity);

    vec3 colorA = uColorA;
    vec3 colorB = uColorB;

    float lineWidth = 0.025;

    // float randomValue = step(0.5, random2D(vPosition.xz)); // 0 or 1

    float mixValue = 0.0;

    // if (randomValue == 0.0) {
    //     mixValue = smoothstep(0.0, 0.5, (uTime)); // Color change in 0.5s
    // }
    // else {
    //     mixValue = smoothstep(0.3, , (uTime)); // Some delay 1s then begin to change
    // }

    mixValue = smoothstep(0.0, 1.0, (uTime)); 

    colorA = mix(uColorA, uTargetColorA, mixValue);
    colorB = mix(uColorB, uTargetColorB, mixValue);


    if (gridPos.x < lineWidth || gridPos.y < lineWidth) 
    {
        csm_DiffuseColor.rgb = vec3(colorB);  
    } 
    else {
        csm_DiffuseColor.rgb = vec3(colorA);
    }
}