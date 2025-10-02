const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Notification = require('../models/Notification');
const {
  getNotifications,
  deleteNotification,
  markAsRead,
} = require('../controllers/notificationController');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getNotifications', () => {
    it('should return notifications for the logged-in user', async () => {
      const mockNotifs = [{ message: 'Notification 1' }];
      const sortStub = sinon.stub().resolves(mockNotifs);
      sinon.stub(Notification, 'find').returns({ sort: sortStub });

      await getNotifications(req, res);

      expect(res.json.calledWith(mockNotifs)).to.be.true;
      expect(Notification.find.calledWith({ recipientId: req.user.id })).to.be.true;
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification successfully', async () => {
      const mockNotif = { remove: sinon.stub().resolves() };
      sinon.stub(Notification, 'findById').resolves(mockNotif);
      await deleteNotification(req, res);
      expect(mockNotif.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Notification dismissed' })).to.be.true;
    });

    it('should return 404 if notification to delete is not found', async () => {
      sinon.stub(Notification, 'findById').resolves(null);
      await deleteNotification(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe('markAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      sinon.stub(Notification, 'updateMany').resolves({ nModified: 3 }); // Simulate 3 docs updated
      await markAsRead(req, res);
      const expectedQuery = { recipientId: req.user.id, read: false };
      const expectedUpdate = { $set: { read: true } };
      expect(Notification.updateMany.calledWith(expectedQuery, expectedUpdate)).to.be.true;
      expect(res.json.calledWith({ message: 'All notifications marked as read' })).to.be.true;
    });
  });
});
