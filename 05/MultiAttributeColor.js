// MultiAttributeColor.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' + // varying variable
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = 10.0;\n' +
    '  v_Color = a_Color;\n' +  // Pass the data to the fragment shader
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' + // Precision qualifier (See Chapter 6)
    'varying vec4 v_Color;\n' +    // Receive the data from the vertex shader
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    var canvas = document.getElementById('webgl');
    //获取webgl绘图上下文
    var  gl = canvas.getContext("experimental-webgl");
    //初始化着色器
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }



    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw three points
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // Vertex coordinates and color
        0.0,  0.5,  1.0,  0.0,  0.0,
        -0.5, -0.5,  0.0,  1.0,  0.0,
        0.5, -0.5,  0.0,  0.0,  1.0,
    ]);
    var n = 3; // The number of vertices

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    // 创建缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    //绑定数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //获取顶点变量地址
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    //分配顶点变量，每次取两个
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // 获取颜色变量地址--顶点着色器中
    //顶点着色器与片元着色器中均声明了v_Color ，
    // 对顶点颜色进行赋值并在main函数中将片元颜色也赋值
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

    return n;
}
