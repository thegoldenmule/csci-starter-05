
export const loadTexture = (gl, { path, callback, }) => {
  // load texture resources
  const image = new Image();
  image.onload = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    const filterMode = gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode);

    callback(texture);
  };

  image.src = path;
};

export const loadTextureAsync = (gl, { path }) => new Promise((res, _) => {
  loadTexture(gl, {
    path,
    callback: res,
  });
});
