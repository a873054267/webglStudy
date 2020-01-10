// LightedCube.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +  //顶点位置
  'attribute vec4 a_Color;\n' +    //顶点颜色--外部传入，
  'attribute vec4 a_Normal;\n' +        // 归一化的面法向量值
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +     // 光线颜色
  'uniform vec3 u_LightDirection;\n' + // 归一化的光源方向
  'varying vec4 v_Color;\n' +    //片元颜色，由顶点颜色赋值
  'void main() {\n' +
    //顶点位置--视图模型矩阵*位置
  '  gl_Position = u_MvpMatrix * a_Position ;\n' +
  // 归一化 源代码为normalize(a_Normal.xyz)，
    // 但传入的已经是归一化的，没必要再次归一化计算--书籍解释没必要省略这一步
  '  vec3 normal = (a_Normal.xyz);\n' +
  // 光线方向和面法向量的点积,
    // 取max操作是不不确定光源入射的方向是正面还是反面，如果是在反面则小于0，实际上正面不能看到颜色，则取0
    // 内部就是光源方向*面法向量
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  // 计算反射光的颜色=光源颜色*基底面颜色*(光线方向和面法向量的点积)
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    //为diffuse添加第四维分量，源代码是a_Color.a实质也是1，但不易理解
  '  v_Color = vec4(diffuse, 1.0);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
    //获取canvas元素
    var canvas = document.getElementById('webgl');
    //获取webgl绘图上下文
    var  gl = canvas.getContext("experimental-webgl");
    //初始化着色器
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

  // 初始化顶点坐标，颜色，并归一化
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // 清除颜色并开启深度测试
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // 获取
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  //获取光源颜色
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  //获取光源方向
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) {
    console.log('Failed to get the storage location');
    return;
  }

  // 设置光源颜色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // 设置光源方向
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  //光源方向归一化
  lightDirection.normalize();     // Normalize
    //赋值光源方向--相比点光源来说，平行光光源方向固定
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // 初始化模型视图投影矩阵
  var mvpMatrix = new Matrix4();    // Model view projection matrix
    //设置透视投影角度
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  //设置视图矩阵
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  // 将模型视图矩阵赋值给变量
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // 清空颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
    //顶点列表
  var vertices = new Float32Array([   // Coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

//颜色索引列表
  var colors = new Float32Array([    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 ]);

//归一化面法向量列表
  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // 顶点索引列表
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

    //顶点着色器 执行顺序是逐顶点，因此缓冲区内现存的顶点位置，颜色，法向量作为渲染依据
  // 分配顶点坐标
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  //分配颜色
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  //分配归一化法向量
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // 创建缓冲区
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // 绑定缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //写入数据
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 获取变量地址
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  //分配策略
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 启用分配
  gl.enableVertexAttribArray(a_attribute);
    //释放缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
