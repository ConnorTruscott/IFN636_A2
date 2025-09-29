
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const notificationService = require('../design_patterns/NotificationService');
const { AdminObserver } = require('../design_patterns/NotificationObservers');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { studentNumber, name, email, password, phone, campus, role, department } = req.body; //new
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        let finalRole = 'Student';

        if (req.user && req.user.role ==='Admin' && role){
            finalRole = role;
        }

        const userData = {name, email, password, phone, campus, role: finalRole};

        if (studentNumber && finalRole === 'Student'){
            userData.studentNumber = studentNumber;
        }

        if (finalRole ==='Staff' && department){
            userData.department = department;
        }

        const user = await User.create( userData ); //with ,?
        const adminObserver = new AdminObserver();
        notificationService.subscribe(adminObserver);
        notificationService.userRegistered(user);
        notificationService.unsubscribe(adminObserver);

        res.status(201).json({ id: user.id, studentNumber: user.studentNumber, name: user.name, email: user.email, phone: user.phone, campus: user.campus, role: user.role, department: user.department, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// name, email, password, studentNumber, phone, campus
const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        studentNumber: user.studentNumber,
        name: user.name,
        email: user.email,
        phone: user.phone,
        campus: user.campus,
        // university: user.university,
        // address: user.address,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { studentNumber, name, email, phone, campus } = req.body;
        user.studentNumber = studentNumber || user.studentNumber;
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.campus = campus || user.campus;
        // user.university = university || user.university;
        // user.address = address || user.address;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, studentNumber: updatedUser.studentNumber, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, campus: updatedUser.campus, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
