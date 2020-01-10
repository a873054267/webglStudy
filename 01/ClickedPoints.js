// ClickedPints.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var  gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }


    // // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = []; // The array for the position of a mouse press
function click(ev, gl, canvas, a_Position) {
    /***
     * x 事件发生点当前文档横坐标
     * y 事件发生点当前文档纵坐标
     * target 事件发生的目标元素---最先触发的那一层
     * getBoundingClientRect
     * 事件发生节点元素的DOMRect对象，除去宽高外，都是相对于左上角的值
     */
  var x = ev.clientX; // 在body中x的坐标
  var y = ev.clientY; // 在body中y的坐标
  var rect = ev.target.getBoundingClientRect() ;
    /***************
     * x - rect.left代表鼠标点击位置在canvas元素上的坐标
     * 由于webgl坐标原点在canvas元素的中间，因此，要先减去一半的canvas长度，
     * 再除canvas长度的一半即可得到绘制点在webgl坐标系中的坐标
     * 简单一点，将canvas的宽高看做2，就容易理解了
     * 最后除canvas的宽度相当于归一化
     * @type {number}
     */
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  // Store the coordinates to g_points array
  g_points.push(x); g_points.push(y);

  //Clear <canvas>

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  console.log(len)
  for(var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    //绘制该点完成后，再绘制下一个点，那么该点不是会被清空吗？
  }
}
