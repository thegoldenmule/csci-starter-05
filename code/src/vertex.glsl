#version 300 es
precision highp float;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec3 aVertexPosition;
in vec3 aVertexColor;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

out vec3 vColor;
out vec3 vNormal;
out vec2 vTextureCoord;
out vec3 vEyeVector;
out vec4 vPosition;

// lighting
const int MAX_LIGHTS = 10;
uniform highp int uLightsCount;
uniform vec4 uLightsPosition[MAX_LIGHTS];

out vec4 vLightsRay[MAX_LIGHTS];

void main(void) {
  vColor = aVertexColor;
  vTextureCoord = aTextureCoord;

  vec4 v = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  vEyeVector = -v.xyz;

  for (int i = 0; i < uLightsCount; i++) {
    vec4 lightPosition = vec4(
      uLightsPosition[i].xyz, 1.0);
    vLightsRay[i] = vec4(
      (v - lightPosition).xyz,
      uLightsPosition[i].w);
  }

  gl_Position = uProjectionMatrix * v;
}
