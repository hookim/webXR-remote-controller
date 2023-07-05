const viewer = document.querySelector('westmoon-viewer')

const socket = io()

const alertMsg = document.getElementById('alert-message')
const coord = document.getElementById('coord')

const rangeX = document.getElementById('rangeX')
const rangeY = document.getElementById('rangeY')
const rangeZ = document.getElementById('rangeZ')

// 0 is prev 1 is current
const isAvailable = [true, true]
const checkAvail = setInterval(() => {
    console.log(isAvailable)
    if(!isAvailable[1]){
        socket.emit('waiting', null);
    }
    if(isAvailable[1] && !isAvailable[0]){
        window.alert('back to line!')
        socket.emit('join-the-channel', null)
    }
}, 1000)

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

    alertMsg.textContent = 'Please wait...'
    coord.style.display = "none"

    isAvailable[0] = isAvailable[1]
    isAvailable[1] = false
})

// client is waitng for the empty seat
socket.on('waiting', (msg) => {
    if(msg){
        console.log('waiting DONE')
        window.location.href = '/'
        isAvailable[0] = isAvailable[1]
        isAvailable[1] = true
        coord.style.display = 'block'
        alertMsg.textContent = ''
    }else{
        console.log('waiting????')
        isAvailable[0] = isAvailable[1]
        isAvailable[1] = false 
    } 
    
})

const slideHandler = () => {     
    const data = {x : rangeX.value, y : rangeY.value, z : rangeZ.value}   
    socket.emit('remote-ar-control', JSON.stringify(data))
}

//control from here locally
rangeX.addEventListener('input', slideHandler)
rangeY.addEventListener('input', slideHandler)
rangeZ.addEventListener('input', slideHandler)
