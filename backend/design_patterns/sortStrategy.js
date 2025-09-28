class SortStrategy {
  compare(_a,_b){ return 0; }
  execute(list){ return Array.isArray(list) ? [...list].sort((a,b)=>this.compare(a,b)) : []; }
}

const s = v => (v==null ? '' : String(v).trim());
const cmp = (a,b) => s(a).localeCompare(s(b), undefined, { sensitivity:'base' });
const ms  = v => { const t = new Date(v||0).getTime(); return isFinite(t) ? t : 0; };

class DateSort      extends SortStrategy { compare(a,b){ return ms(b.date||b.createdAt) - ms(a.date||a.createdAt); } }
class TitleSort     extends SortStrategy { compare(a,b){ return cmp(a.title, a.title===b.title? b.title : b.title); } } // safe
class CategorySort  extends SortStrategy { compare(a,b){ return cmp(a.category, b.category); } }
class LocationSort  extends SortStrategy { compare(a,b){ return cmp(a.location, b.location); } }
class StudentSort   extends SortStrategy {
  compare(a,b){
    const an = a.studentName || a?.userId?.fullname || a?.userId?.name;
    const bn = b.studentName || b?.userId?.fullname || b?.userId?.name;
    return cmp(an,bn);
  }
}
class StaffSort     extends SortStrategy { compare(a,b){ return cmp(a.assignedStaffName, b.assignedStaffName); } }
class StatusSort    extends SortStrategy { compare(a,b){ return cmp(a.status, b.status); } }

class SortContext { constructor(strategy){ this.strategy = strategy; } setStrategy(s){ this.strategy = s; } execute(list){ return this.strategy.execute(list); } }

const makeStrategy = (key) => {
  switch (key){
    case 'title': return new TitleSort();
    case 'category': return new CategorySort();
    case 'location': return new LocationSort();
    case 'student': return new StudentSort();
    case 'assignedStaff': return new StaffSort();
    case 'status': return new StatusSort();
    case 'date':
    default: return new DateSort();
  }
};

module.exports = { SortContext, makeStrategy, DateSort, TitleSort, CategorySort, LocationSort, StudentSort, StaffSort, StatusSort };
