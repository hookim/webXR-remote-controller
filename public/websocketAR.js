const viewer = document.querySelector('westmoon-viewer')

const socket = io()

const alertMsg = document.getElementById('alert-message')
const coord = document.getElementById('coord')

const rangeX = document.getElementById('rangeX')
const rangeY = document.getElementById('rangeY')
const rangeZ = document.getElementById('rangeZ')

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
    console.log(sckState)
    if (sckState === states.WAITING) socket.emit(states.WAITING, null)
}, 1000)

// control from the other client!
socket.on('remote-ar-control', (data)=>{
    const {x, y, z} = JSON.parse(data)

    rangeX.value = x;
    rangeY.value = y;
    rangeZ.value = z;
    /* 

    */
})

// client is waitng for the empty seat
socket.on(states.WAITING, () => {
    sckState = states.WAITING
    coord.style.display = 'none'
    alertMsg.textContent = 'waiting for the channel to be empty...'
})

socket.on(states.SUCCESS, () => {
    coord.style.display = 'block'
    alertMsg.textContent = ''
    sckState = states.SUCCES
})

//when slides moveeee
const slideHandler = () => {     
    const data = {x : rangeX.value, y : rangeY.value, z : rangeZ.value}   
    socket.emit('remote-ar-control', JSON.stringify(data))
}

//control from here locally
rangeX.addEventListener('input', slideHandler)
rangeY.addEventListener('input', slideHandler)
rangeZ.addEventListener('input', slideHandler)
