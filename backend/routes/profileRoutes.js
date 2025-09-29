const express = require('express');
const router = express.Router();

const { getProfileView, applyProfileUpdate, normalizeRole } =
  require('../design_patterns/profileStrategy');

const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET: role-specific view + values
router.get('/me', protect, async (req, res, next) => {
  try {
    const id = req.user._id || req.user.id;
    const userDoc = await User.findById(id).lean();
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    const role = normalizeRole(userDoc.role);
    const view = getProfileView({ targetDoc: { ...userDoc, role } });

    const values = {};
    for (const f of view) {
      let v = userDoc[f.key];
      // Staff expects "category" but DB uses "department"
      if (f.key === 'category' && (v === undefined || v === null)) {
        v = userDoc.department;
      }
      values[f.key] = v ?? '';
    }

    res.json({ role, view, values });
  } catch (e) { next(e); }
});

// PATCH: only allowed fields (Admin: name; Student: name, campus; Staff: none)
router.patch('/me', protect, async (req, res, next) => {
  try {
    const id = req.user._id || req.user.id;
    const userDoc = await User.findById(id);
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    // keep original casing in DB, but choose strategy by normalized role
    const { updatedDoc, changes } = applyProfileUpdate({
      actorDoc: userDoc,
      targetDoc: userDoc,
      input: req.body,
    });

    await updatedDoc.save();
    res.json({ ok: true, role: normalizeRole(updatedDoc.role), changes });
  } catch (e) { next(e); }
});

module.exports = router;