// vmDb.js - Virtual Mousery Separate Database Configuration
// Kept in /virtual-mousery folder as requested - separate from main crittertrack
import mongoose from 'mongoose';

// VM Database connection URI - separate from main crittertrack DB
const VM_DB_URI = process.env.VM_DB_URI || 'mongodb://localhost:27017/virtual_mousery';

// Create a separate mongoose connection for VM database
const vmDbConnection = mongoose.createConnection(VM_DB_URI, {
    dbName: 'virtual_mousery', // Explicit database name
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Export the connection for use by models
export default vmDbConnection;

// Connection events
vmDbConnection.on('connected', () => {
    console.log('📦 Virtual Mousery DB connected (separate from crittertrack)');
});

vmDbConnection.on('error', (err) => {
    console.error('❌ Virtual Mousery DB error:', err);
});

vmDbConnection.on('disconnected', () => {
    console.warn('⚠️ Virtual Mousery DB disconnected');
});

// Initialize connection check
let vmConnected = false;

export const connectVmDb = async () => {
    if (vmConnected) return;
    
    try {
        await vmDbConnection.connect();
        vmConnected = true;
        console.log('✅ Virtual Mousery database connected successfully (separate DB)');
    } catch (error) {
        console.error('❌ Failed to connect to VM database:', error.message);
        throw error;
    }
};

export const closeVmDb = async () => {
    if (vmConnected) {
        await vmDbConnection.disconnect();
        vmConnected = false;
        console.log('🔌 Virtual Mousery database disconnected');
    }
};