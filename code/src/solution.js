
import geo from "./geo.js";
import { ambient, positional, prepare } from "./lighting.js";
import { create } from "./node.js";
import { loadShader } from "./shaders.js";
import { loadTextureAsync } from "./textures.js";
import { calculateNormals, calculateNormalsAveraged } from "./util.js";

/** @type {WebGLRenderingContext} */
let gl;

const { mat4, vec2, vec3, quat } = glMatrix;
const clearColor = {
  r: 25/255,
  g: 25/255,
  b: 25/255,
};
const programs = {};
const scene = [];
const lights = [];

window.init = async (canvas) => {
  // context
  gl = canvas.getContext('webgl2');
  gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1.0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
  // depth
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.clearDepth(100);

  // alpha
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // interpolative blending
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive blending
  //gl.blendFunc(gl.DST_COLOR, gl.ZERO); // multiplicative blending

  // culling
  //gl.enable(gl.FACE_CULLING);

  // shaders
  programs.default = await loadShader(gl, {
    uniforms: [{ key: 'uScroll', name: 'uScroll' }],
  });

  const empty = create(gl);
  empty.acc = 0;
  empty.update = (dt) => {
    const speed = 0.01;
    empty.acc += dt * speed;

    const angle = empty.acc % 360;
    empty.rotation = quat.fromEuler(
      empty.rotation,
      0, angle, 0);
  };
  scene.push(empty);

  const { indices, vertices, uvs, colors, } = geo.sphere();
  const normals = calculateNormalsAveraged(vertices, indices);
  const size = 1.5;
  const sphere = create(gl, {
    program: programs.default,
    indices, vertices, uvs,
    normals, colors,
    position: vec3.fromValues(3, 0, 0),
    scale: vec3.fromValues(size, size, size),
  });
  sphere.textures.diffuse = await loadTextureAsync(gl,
    {
      path: 'assets/texture.png',
    });
  sphere.acc = 0;
  sphere.update = (dt) => {
    sphere.acc += dt * 0.05;
    const angle = sphere.acc % 360;
    sphere.rotation = quat.fromEuler(
      sphere.rotation,
      0, angle, 0);
  };
  empty.children.push(sphere);

  // lights
  lights.push(ambient({
    color: [1, 1, 1],
    intensity: 0.2,
  }))

  let acc = 0;
  const light1 = positional({
    color: [0, 1, 0],
    position: [0, 0, 0],
    update: (dt, light) => {
      acc += 0.005 * dt;

      light.intensity = 3.75 + 0.25 * Math.sin(acc);
    },
  });
  lights.push(light1);

  const light2 = positional({
    color: [1, 0, 0],
    position: [0, 0, 3],
    intensity: 3,
    update: (dt, light) => {
      acc += 0.005 * dt;

      //light.intensity = 0.75 + 0.25 * Math.sin(acc);
    },
  });
  lights.push(light2);
};

window.loop = (dt, canvas) => {
  const { width, height } = canvas;

  // clear
  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // setup matrices
  const P = mat4.perspective(mat4.create(),
    45 * (Math.PI / 180),
    width / height,
    0.1, 10000);

  const V = mat4.identity(mat4.create());
  mat4.translate(V, V, [0, 0, -10]);
  mat4.rotateX(V, V, 0.05 * Math.PI);

  // draw roots
  for (const node of scene) {
    drawGraph(node, null, dt, P, V);
  }
};

const drawGraph = (node, parent, dt, P, V) => {
  const { program, update, updateTransform, draw, children, } = node;
  if (update) {
    update(dt);
  }

  updateTransform({ parent, });

  if (program) {
    const { uniforms, } = program;
    gl.useProgram(program);
    {
      gl.uniformMatrix4fv(uniforms.P, false, P);

      // lighting
      prepare(gl, program, dt, V, lights);

      draw({ program, parent, V });
    }
  }

  // draw children
  for (const child of children) {
    drawGraph(child, node, dt, P, V);
  }
};
