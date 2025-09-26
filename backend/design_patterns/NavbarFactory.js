// Abstract base class for navigation
class INavigation {
  getMenu() {
    throw new Error("getMenu() must be implemented by subclasses");
  }
}

// Navigation for Student role
class StudentNav extends INavigation {
  getMenu() {
    return [
      "Complaint",
      "Feedback",
      "Profile",
      "Notifications",
      "Logout"
    ];
  }
}

// Navigation for Staff role
class StaffNav extends INavigation {
  getMenu() {
    return [
      "Dashboard",
      "Feedback",
      "Profile",
      "Notifications",
      "Logout"
    ];
  }
}

// Navigation for Admin role
class AdminNav extends INavigation {
  getMenu() {
    return [
      "Dashboard",
      "Staff",
      "Analytics",
      "Profile",
      "Notifications",
      "Logout"
    ];
  }
}

// Factory to return the correct navigation object
class  NavbarFactory {
  static getNavigation(role) {
    switch (role) {
      case "student":
        return new StudentNav();
      case "staff":
        return new StaffNav();
      case "admin":
        return new AdminNav();
      default:
        throw new Error("Unknown role: " + role);
    }
  }
}

module.exports = NavbarFactory;