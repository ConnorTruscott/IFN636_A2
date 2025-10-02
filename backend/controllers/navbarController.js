const NavbarFactory = require("../design_patterns/NavbarFactory");

// Return navigation menu based on user role
const getNavbar = (req, res) => {
  const { role } = req.query; 
  try {
    const nav = NavbarFactory.getNavigation(role);
    res.json({ menu: nav.getMenu() });
  } catch (error) {
    console.error("NavbarFactory error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getNavbar };