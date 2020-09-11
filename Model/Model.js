const mongoose = require('mongoose')

let RoomIDSchema = new mongoose.Schema({
    RoomID: {
        type: String,
        require:true,
        trim:true,
    }
})

let RoomID = mongoose.model('Rooms', RoomIDSchema);

module.exports = RoomID;