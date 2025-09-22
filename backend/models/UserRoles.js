class UserBase{
    constructor(user){
        this.user = user;
    }

    getInfo() {
        return{
            name: this.user.name,
            email: this.user.email,
            role: this.user.role,
        };
    }
}

class Student extends UserBase {}
class Staff extends UserBase{
    constructor(user, department){
        super(user);
        this.department = department;
    }

    assignDepartment(department) {
        this.department = department;
    }
}

class Admin extends UserBase {
    createStaff(userData, department){
        const staff = new Staff(userData, department);
        return staff;
    }

    viewStaffList(staffList){
        return staffList.map((s) => s.getInfo());
    }

    assignStaffDepartment(staff, department){
        staff.assignDepartment(department);
    }
}

module.exports = {UserBase, Student, Staff, Admin};