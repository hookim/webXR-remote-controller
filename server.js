const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const { Queue } = require('./ds.js')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = process.env.PORT || 8080

// channel 
const users = {}

// waiting queue 
const MAX_CAPACITY = 1000
const waitingQueue = new Queue(MAX_CAPACITY)

const states = {
    DEFAULT   : 'default', 
    INIT      : 'init',
    SUCCESS   : 'success',
    WAITING   : 'waiting', 
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
    let socketSerial = -1
    // if two users are already in the channel -> WAITING state
    if(curUsers.length >= 2 && !(socket.id in curUsers)){
        setSckState(states.WAITING)
    // if not, into the channel -> SUCCESS state
    }else{
        users[socket.id] = socket
        setSckState(states.INIT)
    }


    /*
    
    Emitter part 

    */
    setInterval(() => {

        const howManyNow = Object.keys(users).length
        switch(sckInfo.state){
            case states.INIT:
                socket.broadcast.emit(states.INIT, null)
                sckInfo.state = states.SUCCESS
            case states.SUCCESS:
                socket.emit(states.SUCCESS, null)
                break;
            case states.WAITING:
                
                if(socketSerial === -1){
                    // DEFAULT -> WAITING (only once)
                    //if queue is full... (later to be fully iplemented)
                    if(waitingQueue.isFull()) {
                        setSckState(states.TERMINATE)
                        console.log('terminate...')
                    }else{
                        waitingQueue.push(socket.id)
                        socketSerial = waitingQueue.size()
                    }
                }
                socket.emit(states.WAITING, null)
                break;
            case states.TERMINATE:
                socket.disconnect()
        }
        // WAITING -> SUCCESS!
        if(howManyNow < 2 && (socket.id === waitingQueue.peek())){
            // remove from the queue 
            if(socketSerial !== -1){
                waitingQueue.pop()
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
            if(socket.id === waitingQueue.peek() || socketSerial === -1){
                users[socket.id] = socket
                setSckState(states.INIT)
            }
        }
    })

    socket.on('init', () => {
        socket.broadcast.emit('init', null);
    })

    socket.on('disconnect', () => {
        socket.send('disconnect')
        delete users[socket.id]
        console.log(`${socket.id} disconnected!`)
        
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/admin-disconnect', (req, res) => {
    const disconnectUsrs = Object.values(users)
    disconnectUsrs.forEach((usr) => usr.disconnect())
    res.send('disconnection successful!').end()
})  

server.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})