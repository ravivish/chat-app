const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');// a library for not sending bad words
const { generateMessage , generateLocationMessage } = require('./utils/messages');
// const { generateLocationMessage } = require('./utils/messages');
const { addUser , removeUser , getUser , getUserInRoom } = require('./utils/users');


const app = express();

const server = http.createServer(app); // Creating new web server

const io  = socketio(server);

const publiDirectoryPath = path.join(__dirname,'../public');

const port  = process.env.PORT || 3000;

app.use(express.static(publiDirectoryPath));


// server(emit) => client (receive) - countupdated
// client(emit) => server (receive) - increment

let count=0;
io.on('connection',(socket)=>{
    console.log('new websocket connection');
    
    // socket.emit('message',{
    //     text:'Welcome!',
    //     createdAt:new Date().getTime()
    // });
    
    // socket.emit('message',generateMessage('Welcome!'));

    // socket.broadcast.emit('message','A new User Joins');// Send message to everyone except that new user
    // socket.broadcast.emit('message',generateMessage('A new User Joins'));

    // socket.on('join',({ username,room },callback)=>{
        // const { error, user } = addUser({ id:socket.id , username , room });
        socket.on('join',(options,callback)=>{
        const { error, user } = addUser({ id:socket.id , ...options });

        if(error){
            return callback(error);
        }
                
        socket.join(user.room);

        socket.emit('message',generateMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`));

        callback()

        // socket.emit io.emit socket.brodcast.emit ==>(individual)
        // io.to.emit socket.brodcast.emit ==>(chatrooms)

    })
    
    socket.on('sendMsg',(msg,callback)=>{

        const user = getUser(socket.id);
        
        const filter = new Filter();

        if(filter.isProfane(msg)){
            return callback('Profanilty is not allowed');
        }

        io.to(user.room).emit('message',generateMessage(user.username,msg));  

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })

        // callback('Devliverd!');// received feedback as a callback function ans send feedback data as "Deliverd"
        callback();
    })

    socket.on('sendLocation',(cords,callback)=>{
        const user = getUser(socket.id);
        // io.emit('message',`Location:${cords.latitude}, ${cords.longitude}`);
        // io.emit('message',`https://google.com/maps?q=${cords.latitude},${cords.longitude}`);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${cords.latitude},${cords.longitude}`));
        callback();
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`));  
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })          
        }

    })
    
    

    // // here "countupdated" is an event name it must be same as on the client
    // socket.emit('countupdated',count);

    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countupdated',count); // emit(send) only for a single/specific connection
    //     io.emit('countupdated',count);// emit for all the connection
    // })

})


// app.listen(port,()=>{
    //     console.log('Server is up on port',port);
    // });

server.listen(port,()=>{
        console.log('Server is up on port',port);
});