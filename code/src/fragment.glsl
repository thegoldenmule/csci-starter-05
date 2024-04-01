#version 300 es
precision mediump float;

uniform sampler2D uDiffuse;
uniform vec2 uScroll;

in vec3 vColor;
in vec3 vNormal;
in vec2 vTextureCoord;
in vec3 vEyeVector;

out vec4 fragColor;

// lighting
const int MAX_LIGHTS = 10;
uniform int uLightsCount;
uniform vec3 uLightsPosition[MAX_LIGHTS];
uniform vec4 uLightsAmbient[MAX_LIGHTS];
uniform vec4 uLightsDiffuse[MAX_LIGHTS];
uniform vec4 uLightsSpecular[MAX_LIGHTS];

void main(void) {
  vec3 ambientColor = vec3(0.5, 0.5, 0);
  float ambientIntensity = 0.5;
  vec3 ambientComponent = ambientColor * ambientIntensity;

  vec3 posLightDirection = normalize(vec3(-1, 0.25, 1));
  vec3 posLightColor = vec3(1, 1, 1);
  float posLightIntensity = 0.8;
  vec3 posLightComponent = posLightColor * posLightIntensity * max(0.0, dot(vNormal, posLightDirection));

  vec3 eyeVector = normalize(vEyeVector);
  vec3 reflectionVector = reflect(-posLightDirection, vNormal);
  vec3 specularColor = vec3(1, 1, 1);
  float specularIntensity = 0.5;
  vec3 specularComponent = specularColor * specularIntensity * pow(max(0.0, dot(reflectionVector, eyeVector)), 16.0);

  vec3 color = ambientComponent + posLightComponent + specularComponent;
  fragColor = vec4(color, 1.0);
}
