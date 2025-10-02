const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const NavbarFactory = require('../design_patterns/NavbarFactory');
const { getNavbar } = require('../controllers/navbarController');

describe('Navbar Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    // We stub the factory to test the controller in isolation
    sinon.stub(NavbarFactory, 'getNavigation');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return the correct menu for a given role', () => {
    req.query.role = 'Student';
    const mockMenu = [{ path: '/dashboard', label: 'Dashboard' }];
    // Make the factory return a mock navigation object
    NavbarFactory.getNavigation.returns({
      getMenu: () => mockMenu,
    });

    getNavbar(req, res);

    expect(NavbarFactory.getNavigation.calledWith('Student')).to.be.true;
    expect(res.json.calledWith({ menu: mockMenu })).to.be.true;
  });

  it('should return a 400 error if the role is invalid', () => {
    req.query.role = 'InvalidRole';
    // Make the factory throw the expected error
    NavbarFactory.getNavigation.throws(new Error('Invalid role specified'));

    getNavbar(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: 'Invalid role specified' })).to.be.true;
  });
});
