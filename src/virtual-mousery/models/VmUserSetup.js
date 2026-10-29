// models/VmUserSetup.js - Virtual Mousery User Settings Model
// Kept in /virtual-mousery folder - separate from main crittertrack models
import mongoose from 'mongoose';

// Schema for Virtual Mousery user setup
// Collection: virtual_mousery_user_setups (explicitly separate from crittertrack collections)
const vmUserSetupSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true, // Index for fast user lookups
        unique: true // One setup per user
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        default: 'Guest'
    },
    logoIndex: {
        type: Number,
        required: true,
        min: 1,
        max: 9,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    // EXPLICITLY set collection name to avoid ambiguity with crittertrack collections
    collection: 'virtual_mousery_user_setups',
    timestamps: true // Automatically add createdAt/updatedAt
});

// Export model - uses the distinct collection name
// Collection: virtual_mousery_user_setups (separate from crittertrack)
export default mongoose.model('VmUserSetup', vmUserSetupSchema);