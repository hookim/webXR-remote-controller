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


const states = {
    DEFAULT : 'default', 
    SUCCESS : 'success', 
    WAITING : 'waiting', 
    REMOTE_AR_CONTROL : 'remote-ar-control',
    TERMINATE : 'terminate'
}

app.use(express.static('public')) // the name of static folder : public

io.on('connection', (socket) => {  
    console.log(`${socket.id} user just connected`)

    // socket info init and setter
    const sckInfo = {}
    sckInfo.id = socket.id
    sckInfo.state = states.DEFAULT
    const setSckState = (newType) => { sckInfo.state = newType }


    // check the number of users in the channel 
    const curUsers = Object.keys(users)
    let curSocketIdx = -1
    // if two users are already in the channel -> WAITING state
    if(curUsers.length >= 2 && !(socket.id in curUsers)){
        setSckState(states.WAITING)
    // if not, into the channel -> SUCCESS state
    }else{
        users[socket.id] = socket
        setSckState(states.SUCCESS)
    }


    //////////////// * emitter part (run every seconds )* /////////////////////
    const checkAvail = setInterval(() => {
        // console.log(sckInfo,curSocketIdx, frontOfLineIdx)

        const howManyNow = Object.keys(users).length
        switch(sckInfo.state){
            case states.SUCCESS:
                socket.emit(states.SUCCESS, null)
                break;
            case states.WAITING:
                
                if(curSocketIdx === -1){
                    // DEFAULT -> WAITING (only once)
                    //if queue is full... (later to be fully iplemented)
                    if(curWaitings + 1 === MAX_CAPACITY) setSckState(states.TERMINATE)
                    else{
                        curWaitings++
                        // where to put to socket id
                        curSocketIdx = endOfLineIdx
                        endOfLineIdx = idxOp('+', endOfLineIdx)
                        waitingQueue[curSocketIdx] = socket.id
                    }
                }
                socket.emit(states.WAITING, null)
                break;
            case states.TERMINATE:
        }
        // WAITING -> SUCCESS!
        if(howManyNow < 2 && (curSocketIdx === frontOfLineIdx)){
            // remove from the queue 
            if(curSocketIdx !== -1){
                waitingQueue[curSocketIdx] = null
                curSocketIdx = -1
                if(--curWaitings) frontOfLineIdx = idxOp('+', frontOfLineIdx)
                else frontOfLineIdx = 0
            }
            setSckState(states.SUCCESS)
        }
    },1000)

    // * listener part
    socket.on('remote-ar-control', (data) => {
        if(sckInfo.state === states.SUCCESS)
            socket.broadcast.emit('remote-ar-control', data)
    })

    socket.on(states.WAITING, () => {
        const howManyNow = Object.keys(users).length
        if(howManyNow < 2){
            // emitter will handle the dequeuing part
            if(curSocketIdx === frontOfLineIdx || curSocketIdx === -1){
                users[socket.id] = socket
                setSckState(states.SUCCESS)
            }
        }
    })

    socket.on('disconnect', () => {
        delete users[socket.id]
        console.log(`${socket.id} disconnected!`)
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

server.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})