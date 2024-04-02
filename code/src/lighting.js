const { mat4, vec3, quat } = glMatrix;

export const Types = {
  Ambient: 'ambient',
  Directional: 'directional',
  Positional: 'positional',
};

const scale = vec3.fromValues(1, 1, 1);

const create = ({
  type, update, direction, color, intensity,
  position = vec3.create(),
  rotation = quat.create(), }) => {
  const M = mat4.create();
  const MV = mat4.create();
  
  const light = {
    type, direction, color, intensity, position, rotation,
    children: [],
    _MV: MV,
    update: (params) => {
      const { dt, V, parent, } = params;

      // update transform
      mat4.fromRotationTranslationScale(
        M,
        light.rotation,
        light.position,
        scale,
      );

      if (parent) {
        mat4.multiply(M, parent.transform, M);
      }

      mat4.multiply(MV, V, M);

      if (update) {
        update(dt, light);
      }

      return MV;
    },
  };

  return light;
};

export const ambient = ({
  color = [1, 1, 1],
  intensity = 0.1,
  update,
}) => create({ type: Types.Ambient, update, color, intensity });

export const directional = ({
  color = [1, 1, 1],
  intensity = 0.5,
  direction = [0, 0, -1],
  update,
}) => create({ type: Types.Directional, update, color, intensity, direction });

export const positional = ({
  color = [1, 1, 1],
  intensity = 0.8,
  position = [0, 0, 0],
  update,
}) => create({ type: Types.Positional, update, color, intensity, position });

export const prepare = (gl, program, dt, V, lights) => {

  // prepare lighting information
  const ambient = [0, 0, 0];

  let lightCount = 0;
  const positions = [];
  const colors = [];

  for (let i = 0, len = lights.length; i < len; i++) {
    const light = lights[i];
    const MV = light.update({ dt, V, parent: null, });

    const { type, position: pBefore, direction, color, intensity, } = light;
    const position = vec3.transformMat4(vec3.create(), pBefore, MV);

    switch (type) {
      case Types.Ambient: {
        ambient[0] += color[0] * intensity;
        ambient[1] += color[1] * intensity;
        ambient[2] += color[2] * intensity;
        break;
      }
      case Types.Positional: {
        lightCount += 1;

        // multiply

        positions.push(
          position[0],
          position[1],
          position[2],
          0);
        colors.push(
          color[0] * intensity,
          color[1] * intensity,
          color[2] * intensity);
        break;
      }
      case Types.Directional: {
        lightCount += 1;

        positions.push(
          direction[0],
          direction[1],
          direction[2],
          1);
        colors.push(
          color[0] * intensity,
          color[1] * intensity,
          color[2] * intensity);
        break;
      }
      default: {
        throw new Error(`Unknown light type: ${type}.`);
      }
    }
  }

  // set uniforms
  gl.uniform3fv(program.uniforms.LightsAmbient, ambient);
  gl.uniform1i(program.uniforms.LightsCount, lightCount);
  gl.uniform4fv(program.uniforms.LightsPosition, positions);
  gl.uniform3fv(program.uniforms.LightsColor, colors);
};
