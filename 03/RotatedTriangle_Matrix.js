var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_xformMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_xformMatrix * a_Position;\n' +
    '}\n';

var FSHADER_SOURCE=
    'void main(){\n' +
    'gl_FragColor=vec4(1.0,0.0,0.0,1.0);\n' +
    '}\n';
function initVertexBuffers(gl) {
    //创建顶点数组
    var vertices=new Float32Array([
        0,0.5,   -0.5,-0.5,   0.5,-0.5
    ])

    var n=3
    //创建缓冲区
    var vertexBuffer=gl.createBuffer()
    //绑定缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer)
    //将数据写入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)
    //获取顶点着色器中位置变量地址
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //分配顶点策略
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0)
    //开启分配
    gl.enableVertexAttribArray(a_Position)
    return n

}
// The translation distance for x, y, and z direction
var ANGLE = 80.0;

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

    //初始化缓冲区
    var n = initVertexBuffers(gl);

    // 随机生成旋转角度
    var radian = Math.PI * ANGLE / 180.0; // Convert to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);


    // 旋转矩阵，列主序
    var xformMatrix = new Float32Array([
        cosB, sinB, 0.0, 0.0,
        -sinB, cosB, 0.0, 0.0,
        0.0,  0.0, 1.0, 0.0,
        0.0,  0.0, 0.0, 1.0
    ]);

    // 获取旋转矩阵地址
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if (!u_xformMatrix) {
        console.log('Failed to get the storage location of u_xformMatrix');
        return;
    }
    //为旋转矩阵赋值
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);



    //用指定颜色清空画布
    gl.clearColor(0, 0, 0, 1);
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    //绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, n);




}

