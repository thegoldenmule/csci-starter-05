#version 300 es
precision highp float;

uniform sampler2D uDiffuse;
uniform vec2 uScroll;

in vec3 vColor;
in vec3 vNormal;
in vec2 vTextureCoord;
in vec3 vEyeVector;

out vec4 fragColor;

// lighting
const int MAX_LIGHTS = 10;
uniform highp int uLightsCount;
uniform vec3 uLightsAmbient;
uniform vec3 uLightsColor[MAX_LIGHTS];
in vec4 vLightsRay[MAX_LIGHTS];

void main(void) {
  vec3 ambientComponent = uLightsAmbient;

  vec3 light = vec3(0.0);
  vec3 eyeVector = normalize(vEyeVector);
  for (int i = 0; i < uLightsCount; i++) {
    vec3 lightDirection = normalize(vLightsRay[i].xyz);
    vec3 lightColor = uLightsColor[i];

    vec3 diffuseComponent = lightColor * max(
      0.0,
      dot(vNormal, lightDirection));

    vec3 reflectionVector = reflect(-lightDirection, vNormal);
    vec3 specularColor = uLightsColor[i];
    vec3 specularComponent = specularColor * pow(max(0.0, dot(reflectionVector, eyeVector)), 16.0);

    vec3 sublight = ambientComponent + diffuseComponent + specularComponent;
    light += sublight;
  }
  
  vec3 tex = texture(uDiffuse, vTextureCoord).rgb;

  fragColor = vec4(
    light * tex,
    1.0);
}
