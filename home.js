import * as THREE from './three.js-master/build/three.module.js'

let scene, camera, renderer
let originalBoxSize = 4;
let stack=[];
let AxisYBox = 1;
let overhangs =[];

let scoreElement = document.getElementById("score");

let initialize = () => {
    //1. Scene
    scene = new THREE.Scene()
    
    //2. Camera
    let fov = 75
    let width = window.innerWidth
    let height = window.innerHeight
    let aspect = width / height

    addLayer(0,0, originalBoxSize,originalBoxSize);

    addLayer(-10, 0,originalBoxSize,originalBoxSize, "x");

    //camera
    camera = new THREE.PerspectiveCamera(fov,aspect)
    camera.position.set(5,5,5);
    camera.lookAt(0, 0 ,0)


    //3. Renderer
    renderer = new THREE.WebGLRenderer({antialias : true})
    renderer.setSize(width, height)
    renderer.setClearColor("#FFE5B4")
    document.body.appendChild(renderer.domElement)
}


//layer Axis Y
function addLayer(x,z,width,depth,direction){
    let axisY = AxisYBox * stack.length;

    let layer = generateBox(x,axisY,z,width,depth, false);
    layer.direction = direction;
    stack.push(layer);
}

function addOverhang(x, z, width, depth){
    let axisY = AxisYBox * (stack.length -1 );
    let overhang = generateBox(x,axisY,z, width, depth, true);
    overhangs.push(overhang);
}

//For Generate Box
function generateBox(x,axisY,z,width,depth){
    let geo = new THREE.BoxGeometry(width, axisY, depth);
    let color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
    let material = new THREE.MeshPhongMaterial({color : color});

    let mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x,axisY,z);

    scene.add(mesh);

    return {
        threejs: mesh, width, depth
    };
}



let start = false;

window.addEventListener("click", () =>{
    if(!start){
        renderer.setAnimationLoop(animation);
        start = true;
        if (scoreElement) scoreElement.innerText = 0;
    }else{
        let axisYatas = stack[stack.length -1];
        let prevlayer = stack[stack.length - 2];
    
        let direction = axisYatas.direction;
    
        let delta = axisYatas.threejs.position[direction] - prevlayer.threejs.position[direction];
    
        let overhangSize = Math.abs(delta);
    
        let size = direction == "x" ? axisYatas.width : axisYatas.depth;
    
        let overlap = size - overhangSize;
    
        if(overlap > 0){
            let newWidth = direction == "x" ? overlap : axisYatas.width;
            let newDepth = direction == "z" ? overlap : axisYatas.depth;
            
            axisYatas.width = newWidth;
            axisYatas.depth = newDepth;
    
            axisYatas.threejs.scale[direction] = overlap / size;
            axisYatas.threejs.position[direction] -= delta / 2;

            let overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
            let overhangX = direction == "x" ? axisYatas.threejs.position.x + overhangShift : axisYatas.threejs.position.x;
            let overhangZ = direction == "z" ? axisYatas.threejs.position.z + overhangShift : axisYatas.threejs.position.z;
    
            let overhangWidth = direction == "x" ? overhangSize : newWidth;
            let overhandDepth = direction == "z" ? overhangSize : newDepth;

            addOverhang(overhangX, overhangZ, overhangWidth, overhandDepth);

            let nextX = direction == "x" ? axisYatas.threejs.position.x : -10;
            let nextZ = direction == "z" ? axisYatas.threejs.position.z : -10;
            let nextDirection = direction == "x" ? "z" : "x";
            if (scoreElement) scoreElement.innerText = stack.length - 1;
            addLayer(nextX,nextZ,newWidth,newDepth,nextDirection);
        }
    }
    //else{
    //     let axisYatas = stack[stack.length-1];
    //     let direction = axisYatas.direction;

    //     let nextX = direction == "x" ? 0 : -10;
    //     let nextZ = direction == "z" ? 0 : -10;
    //     let newWidth = originalBoxSize;
    //     let newDepth = originalBoxSize;
    //     let nextDirection = direction == "x" ? "z" : "x";
        
    //     addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    // }
    
});
// if(!start){
//     renderer.setAnimationLoop(animation);
//     start = true;
// }else{
//     let axisYatas = stack[stack.length-1];
//     let prevlayer = stack[stack.length-2];

//     let direction = axisYatas.direction;

//     let delta = axisYatas.threejs.position[direction] - prevlayer.threejs.position[direction];

//     let overhangSize = Math.abs(delta);

//     let size = direction == "x" ? axisYatas.width : axisYatas.depth;

//     let overlap = size - overhangSize;

//     if(overlap > 0){
//         let newWidth = direction == "x" ? overlap : axisYatas.width;
//         let newDepth = direction == "z" ? overlap : axisYatas.depth;
        
//         axisYatas.width = newWidth;
//         axisYatas.depth = newDepth;

//         axisYatas.threejs.scale[direction] = overlap / size;
//         axisYatas.threejs.position[direction] -= delta / 2;

//         let nextX = direction == "x" ? axisYatas.threejs.position.x : -10;
//         let nextZ = direction == "z" ? axisYatas.threejs.position.z : -10;
//         let nextDirection = direction == "x" ? "z" : "x";

//         addLayer(nextX,nextZ,newWidth,newDepth,nextDirection);
//     }
// }


function animation(){
    let speed = 0.15;

    let axisYatas = stack[stack.length-1];
    axisYatas.threejs.position[axisYatas.direction] += speed;

    if(camera.position.y < AxisYBox * (stack.length - 2) + 4){
        camera.position.y += speed;
    }
    renderer.render(scene,camera);
}

//light
let ambient = () =>{
    let amblight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(amblight)
}

let directionlgt = () =>{
    let dl = new THREE.DirectionalLight(0xffffff, 0.6)
    dl.position.set(10,20,0);
    scene.add(dl)
}




//object
let Box = () =>{
   
    let geometry = new THREE.BoxGeometry(4, 1, 4)
    let color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
    let material = new THREE.MeshLambertMaterial({color : color})

    let mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
     
    
}




let render = () =>{
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.onload = () => {
    initialize();
    Box();
    ambient();
    directionlgt();
    
    render();
}

window.onresize = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}