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

uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
uniform bool u_IsLighting;

void main() {
  if (u_IsLighting) {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    float nDotL = max(dot(lightDirection, normal), 0.0);

    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
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

varying vec4 v_Color;
varying vec3 v_Normal;
varying vec3 v_Position;

uniform mat4 u_ModelMatrix;
uniform mat4 u_MVPMatrix;
uniform mat4 u_NormalMatrix;

void main() {
  gl_Position = u_MVPMatrix * a_Position;

  v_Color = a_Color;
  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
  v_Position = vec3(u_ModelMatrix * a_Position);
}
`;

// --------------- Shapes you can use in the scene

class Shape {
  constructor(position, size, colour) {
    this._position = position;
    this._size = size;
    this._colour = colour;
    this._children = [];
  }

  getModelMatrix() {
    let matrix = new Matrix4();
    
    matrix.translate(this._position[0], this._position[1], this._position[2]);
    matrix.scale(this._size[0], this._size[1], this._size[2]);
    
    return matrix;
  }
}

class Cube extends Shape {
  constructor(position, size, colour) {
    super(position, size, colour);
  }

  _verticies() {
    return new Float32Array([
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
     -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
     -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ])
  };

  _normals() {
    return new Float32Array([
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
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

  draw(scene, modelMatrix) {
    const thisNodeModelMatrix = this.getModelMatrix().multiply(modelMatrix);

    scene._drawElements(
      thisNodeModelMatrix, 
      this._verticies(), 
      this._indicies(),
      this._normals(),
      this._colour);
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

const _initUniformBoolean = (gl, uniformId, value) => {
  const uniformHandle = _getUniformHandle(gl, uniformId);

  gl.uniform1i(uniformHandle, value);
}

const _initUniformVec3 = (gl, uniformId, value) => {
  const uniformHandle = _getUniformHandle(gl, uniformId);

  gl.uniform3f(uniformHandle, value[0], value[1], value[2]);
}

// --------------- Scene object

const _createProjectionMatrix = (aspectRatio) => {
  const projectionMatrix = new Matrix4();
  projectionMatrix.setPerspective(30, aspectRatio, 1, 100);
  return projectionMatrix;
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

    this._cameraPos = [0, 0, 15];
    this._lookAt = [0, 0, -100];

    // For now we're only going to support a single point light.
    this._lightPosition = [-1, 1, 3];
    this._lightColour = [0.6, 0.6, 0.6];

    this._ambientLight = [0.2, 0.2, 0.2];

    this._gl = _createWebGLContext(canvas);
    this._projectionMatrix = _createProjectionMatrix(canvas.width / canvas.height);
    this._nodes = [];

    const gl = this._gl;

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_DEPTH_BUFFER | gl.DEPTH_BUFFER_BIT);
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

  addNode(node) {
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
    
    _initUniformBoolean(this._gl, 'u_IsLighting', useLighting);

    if (!useLighting) { return; }

    const normalMatrix = _calculateNormalMatrix(modelMatrix);

    _initUniformMat4(this._gl, 'u_NormalMatrix', normalMatrix);
    _initUniformMat4(this._gl, 'u_ModelMatrix', modelMatrix);

    _initUniformVec3(this._gl, 'u_LightColor', this._lightColour);
    _initUniformVec3(this._gl, 'u_LightPosition', this._lightPosition);
    _initUniformVec3(this._gl, 'u_AmbientLight', this._ambientLight);
  }

  _drawElements(modelMatrix, verticies, indicies, normals, colour) {
    const gl = this._gl;
    
    const colours = _repeatVector(colour, verticies.length/3);

    _initArrayBuffer(gl, 'a_Position', verticies, 3);
    _initArrayBuffer(gl, 'a_Color', colours, 3);
    _initArrayBuffer(gl, 'a_Normal', normals, 3);

    _initIndiciesBuffer(gl, indicies);

    this._initMVPMatrix(modelMatrix);
    this._initaliseLighting(modelMatrix);

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