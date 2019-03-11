/**
* Poor mans graphics library.
* Used to simply abstract away from WebGL so I can feel sane again.
*/

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoords;

uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
uniform bool u_IsLighting;
uniform bool u_UseTextures;
uniform sampler2D u_Sampler;

void main() {
  if (u_IsLighting) {
    // Compute directional lighting
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    float nDotL = max(dot(lightDirection, normal), 0.0);

    vec3 diffuse;
    if (u_UseTextures) {
      vec4 TexColor = texture2D(u_Sampler, v_TexCoords);

      diffuse = u_LightColor * TexColor.rgb * v_Color.rgb * nDotL;
    } else {
      diffuse = u_LightColor * v_Color.rgb * nDotL;
    }

    vec3 ambient = u_AmbientLight * v_Color.rgb;
    
    gl_FragColor = vec4(diffuse + ambient, v_Color.a); 
  } 
  else 
  {
    gl_FragColor = v_Color;
  }
}
`;

const VERTEX_SHADER = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
attribute vec2 a_TexCoords;

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoords;

uniform mat4 u_ModelMatrix;
uniform mat4 u_MVPMatrix;
uniform mat4 u_NormalMatrix;

void main() {
  gl_Position = u_MVPMatrix * a_Position;

  v_Color = a_Color;
  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
  v_Position = vec3(u_ModelMatrix * a_Position); 
  v_TexCoords = a_TexCoords;
}
`;

// --------------- Shapes you can use in the scene
const checkLen = (arg, length) => {
  if (arg.length !== length) {
    throw new Error("argument length error, expected " + length);
  }
}

const _copyMatrix = (matrix) => (new Matrix4()).set(matrix);

const _drawElements = (scene, shape, hierachicalMatrix) => {
  const thisNodeHierachicalMatrix = hierachicalMatrix.multiply(shape.getHierachalMatrix());
  const thisNodeModelMatrix = _copyMatrix(thisNodeHierachicalMatrix).multiply(shape.getSizeMatrix());
  
  scene._drawElements(
    thisNodeModelMatrix, 
    shape._verticies(), 
    shape._indicies(),
    shape._normals(),
    shape._colour,
    {uri: shape._texture, coords: shape._textureCoords()});
    
  return thisNodeHierachicalMatrix;
};

class Shape {
  constructor(position, size, colour, texture) {
    checkLen(position, 3);
    checkLen(size, 3);
    checkLen(colour, 3);

    this._position = position;
    this._size = size;
    this._colour = colour;
    this._rotation = [0, 0, 0];
    this._texture = texture || '';

    this._children = [];
  }

  rotate(x, y, z) {
    this._rotation = [
      (this._rotation[0] + x) % 360,
      (this._rotation[1] + y) % 360,
      (this._rotation[2] + z) % 360,
    ]
  }

  texture(textureUri, multiplierX, multiplierY) {
    this._texture = textureUri;
    this._txMultX = multiplierX || 1;
    this._txMultY = multiplierY || 1;
  }

  add(node) {
    this._children.push(node);
  }

  getHierachalMatrix() {
    let matrix = new Matrix4();

    return matrix
      .rotate(this._rotation[1], 0, 1, 0)
      .rotate(this._rotation[2], 0, 0, 1)  
      .rotate(this._rotation[0], 1, 0, 0)
      .translate(this._position[0], this._position[1], this._position[2]);
  }

  getSizeMatrix() {
    return (new Matrix4()).setScale(this._size[0], this._size[1], this._size[2]);
  }
  
  draw(scene, hierachicalMatrix) {
    this._children.forEach(node => node.draw(scene, _copyMatrix(hierachicalMatrix)));
  }
}

class Cube extends Shape {
  constructor(position, size, colour, texture) {
    super(position, size, colour, texture);
  }

  _name() {
    return "Cube";
  }

  _verticies() {
    return new Float32Array([
      0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
      0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
      0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
     -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
     -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
      0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
    ])
  };

  _normals() {
    return new Float32Array([
      0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,  // v0-v1-v2-v3 front
      0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,  // v0-v5-v6-v1 up
     -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5   // v4-v7-v6-v5 back
    ]);
  }

