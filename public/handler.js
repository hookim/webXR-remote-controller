const viewer = document.querySelector('westmoon-viewer')

const socket = io()
console.log(socket)

socket.on('message', (msg)=>{
    console.log(msg)
})

const mouseMoveHandler = (e) => {        
    socket.emit('message', `message is going ${e.layerX}, ${e.layerY}` )
}


viewer.addEventListener('mousedown', (e) => {
    viewer.addEventListener('mousemove', mouseMoveHandler)
})

viewer.addEventListener('mouseup', ()=> {viewer.removeEventListener('mousemove', mouseMoveHandler)})