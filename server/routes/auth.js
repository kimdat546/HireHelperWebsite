const express = require('express')
const route = express.Router()
const argon2 = require('argon2')
const Employee = require('../models/employee')
const Employer = require('../models/employer')
const Waiting = require('../models/waiting')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/auth')

//@route POST employee register
route.post('/employee/register', async (req, res) => {
    const { username, password, name, address, phone, mail, type, description } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username or Password is empty' })
    try {
        const employee = await Employee.findOne({ username })
        if (employee) return res.status(400).json({ success: false, message: 'Username already exists' })
        else {
            const hashpassword = await argon2.hash(password)
            const newEmployee = new Employee({
                username,
                password: hashpassword,
                name,
                address,
                phone,
                mail,
                type: type || 'Company',
                description,
                status: 'Unavailable',
                employerId: null
            })
            await newEmployee.save()
            const accessToken = jwt.sign({ userId: newEmployee._id }, process.env.ACCESS_TOKEN_SECRET)
            res.json({ success: true, message: 'Employee created', accessToken })
        }
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


//@route POST employee login
route.post('/employee/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username or Password is empty' })
    try {
        const employee = await Employee.findOne({ username })
        if (!employee) return res.status(400).json({ success: false, message: 'Username is incorrect' })
        else {
            const passwordValid = await argon2.verify(employee.password, password)
            if (!passwordValid) res.status(400).json({ success: false, message: 'Password is incorrect' })
            else {
                const accessToken = jwt.sign({ userId: employee._id }, process.env.ACCESS_TOKEN_SECRET)
                res.json({ success: true, message: 'Login successfully', accessToken, employeeId: employee._id })
            }
        }
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route GET list employee 
route.get('/employee/list', async (req, res) => {
    try {
        const employee = await Employee.find()
        res.json({ success: true, message: 'get list ok', employee })
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route GET detail employee 
route.get('/employee/:id', async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.params.id })
        if(!employee) return res.json({ success: false, message: 'not found employee' })
        res.json({ success: true, message: 'get detail employee ok', employee })
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route POST employee hire
route.post('/employee/hire/:id', verifyToken, async (req, res) => {
    const { idemployer, salary, address, time, status } = req.body
    try {
        const condition = await Waiting.findOne({ idEmployee: req.params.id,idEmployer: idemployer,status:"Pending" })
        if (condition) return res.status(400).json({ success: false, message: 'Waiting for accept' })
        else {
            const newWaiting = new Waiting({
                idEmployee: req.params.id,
                idEmployer: idemployer,
                salary,
                address,
                time,
                status: status || 'Pending'
            })
            await newWaiting.save()
            res.json({ success: true, message: 'Successfully submitted hire request' })
        }
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


//@route GET list waiting hire
route.get('/employer/listwaiting/:id', verifyToken, async (req, res) => {
    try {
        const listWaiting = await Waiting.find({ idEmployee: req.params.id })
        res.json({ success: true, message: 'get listWaiting ok', listWaiting })
    } catch (error) {
        console.log('error register' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route POST waiting accept
route.post('/employee/accept/:id', verifyToken, async (req, res) => {
    const { idemployee, status } = req.body
    try {
        const condition1 = Waiting.findOne({ idEmployee: idemployee, idEmployer: req.params.id, status: "Pending" })
        const condition2 = Employee.findOne({ _id: idemployee, status: 'Available', employerId: null })
        if (!condition1 || !condition2) {
            return res.status(400).json({ success: false, message: "Don't accept" })
        }
        else {
            let updateWaiting = {
                status
            }
            let updateEmployee = {
                status: 'Unavailable',
                employerId: req.params.id
            }
            updateWaiting = Waiting.findOneAndUpdate(condition1, updateWaiting, { new: true })
            updateEmployee = Employee.findOneAndUpdate(condition2, updateEmployee, { new: true })
            if (!updateWaiting || !updateEmployee) return res.status(401).json({ success: false, message: 'Update false' })
            res.json({ success: true, message: 'update waiting accept ok' })
        }
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route POST waiting refuse
route.post('/employee/refuse/:id', verifyToken, async (req, res) => {
    const { idemployee, status } = req.body
    try {
        const condition1 = Waiting.findOne({ idEmployee: idemployee, idEmployer: req.params.id, status: "Pending" })
        if (!condition1) {
            return res.status(400).json({ success: false, message: "Don't refuse" })
        }
        else {
            let updateWaiting = {
                status
            }
            updateWaiting = Waiting.findOneAndUpdate(condition1, updateWaiting, { new: true })
            if (!updateWaiting) return res.status(401).json({ success: false, message: 'Update false' })
            res.json({ success: true, message: 'update waiting refuse ok' })
        }
    } catch (error) {
        console.log('error' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


//@route POST employee register
route.post('/employer/register', async (req, res) => {
    const { username, password, name, address, phone, mail } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username or Password is empty' })
    try {
        const employer = await Employer.findOne({ username })
        if (employer) return res.status(400).json({ success: false, message: 'Username already exists' })
        else {
            const hashpassword = await argon2.hash(password)
            const newEmployer = new Employer({
                username,
                password: hashpassword,
                name,
                address,
                phone,
                mail
            })
            await newEmployer.save()
            const accessToken = jwt.sign({ userId: newEmployer._id }, process.env.ACCESS_TOKEN_SECRET)
            res.json({ success: true, message: 'Employer created', accessToken })
        }
    } catch (error) {
        console.log('error register' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


//@route POST employee login
route.post('/employer/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username or Password is empty' })
    try {
        const employer = await Employer.findOne({ username })
        if (!employer) return res.status(400).json({ success: false, message: 'Username is incorrect' })
        else {
            const passwordValid = await argon2.verify(employer.password, password)
            if (!passwordValid) res.status(400).json({ success: false, message: 'Password is incorrect' })
            else {
                const accessToken = jwt.sign({ userId: employer._id }, process.env.ACCESS_TOKEN_SECRET)

                res.json({ success: true, message: 'Login successfully', accessToken, employerId: employer._id })
            }
        }
    } catch (error) {
        console.log('error register' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

//@route GET list employer 
route.get('/employer/list', async (req, res) => {
    try {
        const employer = await Employer.find()
        res.json({ success: true, message: 'get list ok', employer })
    } catch (error) {
        console.log('error register' + error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = route