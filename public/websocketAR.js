const viewer = document.querySelector('westmoon-viewer')

const socket = io()

const rangeX = document.getElementById('rangeX')
const rangeY = document.getElementById('rangeY')
const rangeZ = document.getElementById('rangeZ')

// control from the other client!
socket.on('remote-ar-control', (data)=>{
    const {x, y, z} = JSON.parse(data)

    rangeX.value = x;
    rangeY.value = y;
    rangeZ.value = z;
    /* 
        control three.js with msg here!!!
    */
})

// alert message when 2 clients are already using the control channel
socket.on('full-alert', () => {
    window.alert('Line is busy : connection failed!')
    socket.emit('waiting', null)
})

// client is waitng for the empty seat
socket.on('waiting', (msg) => {
    if(msg) socket.emit('join-the-channel', null)
    else socket.emit('waiting', null)
})

const slideHandler = () => {     
    const data = {x : rangeX.value, y : rangeY.value, z : rangeZ.value}   
    socket.emit('remote-ar-control', JSON.stringify(data))
}

//control from here locally
rangeX.addEventListener('input', slideHandler)
rangeY.addEventListener('input', slideHandler)
rangeZ.addEventListener('input', slideHandler)
