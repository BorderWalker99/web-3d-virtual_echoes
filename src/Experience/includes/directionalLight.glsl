vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower)
{
    if (gl_FrontFacing == false)
    {
        normal = - normal;
    }
    
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(- lightDirection, normal);

    // Shading
    float shading = max(0.0, dot(normal, lightDirection));

    // Specular
    float specular = max(0.0, - dot(lightReflection, viewDirection));
    specular = pow(specular, specularPower);

    return lightColor * lightIntensity * (shading + specular);
}