
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    studentNumber: { type: String, unique: true, trim: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    campus: { type: String, enum: ['Gardens Point', 'Kelvin Grove'] },
    role: {
        type: String,
        enum: ['Student', 'Staff', 'Admin'],
        default: 'Student'
    },
    department: {type: String},

}, { timestamps: true 
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
