require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const authRouter = require('./routes/auth')

const app = express()

//connect database
const connectUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@hirehelperwebsite.2yx4n.mongodb.net/${process.env.DB_CLUSTER}?retryWrites=true&w=majority`
const connectDB = async () => {
    try {
        await mongoose.connect(connectUrl, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log('connect database successfully')
    } catch (error) {
        console.log('connect database error ' + error)
        process.exit(1)
    }
}
connectDB()

app.use(express.json())

app.use('/api/auth', authRouter)

app.listen(process.env.PORT, () => console.log(`server is running on port ${process.env.PORT}`))

