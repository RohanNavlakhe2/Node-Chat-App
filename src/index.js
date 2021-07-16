const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage,generateLocationMessage} = require('../src/utils/messages')
const app = express()
const {addUser,removeUser,getUser,getUsersInRoom} = require('../src/utils/users')

const PORT = process.env.PORT || 3000

const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

const server = http.createServer(app)
const io = socketio(server)


app.get('',(req,res) => {
    res.render('index')
})

//gets call on every new connection to the server
io.on('connection',(socket) => {
    console.log('New Connection')

    socket.on('join',({username,room},callback)=>{

        //addUser() will either return a object with error property or a object with id,username and room property
        const {error,user} = addUser({id:socket.id,username,room})

        if(error)
            return callback(error)

        //connects the socket to the given room
        socket.join(user.room)

        //emits event to this socket (connection)
        socket.emit('message',generateMessage('Welcome to chat',"Admin"))

        //emits event to all the connections except this socket in this room
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`,"Admin"))

        //emit event to provide room name and its users to client to show in sidebar
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})

        //empty callback() denotes successful joining of the user in room
        callback()

    })


    //Listen to custom event 'sendMessage' emitted by client in chat.js
    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(message,user.username))
        callback('Message Delivered')
    })

    //Listen to custom event 'sendLocation' emitted by client in chat.js
    socket.on('sendLocation',(location,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location-message',generateLocationMessage(`https://google.com/maps?q=${location.lat},${location.lng}`,user.username))

        //this will work as acknowledgement for the client.
        //when we will call this function the function passed in
       /* socket.emit('sendLocation',{lat:location.coords.latitude,lng:location.coords.longitude},(acknowledgementFromServer) => {
            console.log(acknowledgementFromServer)
        })*/
        // in chat.js
        //will be executed
        callback('You have successfully shared your location')
    })

    //gets called when this socket (connection) will be disconnected
    socket.on('disconnect',() => {
        const removedUser = removeUser(socket.id)

        if(removedUser){

            //provide the user left message to all users in the room
            io.to(removedUser.room).emit('message',generateMessage(`${removedUser.username} has left the conversation`,"Admin"))

            //provide room name and existing users in room to client to show in sidebar
            io.to(removedUser.room).emit('roomData',{room:removedUser.room,users:getUsersInRoom(removedUser.room)})
        }
    })
})


//note that listen is called on server and not on app
server.listen(PORT,() => {
    console.log('server started')
})