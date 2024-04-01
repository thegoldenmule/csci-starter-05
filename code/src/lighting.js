export const Types = {
  Ambient: 'ambient',
  Directional: 'directional',
  Positional: 'positional',
};

export const ambient = ({
  color = [1, 1, 1],
  intensity = 0.1,
}) => ({ type: Types.Ambient, color, intensity });

export const directional = ({
  color = [1, 1, 1],
  intensity = 0.5,
  direction = [0, 0, -1],
}) => ({ type: Types.Directional, color, intensity, direction });

export const positional = ({
  color = [1, 1, 1],
  intensity = 0.8,
  position = [0, 0, 0],
}) => ({ type: Types.Positional, color, intensity, position, });

export const prepare = (gl, program, lights) => {

  // prepare lighting information
  const ambient = [0, 0, 0];

  let lightCount = 0;
  const positions = [];
  const colors = [];

  for (let i = 0, len = lights.length; i < len; i++) {
    const { type, position, direction, color, intensity, } = lights[i];

    switch (type) {
      case Types.Ambient: {
        ambient[0] += color[0] * intensity;
        ambient[1] += color[1] * intensity;
        ambient[2] += color[2] * intensity;
        break;
      }
      case Types.Positional: {
        lightCount += 1;

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
