import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js';

const viewer = document.querySelector('westmoon-viewer')

const socket = io()

const alertMsg = document.getElementById('alert-message')
const coord = document.getElementById('coord')

const rangeX = document.getElementById('rangeX')
const rangeY = document.getElementById('rangeY')
const rangeZ = document.getElementById('rangeZ')

let camera, scene, renderer, cube;

init();
animate();

function init(){
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3); 
    const material = new THREE.MeshBasicMaterial({color:0xff0000});
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0,0,-1);
    scene.add(cube);

    document.body.appendChild(ARButton.createButton(renderer));
	window.addEventListener('resize', onWindowResize, false);
    console.log(scene);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
}

const states = {
    DEFAULT : 'default', 
    SUCCESS : 'success', 
    WAITING : 'waiting', 
    REMOTE_AR_CONTROL : 'remote-ar-control',
    TERMINATE : 'terminate'
}

let sckState = states.DEFAULT


// emitter part
const checkAvail = setInterval(() => {
    if (sckState === states.WAITING) socket.emit(states.WAITING, null)
}, 1000)

// control from the other client!
socket.on('remote-ar-control', (data)=>{
    const {x, y, z} = JSON.parse(data)

    rangeX.value = x;
    rangeY.value = y;
    rangeZ.value = z;
    
    cube.position.x = (rangeX.value-50)/20;
    cube.position.y = (rangeY.value-50)/20;
    cube.position.z = (rangeZ.value-50)/20 - 1;
})

// client is waitng for the empty seat
socket.on(states.WAITING, () => {
    sckState = states.WAITING
    coord.style.display = 'none'
    alertMsg.textContent = 'waiting for the channel to be empty...'
})

socket.on('disconnect', () => {
    coord.style.display = 'none'
    alertMsg.textContent = 'DONE!'
})

socket.on(states.SUCCESS, () => {
    coord.style.display = 'block'
    alertMsg.textContent = ''
    sckState = states.SUCCESS
})

//when slides moveeee
const slideHandler = () => {     
    const data = {x : rangeX.value, y : rangeY.value, z : rangeZ.value}
    
    cube.position.x = (rangeX.value-50)/20;
    cube.position.y = (rangeY.value-50)/20;
    cube.position.z = (rangeZ.value-50)/20 - 1;

    socket.emit('remote-ar-control', JSON.stringify(data))
}

//control from here locally
rangeX.addEventListener('input', slideHandler)
rangeY.addEventListener('input', slideHandler)
rangeZ.addEventListener('input', slideHandler)
