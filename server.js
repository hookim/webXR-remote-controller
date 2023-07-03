const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 8080

const http = require('http').Server(app)
const socketIO = require('socket.io')(http)

app.use(express.static('public'))

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected`)
    
    socket.on('message', msg => {
        socket.broadcast.emit('message', msg)
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected!')
    })
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

http.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})