  _indicies() {
    return new Uint8Array([
      0, 1, 2,   0, 2, 3,     // front
      4, 5, 6,   4, 6, 7,     // right
      8, 9,10,   8,10,11,     // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);
  }

  _textureCoords() {
    const x = this._txMultX;
    const y = this._txMultY;
    // In order to get repeating texture you need to extrapolate the texture coordinate system
    // beyond (1, 1) hence this multiplier.
    return new Float32Array([
      x, y,    0.0, y,   0.0, 0.0,   x, 0.0,  // v0-v1-v2-v3 front
      0.0, y,    0.0, 0.0,   x, 0.0,   x, y,  // v0-v3-v4-v5 right
      x, 0.0,    x, y,   0.0, y,   0.0, 0.0,  // v0-v5-v6-v1 up
      x, y,    0.0, y,   0.0, 0.0,   x, 0.0,  // v1-v6-v7-v2 left
      0.0, 0.0,    x, 0.0,   x, y,   0.0, y,  // v7-v4-v3-v2 down
      0.0, 0.0,    x, 0.0,   x, y,   0.0, y   // v4-v7-v6-v5 back
    ]);
  }

  draw(scene, hierachicalMatrix) {
    const newHierachicalMatrix = _drawElements(scene, this, hierachicalMatrix);
    
    super.draw(scene, newHierachicalMatrix);
  }
}

class Prism extends Shape {
  constructor(position, size, colour, texture) {
    super(position, size, colour, texture);
  }

  // reference diagram: prism.jpg
  // v1-v2-v3
  // v1-v3-v4-v5
  // v1-v2-v6-v5
  // v2-v3-v4-v6
  // v5-v6-v4

  _name() {
    return "Prism";
  }

  _verticies() {
    return new Float32Array([
      -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, 0.5, 0.5, // v1-v2-v3
      -0.5, -0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, -0.5,  -0.5, -0.5, -0.5, // v1-v3-v4-v5
      -0.5, -0.5, 0.5,  0.5, -0.5, 0.5, 0.5, -0.5, -0.5,  -0.5, -0.5, -0.5, // v1-v2-v6-v5
      0.5, -0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, -0.5,  0.5, -0.5, -0.5, // v2-v3-v4-v6
      -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, 0.5, -0.5 // v5-v6-v4
    ]);
  }

  _normals() {
    return new Float32Array([
        0, 0, 1,  0, 0, 1,  0, 0, 1,
        -1, 1, 0,  -1, 1, 0,  -1, 1, 0,  -1, 1, 0,
        0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        0, 0, -1,  0, 0, -1,  0, 0, -1
    ]);
  }

  _indicies() {
    return new Uint8Array([
      0, 1, 2, 
      3, 4, 5,   3, 5, 6,
      7, 8, 9,   7, 9, 10,
      11, 12, 13, 11, 13, 14,
      15, 16, 17  
    ]);
  }

  _textureCoords() {
    const x = this._txMultX;
    const y = this._txMultY;

    return new Float32Array([
      0, 0,  x, 0,  x, y,
      x, 0,  x, y,  0, y,  0, 0,
      x, 0,  x, y,  0, y,  0, 0,
      x, 0,  x, y,  0, y,  0, 0,
      0, 0,  x, 0,  x, y
    ]);
  }

  draw(scene, hierachicalMatrix) {
    const newHierachicalMatrix = _drawElements(scene, this, hierachicalMatrix);
    
    super.draw(scene, newHierachicalMatrix);
  }
}

class Axis {
    constructor(colour) {
      this.colour = colour;
    }

    _verticies() {
      return new Float32Array([
        -20.0, 0.0,  0.0,
         20.0, 0.0,  0.0,
         0.0,  20.0, 0.0,
         0.0, -20.0, 0.0,
         0.0, 0.0,  -20.0,
         0.0, 0.0,   20.0
      ]);
    }

    draw(scene, modelMatrix) {
      scene._drawLines(
        modelMatrix, 
        this._verticies(),
        this.colour
      )
    }
}

// --------------- WebGL Helper Functions

const _createWebGLContext = (canvas) => {
  const context = getWebGLContext(canvas);
  
  if (context === -1) {
    throw new Error('cannot find canvas');
  }

  if (!initShaders(context, VERTEX_SHADER, FRAGMENT_SHADER)) {
    throw new Error('Failed to initalise shaders');
  }

  return context;
};

const _createBuffer = (gl) => {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error('Failed to create buffer.');
  }

  return buffer;
}

const _repeatVector = (vector, numOfTimes) => {
  const result = new Float32Array(numOfTimes*vector.length);

  for (let i = 0; i < numOfTimes; ++i) {
    result[i*3] = vector[0];
    result[i*3 + 1] = vector[1];
    result[i*3 + 2] = vector[2];
  }

  return result;
};

const _getAttributeHandle = (gl, attributeId) => {
  const attributeHandle = gl.getAttribLocation(gl.program, attributeId);

  if (attributeHandle === -1) {
    throw new Error('Failed to get handle ' + attributeId);
  }

  return attributeHandle;
};

const _initArrayBuffer = (gl, attributeId, data, elemsPerVal) => {
  const buffer = _createBuffer(gl);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const attributeHandle = _getAttributeHandle(gl, attributeId);

  gl.vertexAttribPointer(attributeHandle, elemsPerVal, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attributeHandle);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

const _disableArrayBuffer = (gl, attributeId) => {
  const attributeHandle = _getAttributeHandle(gl, attributeId);

  gl.disableVertexAttribArray(attributeHandle);
};

const _initIndiciesBuffer = (gl, indicies) => {
  const buffer = _createBuffer(gl);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);
};

const _getUniformHandle = (gl, uniformHandle) => {
  const handle = gl.getUniformLocation(gl.program, uniformHandle);

  if (handle < 0) {
    throw new TypeError('Failed to load uniform ' + uniformHandle);
  }
  
  return handle;
};

const _initUniformMat4 = (gl, uniformId, mat4) => {
  const uniformHandle = _getUniformHandle(gl, uniformId);
  
  gl.uniformMatrix4fv(uniformHandle, false, mat4.elements);
};

const _initUniformBit = (gl, uniformId, value) => {
  const uniformHandle = _getUniformHandle(gl, uniformId);

  gl.uniform1i(uniformHandle, value);
}

const _initUniformVec3 = (gl, uniformId, value) => {
  const uniformHandle = _getUniformHandle(gl, uniformId);

  gl.uniform3f(uniformHandle, value[0], value[1], value[2]);
}

// --------------- Texture Manager
const _loadTexture = (textureUri) => {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve({uri: textureUri, img: img, status: 'ok'});
    img.onerror = () => { throw new Error("failed to load image " + textureUri); }
    
    img.src = textureUri;
  });
};

