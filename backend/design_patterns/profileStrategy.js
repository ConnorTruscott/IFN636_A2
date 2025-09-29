class ProfileStrategy {
  viewConfig(/* userDoc */) { return []; }            // [{ key, label, editable }]
  sanitizeUpdate(/* input */) { return {}; }          // only permitted fields pass
  authorize(actorDoc, targetDoc) {                    // self-update only
    if (!actorDoc || !targetDoc || String(actorDoc._id) !== String(targetDoc._id)) {
      throw new Error('Forbidden');
    }
  }
}

/** 3) ADMIN — update Name; Email view-only; buttons: Update / Clear */
class AdminProfileStrategy extends ProfileStrategy {
  viewConfig() {
    return [
      { key: 'name',  label: 'Name',  editable: true  },
      { key: 'email', label: 'Email', editable: false },
    ];
  }
  sanitizeUpdate(input) { return pick(input, ['name']); }
}

/** 4) STUDENT — update Name + Campus; Email view-only; buttons: Save / Clear */
class StudentProfileStrategy extends ProfileStrategy {
  viewConfig() {
    return [
      { key: 'name',   label: 'Name',   editable: true  },
      { key: 'email',  label: 'Email',  editable: false },
      { key: 'campus', label: 'Campus', editable: true  },
    ];
  }
  sanitizeUpdate(input) { return pick(input, ['name', 'campus']); }
}

/** 5) STAFF — view-only Name, Email, Category; no buttons */
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

/** util */
// ... keep existing classes exactly as you have them ...

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}
 
function strategyForRole(role = '') {
  switch (normalizeRole(role)) {
    case 'admin':
      return new AdminProfileStrategy();
    case 'student':
      return new StudentProfileStrategy();
    case 'staff':
      return new StaffProfileStrategy();
    default:
      return new ProfileStrategy();
  }
}

function getProfileView({ targetDoc }) {
  // ensure we select with the normalized role
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