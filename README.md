## Overview
1. webXR remote controller via websocket network
2. support only one channel with two users at each ends
3. with nodeJS websocket api (socket.io, socket.io-client)

## Detail 
A simple implemantion of the socket channel capable of 2 users. users not on the channel have to wait in the queue to get access to it

## Implementation
A socket can have 6 different states/event
- default : after the first socket connection, a pending state
- init : before successful connection, initialize the data configuration for the socket-synchronization
- success : when socket successfully enters the channel
- waiting : when socket has to wait becasue channel is fully occupied 
- ar-remote-control : socket is communicating 
- terminate : when the waiting queue reached its maximum capacity. this leads to the disconnection of the socket

![socket state diagram](./public/states.png)

## Updates
18 JULY 2023
- now a new socket is synchronized to an old socket

## How it works 
https://youtu.be/gwIGb4QBcfc



## Further plans for update
As of 18 July 2023
- support for multiple channels 
