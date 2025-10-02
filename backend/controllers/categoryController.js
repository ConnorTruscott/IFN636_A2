const Category = require('../models/Category');

const listCategories = async (_req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    const cat = await Category.create({ name: String(name).trim() });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Category already exists' });
    res.status(500).json({ message: e.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body || {};
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Name is required' });
    cat.name = String(name).trim();
    const saved = await cat.save();
    res.json(saved);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    await cat.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
