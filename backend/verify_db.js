const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Counter = require('./models/Counter');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';

async function verifyDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Check Counter
        const counter = await Counter.findById('employeeId');
        console.log('Employee Counter:', counter);

        // Check Employees
        const employees = await Employee.find({}, { employeeId: 1, firstName: 1, lastName: 1, _id: 1 });
        console.log(`Total employees: ${employees.length}`);

        let missingIds = 0;
        let nullIds = 0;
        let emptyIds = 0;
        const ids = new Set();
        let duplicates = 0;

        employees.forEach(emp => {
            if (emp.employeeId === undefined) missingIds++;
            if (emp.employeeId === null) nullIds++;
            if (emp.employeeId === '') emptyIds++;

            if (emp.employeeId) {
                if (ids.has(emp.employeeId)) duplicates++;
                ids.add(emp.employeeId);
            }
        });

        console.log('--- Verification Results ---');
        console.log(`Missing employeeId: ${missingIds}`);
        console.log(`Null employeeId: ${nullIds}`);
        console.log(`Empty employeeId: ${emptyIds}`);
        console.log(`Duplicate employeeIds: ${duplicates}`);
        console.log('Unique IDs found:');
        console.log(Array.from(ids));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyDB();
