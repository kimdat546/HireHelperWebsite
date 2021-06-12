const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmployeeSchema = new Schema({
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
    type: {
        type: String,
        enum: ['Company', 'Personal']
    },
    description: {
        type: String
    },
    urlImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['Available', 'Unavailable'],        
        default: 'Available'
    },
    employerId:{
        type: String,
        default: null
    }
},
    {
        timestamps: true
    }
)
module.exports = mongoose.model('employee', EmployeeSchema)