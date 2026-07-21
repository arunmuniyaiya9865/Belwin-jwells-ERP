const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // We can just use the native driver to unset approvedBy if it's ""
        const db = mongoose.connection.db;
        const result = await db.collection('customers').updateMany(
            { approvedBy: "" },
            { $unset: { approvedBy: 1 } }
        );
        console.log('Fixed approvedBy == "" in documents:', result.modifiedCount);
        
        const result2 = await db.collection('customers').updateMany(
            { approvedBy: "admin" },
            { $unset: { approvedBy: 1 } }
        );
        console.log('Fixed approvedBy == "admin" in documents:', result2.modifiedCount);

    } catch (e) {
        console.error('Fatal:', e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
