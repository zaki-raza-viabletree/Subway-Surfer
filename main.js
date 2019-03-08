var cubeRotation = 0.0;
var b;
var rail1;
var r1 = [];
var r2 =[];
var r3 =[];
var brick;
var rbrick = [];
var lbrick =[];
var flag =1;
main();
var eyex,eyey,eyez,tx,ty,tz;
eyex = -4.5;
eyey=1.5;
eyez=0;
tx =ty=tz=0;
//
// Start here
//
function check(e) {
    var code = e.keyCode;
    switch (code) {
        case 37:  
                eyex -= 0.1;
                tx -= 0.1;
                console.log(eyex,eyey,eyez);
                break; //Left key
        case 38:  
                eyey += 0.1;

                console.log(eyex,eyey,eyez);
                break; //Up key
        case 39: 
                eyex += 0.1;
                tx += 0.1;
                console.log(eyex,eyey,eyez);
                break; //Right key
        case 40:  
                eyey -= 0.1;
                console.log(eyex,eyey,eyez);
                break; //Down key
        case 81: eyex = -5;
                eyey =2;
                eyez=0;
                break;//Q key
        case 75:  
                eyez -= 0.1;
                console.log(eyex,eyey,eyez);
                break; //k key
        case 76:  
                eyez += 0.1;
                console.log(eyex,eyey,eyez);
                break; //l key
        case 88: 
              flag=1;
              console.log('move');
              break;
        case 90:
              flag =0;
              console.log('stop');
              break;
        default: console.log(code); //Everything else
        
    }
}
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  window.addEventListener('keydown',this.check,false);

        
  b = new base(gl,[0,0,0],100,0.0,1.75);
  for(var i=0;i<1000;i++){
    r1[i] = new rec(gl,[-2.5+0.5*i,0.1,-1.1],0.5,0,0.5);
    r2[i] = new rec(gl,[-2.5+0.5*i,0.1, 0.0],0.5,0,0.5);
    r3[i] = new rec(gl,[-2.5+0.5*i,0.1, 1.1],0.5,0,0.5);
    rbrick[i] = new wall(gl,[-2.5+4*i,0.1,1.75],2,2,0.0);
    lbrick[i] = new wall(gl,[-2.5+4*i,0.1,-1.75],2,2,0.0);
  }
  //brick = new wall(gl,[-2.5,0.1,1.75],1.5,1.5,0.0);
    
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  
  var texture =[];
  texture[1] = loadTexture(gl, 'base.jpg');
  texture[2] = loadTexture(gl,'new_track.jpg');
  texture[3] = loadTexture(gl, 'BrickWall.jpg');

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    if(flag){
      eyex +=0.1;
    tx += 0.1;
    
    }
    drawScene(gl, programInfo,texture, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//


//
// Draw the scene.
//
function drawScene(gl, programInfo,texture,deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();
  var cameraMatrix = mat4.create();
  //mat4.tanslate(outout,input,value)
  mat4.translate(cameraMatrix, cameraMatrix, [eyex, eyey, eyez]);
  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];

  var up = [0, 1, 0];
  var target = [tx,ty,tz];
  mat4.lookAt(cameraMatrix, cameraPosition, target, up);
  var viewMatrix = cameraMatrix;
  var viewProjectionMatrix = mat4.create();

mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
  // Now move the drawing position a bit to where we want to
  // start drawing the square.

//   mat4.translate(modelViewMatrix,     // destination matrix
//                  modelViewMatrix,     // matrix to translate
//                  [2.0, 0.0, -10.0]);  // amount to translate
//   mat4.rotate(modelViewMatrix,  // destination matrix
//               modelViewMatrix,  // matrix to rotate
//               cubeRotation,     // amount to rotate in radians
//               [0, 0, 1]);       // axis to rotate around (axis)
  b.drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[1]);
  //rail1.drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[2]);
  for(var i=0;i<1000;i++){
    r1[i].drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[2]);
    r2[i].drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[2]);
    r3[i].drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[2]);
    rbrick[i].drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[3]);
    lbrick[i].drawBase(gl,viewProjectionMatrix,programInfo,deltaTime,texture[3]);
  }
  

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  
  // Update the rotation for the next draw

  //cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

