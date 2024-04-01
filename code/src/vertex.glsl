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

void main(void) {
  vColor = aVertexColor;
  vTextureCoord = aTextureCoord;

  // position
  vec3 v = aVertexPosition;
  gl_Position = uProjectionMatrix
    * uModelViewMatrix
    * vec4(v, 1.0);

  // normal
  vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
}
