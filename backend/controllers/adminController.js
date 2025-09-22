const User = require('../models/User');
const {Admin} = require('../models/UserRoles');
const AdminProxy = require('../design_patterns/adminProxy');

const createStaff = async (req, res) => {
    try{
        const admin = new Admin(req.user);
        const proxy = new AdminProxy(admin);

        const {name, email, password, phone, campus, department} = req.body;

        const newStaff = await proxy.createStaff(
            {name, email, password, phone, campus, role: 'Staff'},
            department,
            req.user
        );

        const savedStaff = await User.create({...newStaff.user, role: 'Staff', department});

        res.status(201).json(savedStaff);
    } catch (error){
        res.status(403).json({message: error.message});
    }
};

const listStaff = async (req, res) => {
    try{
        const staffList = await User.find({role:'Staff'});
        res,json(staffList);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

module.exports = {createStaff, listStaff}