class _TextureManager {
  constructor() {
    this._textures = {};
  }

  async loadTextures(gl, textureUris) {
    const textureLoadPromises = await Promise.all(textureUris.map(_loadTexture));
    
    textureLoadPromises.forEach(loadedTexture => {
      let glTexture = gl.createTexture();

      glTexture.image = loadedTexture.img;

      this._textures[loadedTexture.uri] = glTexture;
    });
  }

  getTexture(textureUri) {
    const texture = this._textures[textureUri];
    
    if (texture === undefined) {
      throw new Error("failed to load texture " + textureUri);
    }

    return texture;
  }
}

// --------------- Scene object

const _createProjectionMatrix = (aspectRatio) => {
  const projectionMatrix = new Matrix4();

  return projectionMatrix.setPerspective(30, aspectRatio, 1, 100);;
}

const _calculateNormalMatrix = (modelMatrix) => {
  const normalMatrix = new Matrix4();

  return normalMatrix
    .setInverseOf(modelMatrix)
    .transpose();
};

class Scene {
  constructor(canvas) {
    this._backgroundColor = [0, 0, 0];

    this._cameraPos = [0, 6, 20];
    this._lookAt = [0, 0, -10];

    // For now we're only going to support a single point light.
    this._lightPosition = [0, 6, 18];  // Temp?s
    this._lightColour = [0.6, 0.6, 0.6];
    this._ambientLight = [0.1, 0.1, 0.1];

    this._gl = _createWebGLContext(canvas);
    this._projectionMatrix = _createProjectionMatrix(canvas.width / canvas.height);

    this._nodes = [];
    this._textureManager = new _TextureManager();

    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.clear(this._gl.COLOR_DEPTH_BUFFER | this._gl.DEPTH_BUFFER_BIT);
  }

  loadTextures(textureUris) {
    this._textureManager.loadTextures(this._gl, textureUris);  
  }

  setBackgroundColor(r, g, b) {
    this._backgroundColor = [r, g, b];
  }

  changeLookAt(lookatX, lookatY, lookatZ) {
    this._lookAt = [lookatX, lookatY, lookatZ];
  }

  changeCameraPos(x, y, z) {
    this._cameraPos = [x, y, z];
  }

  add(node) {
    this._nodes.push(node);
  }

  _generateMVPMatrix(modelMatrix) {
    const mvpMatrix = new Matrix4();

    return mvpMatrix
      .multiply(this._projectionMatrix)
      .multiply(this._getViewMatrix())
      .multiply(modelMatrix);
  }

  _getViewMatrix() {
    const viewMatrix = new Matrix4();

    return viewMatrix.setLookAt(
      this._cameraPos[0], this._cameraPos[1], this._cameraPos[2], 
      this._lookAt[0], this._lookAt[1], this._lookAt[2], 
      0, 1, 0);
  }

  _initMVPMatrix(modelMatrix) {
    _initUniformMat4(this._gl, 'u_MVPMatrix', this._generateMVPMatrix(modelMatrix));
  }

