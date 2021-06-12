const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmployerSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    name: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    mail: {
        type: String
    },
    urlImage: {
        type: String
    }
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('employer', EmployerSchema)