const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const { createEmployee, getNextEmployeeId, initializeEmployeeIds } = require('./controllers/employeeController');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';

async function testWorkflow() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Test 1: getNextEmployeeId
    console.log('Testing getNextEmployeeId...');
    let req = {};
    let res = {
        json: (data) => console.log('getNextEmployeeId response:', data)
    };
    await getNextEmployeeId(req, res, console.error);

    // Test 2: createEmployee
    console.log('Testing createEmployee...');
    req = {
        body: {
            firstName: 'John',
            lastName: 'Doe',
            fatherName: 'Richard Doe',
            gender: 'Male',
            dob: '1990-01-01',
            mobile: '9876543210',
            email: 'john.doe' + Date.now() + '@example.com',
            address: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            branch: 'HEADOFFICE',
            department: 'SALES',
            designation: 'Developer',
            joiningDate: new Date(),
            salary: 50000,
            username: 'johndoe' + Date.now(),
            password: 'password123',
            role: 'Employee'
        }
    };
    res = {
        status: function(code) {
            console.log('createEmployee Status:', code);
            return this;
        },
        json: function(data) {
            console.log('createEmployee Created:', data.employeeId, data.firstName, data.email);
        }
    };
    await createEmployee(req, res, console.error);

    // Test 3: verify sequence incremented
    console.log('Testing getNextEmployeeId again...');
    res = {
        json: (data) => console.log('getNextEmployeeId response after creation:', data)
    };
    await getNextEmployeeId(req, res, console.error);

    await mongoose.disconnect();
}

testWorkflow();
