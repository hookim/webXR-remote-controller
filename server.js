const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 8080

// channel 
const users = {}

// waiting queue (later will be in class form)
const MAX_CAPACITY = 1000
const waitingQueue = new Array(MAX_CAPACITY)
let curWaitings = 0;
let frontOfLineIdx = 0;
let endOfLineIdx = 0;
const idxOp = (type, num) => {
    switch(type){
        case '+': return (num + 1) % MAX_CAPACITY;
        case '-': return (num - 1) >= 0 ? (num-1) % MAX_CAPACITY : MAX_CAPACITY;
    }
}

app.use(express.static('public')) // the name of static folder : public

io.on('connection', (socket) => {  

    console.log(`${socket.id} user just connected`)

    // check the number of users in the channel 
    const curUsers = Object.keys(users)
    let curSocketIdx = -1
    // if two users are already in the channel 
    if(curUsers.length >= 2 && !(socket.id in curUsers)){
        socket.emit('full-alert', null)
    }else{
        users[socket.id] = socket
    }
    // repeater
    const checkAvail = setInterval(() => {
        const howManyNow = Object.keys(users).length
        console.log(curSocketIdx, frontOfLineIdx)
        if(howManyNow < 2 && (curSocketIdx === frontOfLineIdx)){
            socket.emit('waiting', true)
        }
        if(howManyNow >= 2 && curSocketIdx !== -1){
            socket.emit('waiting', false)
        }
    }, 1000)

    socket.on('remote-ar-control', (data) => { // when socket recieves a message
        socket.broadcast.emit('remote-ar-control', data)
    })

    socket.on('waiting', () => {
        if(curSocketIdx < 0){
            //if queue is full
            if(curWaitings + 1 === MAX_CAPACITY){
                socket.emit('terminate', null)
            }
            else{
                curWaitings += 1
                // where to put to socket id
                
                curSocketIdx = endOfLineIdx
                endOfLineIdx = idxOp('+', endOfLineIdx)
                waitingQueue[curSocketIdx] = socket.id
            }
        }
    })

    socket.on('join-the-channel', () => {
        waitingQueue[curSocketIdx] = null
        curSocketIdx = -1
        if(--curWaitings) frontOfLineIdx = idxOp('+', frontOfLineIdx)
        else frontOfLineIdx = 0
    })

    socket.on('disconnect', () => {
        delete users[socket.id]
        console.log(`${socket.id} disconnected!`)
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/waiting', (req, res) => {
    res.sendFile(path.join(__dirname, 'waiting.html'))
})

server.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})