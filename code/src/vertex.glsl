#version 300 es
precision mediump float;

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

void main(void) {
  vColor = aVertexColor;
  vTextureCoord = aTextureCoord;

  vec4 v = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
  vEyeVector = -v.xyz;

  gl_Position = uProjectionMatrix * v;
}
