const express = require('express');
const router = express.Router();
const passport = require('passport');

// Passport settings
require('../config/passport');

// Include in path's middlewares for jwt authentication
const passportUserAuth = passport.authenticate('userStrategy', {session: false});
const passportAdminAuth = passport.authenticate('adminStrategy', {session: false});

// Controllers
const authenticationController = require('../controllers/authentication');
const itemController = require('../controllers/item');
const tableController = require('../controllers/table');
const orderController = require('../controllers/order');
const userController = require('../controllers/user');
const statisticController = require('../controllers/statistic');
const notificationController = require('../controllers/notification');

// Auth api
router
  .post('/register', authenticationController.register)
  .post('/login', authenticationController.login);

// User api
router
  // this will return the userinfo if an admin or user call it otherwise will just return true
  .get('/users/:username', passportUserAuth, userController.getUser)
  .put('/users/:username', passportAdminAuth, userController.updateUser)
  .delete('/users/:username', passportAdminAuth, userController.deleteUser)
  .get('/users', passportAdminAuth, userController.listUsers);

// Statistic api
router
  .get('/statistics', passportAdminAuth, statisticController.listStatistics)
  .get('/statistics/:userId', passportAdminAuth, statisticController.getStatistics);

// Item api
router
  .get('/items', passportUserAuth, itemController.listItems)
  .post('/items', passportAdminAuth, itemController.addItem);

// Table api
router
  .get('/tables', passportUserAuth, tableController.listTables)
  .get('/tables/:id', passportUserAuth, tableController.getTable)
  .get('/tables/:id/orders', passportUserAuth, tableController.listOrders)
  .get('/tables/:id/notifications', passportUserAuth, notificationController.listNotifications)
  .post('/tables', passportAdminAuth, tableController.addTable)
  .put('/tables/:id/occupy', passportUserAuth, tableController.occupyTable)
  .post('/tables/:tableId/orders', passportUserAuth, tableController.addOrder)
  .delete('/tables/:id/free', passportAdminAuth, tableController.freeTable)
  // .delete('/tables/:id/notifications', passportUserAuth, notificationController.deleteTableNotifications);

// Order and elements api
router
  .get('/orders', passportUserAuth, orderController.listOrders)
  .get('/orders/:id', passportUserAuth, orderController.getOrder)
  .put('/orders/:id', passportUserAuth, orderController.updateOrder)
  .put('/orders/:orderId/elements/:elementId', passportUserAuth, orderController.updateElement);

// Notifications api
router
  .get('/notifications/:id', passportUserAuth, notificationController.getNotification)
  .get('/notifications', passportUserAuth, notificationController.listNotifications)
  .delete('/notifications/:id', passportUserAuth, notificationController.deleteNotication);

module.exports = router;
