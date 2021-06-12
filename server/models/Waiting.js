const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WaitingSchema = new Schema({
    idEmployee: {
        type: String,
        require: true,
        unique: false
    },
    idEmployer: {
        type: String,
        require: true,
        unique: false
    },
    name: {
        type: String
    },
    address: {
        type: String
    },
    time: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending','Accept', 'Refuse','Closed']
    }
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('waiting', WaitingSchema)