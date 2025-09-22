class AdminProxy {
    constructor(admin){
        this.admin = admin;
    }

    createStaff(userData, department, reqUser){
        if (reqUser.role !== 'Admin'){
            throw new Error("Unauthorised: Only Admin can create staff");
        }
        return this.admin.createStaff(userData, department);
    }

    assignStaffDepartment(staff, department, reqUser){
        if (reqUser.role !== 'Admin'){
            throw new Error("Unauthorised: Only Admin can assign departments")
        }
        return this.admin.assignStaffDepartment(staff, department);
    }
}

module.exports = AdminProxy;