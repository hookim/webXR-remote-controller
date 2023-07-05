const express = require('express')
const path = require('path')
const HTTP = require('http')
const ws = require('socket.io')
const queue = require('queue')

const PORT = process.env.PORT || 8080

const app = express()
const http = HTTP.Server(app)
const socketIO = ws(http)

const users = {}

// waiting queue
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


socketIO.on('connection', (socket) => {              
    console.log(`${socket.id} user just connected`) 
    const curUsers = Object.keys(users)
    let curSocketIdx = -1
    // allow only two users at the same time 
    if(curUsers.length >= 2){
        socket.emit('full-alert', null)
    }else{
        users[socket.id] = socket
        
        socket.on('remote-ar-control', (data) => { // when socket recieves a message
            socket.broadcast.emit('remote-ar-control', data)
        })

        socket.on('waiting', () => {
            if(curSocketIdx < 0){
                //if queue is full
                if(curWaitings + 1 === MAX_CAPACITY){
                    socket.emit('terminate', null)
                }

                // where to put to socket id
                endOfLineIdx = idxOp('+', endOfLineIdx)
                
                curSocketIdx = endOfLineIdx
                waitingQueue[curSocketIdx] = socket.id
            }

            // only send message to the oldest socket
            if(curSocketIdx === frontOfLineIdx){
                const howManyNow = Object.keys(users).length
                if(howManyNow < 2) {
                    socket.emit('waiting', true)
                    clearInterval(interval)
                }
                else socket.emit('waiting', false)
            }
        })

        socket.on('join-the-channel', () => {
            waitingQueue[curSocketIdx] = null
            curSocketIdx = -1
            frontOfLineIdx = idxOp('+', frontOfLineIdx)
            curWaitings--;
        })
    
        socket.on('disconnect', () => {
            delete users[socket.id]
            console.log('A user disconnected!')
        })
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

http.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})