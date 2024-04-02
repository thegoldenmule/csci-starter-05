const { vec3, quat, mat4 } = glMatrix;

export const create = (gl, {
  name = "node", program, plugins = {}, textures = {},
  position = vec3.create(),
  scale = vec3.fromValues(1, 1, 1),
  rotation = quat.create(),
  update,
  indices, vertices, uvs, colors, normals,
} = {}) => {
  const M = mat4.create();
  const MV = mat4.create();
  const K = mat4.create();
  const geo = { dirty: {} };

  let ibo;
  if (indices) {
    ibo = gl.createBuffer();

    geo.indices = new Uint16Array(indices);
    geo.dirty.indices = true;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      geo.indices,
      gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  let vbo;
  if (vertices) {
    vbo = gl.createBuffer();

    geo.vertices = new Float32Array(vertices);
    geo.dirty.vertices = true;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      geo.vertices,
      gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  let cbo;
  if (colors) {
    cbo = gl.createBuffer();

    geo.colors = new Float32Array(colors);
    geo.dirty.colors = true;
    gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      geo.colors,
      gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  let uvbo;
  if (uvs) {
    uvbo = gl.createBuffer();

    geo.uvs = new Float32Array(uvs);
    geo.dirty.uvs = true;
  }

  let nbo;
  if (normals) {
    nbo = gl.createBuffer();

    geo.normals = new Float32Array(normals);
    geo.dirty.normals = true;
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      geo.normals,
      gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  const { draw = [] } = plugins;
  const node = {
    name, program, position, rotation, scale, textures, update,
    geo,
    transform: M,
    children: [],
    updateTransform: (params) => {
      const { parent, } = params;
      mat4.fromRotationTranslationScale(
        M,
        node.rotation,
        node.position,
        node.scale,
      );

      // transform by parent
      if (parent) {
        mat4.multiply(M, parent.transform, M);
      }
    },
    draw: (params) => {
      const { program, V, } = params;

      // draw self
      if (program && vbo && ibo) {
        // prep MV matrix
        mat4.multiply(MV, V, M);
        gl.uniformMatrix4fv(program.uniforms.MV, false, MV);

        // prep K matrix
        if (nbo) {
          mat4.invert(K, MV);
          mat4.transpose(K, K);
          gl.uniformMatrix4fv(program.uniforms.K, false, K);
        }

        // attributes
        const pointer = program.attributes.position;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.vertexAttribPointer(pointer, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(pointer);

        if (nbo) {
          const pointer = program.attributes.normal;
          if (pointer !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
            gl.vertexAttribPointer(pointer, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pointer);
          }
        }

        if (cbo) {
          const pointer = program.attributes.color;
          if (pointer !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, cbo);
            gl.vertexAttribPointer(pointer, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pointer);
          }
        }

        if (uvbo) {
          const pointer = program.attributes.uv;
          if (pointer !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, uvbo);
            if (geo.dirty.uvs) {
              geo.dirty.uvs = false;
              gl.bufferData(
                gl.ARRAY_BUFFER,
                geo.uvs,
                gl.STATIC_DRAW);
            }
            
            gl.vertexAttribPointer(pointer, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pointer);
          }
        }

        // textures
        if (node.textures.diffuse && program.uniforms.Diffuse !== -1) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, node.textures.diffuse);
          gl.uniform1i(program.uniforms.Diffuse, 0);
        }

        for (const drawFn of draw) {
          drawFn();
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      }
    },
  };

  return node;
};
