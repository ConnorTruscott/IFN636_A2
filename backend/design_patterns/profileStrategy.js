class ProfileStrategy {
  viewConfig() { return []; }
  sanitizeUpdate() { return {}; }
  authorize(actorDoc, targetDoc) {
    if (!actorDoc || !targetDoc || String(actorDoc._id) !== String(targetDoc._id)) {
      throw new Error('Forbidden');
    }
  }
}

class AdminProfileStrategy extends ProfileStrategy {
  viewConfig() {
    return [
      { key: 'name',  label: 'Name',  editable: true },
      { key: 'email', label: 'Email', editable: false },
    ];
  }
  sanitizeUpdate(input) { return pick(input, ['name']); }
}

class StudentProfileStrategy extends ProfileStrategy {
  viewConfig() {
    return [
      { key: 'name',   label: 'Name',   editable: true },
      { key: 'email',  label: 'Email',  editable: false },
      { key: 'campus', label: 'Campus', editable: true },
    ];
  }
  sanitizeUpdate(input) { return pick(input, ['name', 'campus']); }
}

class StaffProfileStrategy extends ProfileStrategy {
  viewConfig() {
    return [
      { key: 'name',     label: 'Name',     editable: false },
      { key: 'email',    label: 'Email',    editable: false },
      { key: 'category', label: 'Category', editable: false },
    ];
  }
  sanitizeUpdate() { return {}; }
}

function pick(obj, keys) {
  const out = {};
  if (!obj) return out;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

function strategyForRole(role = '') {
  switch (normalizeRole(role)) {
    case 'admin':   return new AdminProfileStrategy();
    case 'student': return new StudentProfileStrategy();
    case 'staff':   return new StaffProfileStrategy();
    default:        return new ProfileStrategy();
  }
}

function getProfileView({ targetDoc }) {
  const role = normalizeRole(targetDoc.role);
  return strategyForRole(role).viewConfig(targetDoc);
}

function applyProfileUpdate({ actorDoc, targetDoc, input }) {
  const role = normalizeRole(targetDoc.role);
  const strat = strategyForRole(role);
  strat.authorize(actorDoc, targetDoc);
  const allowed = strat.sanitizeUpdate(input || {});
  Object.assign(targetDoc, allowed);
  return { updatedDoc: targetDoc, changes: allowed };
}

module.exports = {
  AdminProfileStrategy,
  StudentProfileStrategy,
  StaffProfileStrategy,
  strategyForRole,
  getProfileView,
  applyProfileUpdate,
  normalizeRole,
};