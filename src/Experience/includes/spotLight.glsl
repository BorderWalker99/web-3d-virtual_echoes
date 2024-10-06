vec3 spotLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay, float spotAngle, float spotPenumbra)
{
    if (gl_FrontFacing == false)
    {
        normal = - normal;
    }

    vec3 lightDelta = lightPosition - position;
    float lightDistance = length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection = reflect(- lightDirection, normal);

    // Shading
    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading);

    // Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);

    // Decay
    float decay = max(0.0, 1.0 - lightDistance * lightDecay);

    // Spot effect
    float spotEffect = dot(lightDirection, normalize(-lightPosition));
    float spotFactor = smoothstep(spotAngle, spotAngle - spotPenumbra, spotEffect);

    return lightColor * lightIntensity * decay * spotFactor * (shading + specular);
}