  _initaliseLighting(modelMatrix) {
    const useLighting = modelMatrix !== undefined;
    
    _initUniformBit(this._gl, 'u_IsLighting', useLighting);

    if (!useLighting) { return; }

    const normalMatrix = _calculateNormalMatrix(modelMatrix);

    _initUniformMat4(this._gl, 'u_NormalMatrix', normalMatrix);
    _initUniformMat4(this._gl, 'u_ModelMatrix', modelMatrix);

    _initUniformVec3(this._gl, 'u_LightColor', this._lightColour);
    _initUniformVec3(this._gl, 'u_LightPosition', this._lightPosition);
    _initUniformVec3(this._gl, 'u_AmbientLight', this._ambientLight);
  }

  _loadTextureIntoBuffer(texture) {
    const glTexture = this._textureManager.getTexture(texture.uri);

    _initArrayBuffer(this._gl, 'a_TexCoords', texture.coords, 2);

    const gl = this._gl;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, glTexture.image);
    gl.generateMipmap(gl.TEXTURE_2D);
    // gl.bindTexture(gl.TEXTURE_2D, null);

    _initUniformBit(this._gl, 'u_Sampler', 0);

  }

  _initaliseTextures(texture) { // texture = {texture, coords}
    const hasTexture = texture.uri !== '';
    
    _initUniformBit(this._gl, 'u_UseTextures', hasTexture);

    if (hasTexture) {
      this._loadTextureIntoBuffer(texture);
    } else {
      _disableArrayBuffer(this._gl, 'a_TexCoords');
    }
  }

  _drawElements(modelMatrix, verticies, indicies, normals, colour, texture) {
    const gl = this._gl;
    
    const colours = _repeatVector(colour, verticies.length/3);
    
    _initArrayBuffer(gl, 'a_Position', verticies, 3);
    _initArrayBuffer(gl, 'a_Color', colours, 3);
    _initArrayBuffer(gl, 'a_Normal', normals, 3);

    _initIndiciesBuffer(gl, indicies);
    
    this._initMVPMatrix(modelMatrix);
    this._initaliseLighting(modelMatrix);
    this._initaliseTextures(texture);

    gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_BYTE, 0);
  }

  _drawBackgroundColor() {
    this._gl.clearColor(
      this._backgroundColor[0], 
      this._backgroundColor[1], 
      this._backgroundColor[2], 
      1.0);
    
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
  }

  _drawNodes() {
    const drawNode = node => {
      const modelMatrix = new Matrix4();

      node.draw(this, modelMatrix);
    };

    this._nodes.forEach(drawNode);
  }

  _drawLines(modelMatrix, verticies, colour) {
    const gl = this._gl;
    
    _initArrayBuffer(gl, 'a_Position', verticies, 3);
    _initArrayBuffer(gl, 'a_Color', _repeatVector(colour, 6), 3);
    
    this._initMVPMatrix(modelMatrix);
    this._initaliseLighting(undefined);
    
    gl.drawArrays(gl.LINES, 0, verticies.length/3);
  }

  draw() {
    this._drawBackgroundColor();
    this._drawNodes();
  }
}

/*
  Scene Consturctor Object
  Basically a builder pattern that reduces boilerplate when making large 3d scenes.
*/

const _createProxyObject = (rawObject) => {
  const proxyObject = {
    children: nodes => {
      proxyObject.nodes = nodes;

      return proxyObject;
    },

    id: id => {
      proxyObject._id = id;
      
      return proxyObject;
    },

    rotate: (x, y, z) => {
      rawObject.rotate(x, y, z);

      return proxyObject;
    },

    texture: (tex, multiplierX, multiplierY) => {
      multiplierY = multiplierY || multiplierX;
      rawObject.texture(tex, multiplierX, multiplierY);

      return proxyObject;
    },

    toSceneObject: (idObjects) => {
      if (proxyObject._id) {
        idObjects[proxyObject._id] = rawObject;
      }

      if (proxyObject.nodes) {
        proxyObject.nodes.forEach(node => rawObject.add(node.toSceneObject()));
      }

      return rawObject;
    }
  }

  return proxyObject;
}

const cube = (position, size, colour, texture) => _createProxyObject(new Cube(position, size, colour, texture));
const prism = (position, size, colour, texture) => _createProxyObject(new Prism(position, size, colour, texture));


const buildScene = (cavnas, nodes) => {
  const scene = new Scene(cavnas), idObjects = {};
  nodes.forEach(node => {
    scene.add(node.toSceneObject(idObjects));
  });

  return [scene, idObjects];
};
