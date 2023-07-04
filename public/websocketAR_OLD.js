const viewer = document.querySelector('westmoon-viewer')

const socket = io()

socket.on('message', (msg)=>{
    console.log(msg)
})

socket.on('full-alert', () => {
    window.alert('Line is busy')
})

const mouseMoveHandler = (e) => {        
    socket.emit('message', `message is going ${e.layerX}, ${e.layerY}` )
}


viewer.addEventListener('mousedown', (e) => {
    viewer.addEventListener('mousemove', mouseMoveHandler)
})

viewer.addEventListener('mouseup', ()=> {viewer.removeEventListener('mousemove', mouseMoveHandler)})