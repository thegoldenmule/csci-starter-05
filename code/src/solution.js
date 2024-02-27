
import geo from "./geo.js";
import { create } from "./node.js";
import { loadShader } from "./shaders.js";
import { loadTextureAsync } from "./textures.js";

/** @type {WebGLRenderingContext} */
let gl;

const { mat4, vec3, quat } = glMatrix;
const clearColor = {
  r: 25/255,
  g: 25/255,
  b: 25/255,
};
const programs = {};
const scene = [];

window.init = async (canvas) => {
  // context
  gl = canvas.getContext('webgl2');
  gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // shaders
  programs.default = await loadShader(gl, {
    //
  });

  const plane = create(gl, {
    program: programs.default,
    ...geo.quad(),
    rotation: quat.fromEuler(quat.create(), -90, 0, 0),
    scale: vec3.fromValues(1, 1, 1),
    attributes: [
      { key: 'diffuse', name: 'aTextureCoord' },
    ],
  });

  const texture = await loadTextureAsync(gl,
  {
    path: 'assets/ss-wyvern.png',
  });
  console.log('Loaded!');

  plane.textures.diffuse = texture;

  const def = {
    rows: 8,
    cols: 8,
  };

  const updateUvs = (row, col) => {
    const uvs = plane.geo.uvs;

    const u_width = 1 / def.cols;
    const v_height = 1 / def.rows;

    const u = col * u_width;
    const v = row * v_height;

    /**
      1, 1,
      0, 1,
      0, 0,
      1, 0,
    */
    uvs[0] = u + u_width; uvs[1] = v + v_height;
    uvs[2] = u; uvs[3] = v + v_height;
    uvs[4] = u; uvs[5] = v;
    uvs[6] = u + u_width; uvs[7] = v;

    plane.geo.dirty.uvs = true;
  };

  plane.update = (dt) => {
    const nowMs = Date.now();
    const animationSpeedMs = 800;
    const msPerFrame = animationSpeedMs / def.cols;

    const i = Math.floor((nowMs / msPerFrame) % def.cols);
    const j = 0;
    updateUvs(j, i);
  };

  updateUvs(0, 0);

  scene.push(plane);
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
  mat4.translate(V, V, [0, 0, -3]);
  mat4.rotateX(V, V, 0.05 * Math.PI);

  // draw roots
  for (const node of scene) {
    drawGraph(node, null, dt, P, V);
  }
};

const drawGraph = (node, parent, dt, P, V) => {
  const { program, update, draw, children, } = node;
  if (update) {
    update(dt);
  }

  if (program) {
    const { uniforms, } = program;
    gl.useProgram(program);
    {
      gl.uniformMatrix4fv(uniforms.P, false, P);

      draw({ program, parent, V });
    }
  }

  // draw children
  for (const child of children) {
    drawGraph(child, node, dt, P, V);
  }
};
