const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const flash = require('connect-flash');
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

// mongoose.connect('mongodb+srv://zoomApp:ZoomApp.123@zoomapproomids.lrkid.mongodb.net/ZoomRoom?retryWrites=true&w=majority&ssl=true', { useNewUrlParser: true, useUnifiedTopology: true })
// .then(()=>{
//     console.log("DB Connected");
// })
// .catch((err)=>{
//     console.log(err);
// })



app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('CreateAndJoin', { Error: true })
})

const RoomIDS = {
    gfx6TZ: '976ab74c-5856-4418-9c1b-7475863c9da0'
}

app.post('/', (req, res) => {
    let data = req.body
    if (data.roomType === 'Create Room') {
        req.app.set('UserName', req.body.UserName)
        res.redirect(`${uuidv4()}`)
    }
    else if (data.roomType === 'Join Room') {
        if (RoomIDS.hasOwnProperty(data.RoomID)) {
            req.app.set('UserName', req.body.UserName)
            res.redirect(`${RoomIDS[data.RoomID]}`)
        }
        else {
            res.render('CreateAndJoin', { Error: false })
        }
    }
})


app.get('/:roomID', (req, res) => {
    res.render('room', { roomID: req.params.roomID, UserName: req.app.get('UserName') })
})

let RoomUsers = {}
let Messages = {}
io.on('connection', (socket) => {
    socket.on('join-room', (RoomID, userID, UserName) => {
        socket.join(RoomID)
        if (RoomID in RoomUsers) {
            RoomUsers[RoomID].push([UserName, userID])
        }
        else {
            RoomUsers[RoomID] = [[UserName, userID]]
        }
        socket.to(RoomID).broadcast.emit("user-connected", userID, UserName, RoomUsers[RoomID])

        socket.on('message', (message, UserName) => {
            if (RoomID in Messages) {
                Messages[RoomID].push([UserName, message])
            }
            else {
                Messages[RoomID] = [[UserName, message]]
            }
            io.to(RoomID).emit('createMessage', message, UserName, Messages[RoomID])
        })

        socket.on('disconnect', () => {
            RoomUsers[RoomID] = RoomUsers[RoomID].filter((Users)=>{
                if(Users[1]!=userID){
                    return Users
                }
            })
            socket.to(RoomID).broadcast.emit('user-disconnected', userID)
        })
    })
})

server.listen(8080);
