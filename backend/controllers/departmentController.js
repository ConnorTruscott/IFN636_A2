const Department = require('../models/Department');
const { create } = require('../models/User');

const getDepartments = async (req, res) => {
    try{
        const departments = await Department.find({});
        res.json(departments);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const createDepartment = async (req, res) => {
    try{
        const {name, description} = req.body;
        const newDept = await Department.create({name, description});
        res.status(201).json(newDept);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const updateDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, description} = req.body;

        const updatedDept = await Department.findByIdAndUpdate(
            id,
            {name, description},
            {new: true}
        );

        res.json(updatedDept);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        await Department.findByIdAndDelete(id);
        res.json({message: 'Department Deleted'});
    } catch (err) {
        res.status(500).json({message: error.message});
    }
};

module.exports = {getDepartments, createDepartment, updateDepartment, deleteDepartment};