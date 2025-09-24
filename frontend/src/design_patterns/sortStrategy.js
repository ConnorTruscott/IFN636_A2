// frontend/src/design_patterns/sortStrategy.js
class SortStrategy { sort(list){ return list; } }

export class TitleSort extends SortStrategy {
  sort(list){ return [...list].sort((a,b)=>(a.title||'').localeCompare(b.title||'')); }
}
export class CategorySort extends SortStrategy {
  sort(list){ return [...list].sort((a,b)=>(a.category||'').localeCompare(b.category||'')); }
}
export class LocationSort extends SortStrategy {
  sort(list){ return [...list].sort((a,b)=>(a.location||'').localeCompare(b.location||'')); }
}
export class StudentSort extends SortStrategy {
  sort(list){ const g=x=>(x.userId?.fullname||'').toLowerCase(); return [...list].sort((a,b)=>g(a).localeCompare(g(b))); }
}
export class StaffSort extends SortStrategy {
  sort(list){ const g=x=>(x.assignedStaff?.fullname||'').toLowerCase(); return [...list].sort((a,b)=>g(a).localeCompare(g(b))); }
}
export class StatusSort extends SortStrategy {
  sort(list){ return [...list].sort((a,b)=>(a.status||'').localeCompare(b.status||'')); }
}
export class DateSort extends SortStrategy {
  sort(list){ const t=x=>new Date(x?.date||x?.createdAt||0).getTime(); return [...list].sort((a,b)=>t(b)-t(a)); }
}
export class SortContext {
  constructor(strategy=new DateSort()){ this.strategy=strategy; }
  setStrategy(s){ this.strategy=s; }
  execute(list){ return this.strategy.sort(list); }
}
