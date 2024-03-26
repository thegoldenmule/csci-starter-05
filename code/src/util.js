
const { vec3, } = glMatrix;

export const calculateNormals = (vertices, indices) => {
  const normals = new Array(vertices.length);
  for (let i = 0; i < indices.length; i += 3) {
    const vai = indices[i] * 3;
    const vbi = indices[i + 1] * 3;
    const vci = indices[i + 2] * 3;

    const [ax, ay, az] = vertices.slice(vai, vai + 3);
    const [bx, by, bz] = vertices.slice(vbi, vbi + 3);
    const [cx, cy, cz] = vertices.slice(vci, vci + 3);

    const [abx, aby, abz] = [bx - ax, by - ay, bz - az];
    const [acx, acy, acz] = [cx - ax, cy - ay, cz - az];

    const n = vec3.cross(
      vec3.create(),
      [abx, aby, abz],
      [acx, acy, acz],
    );
    vec3.normalize(n, n);

    normals[vai] = n[0]; normals[vai + 1] = n[1]; normals[vai + 2] = n[2];
    normals[vbi] = n[0]; normals[vbi + 1] = n[1]; normals[vbi + 2] = n[2];
    normals[vci] = n[0]; normals[vci + 1] = n[1]; normals[vci + 2] = n[2];
  }

  return normals;
};
