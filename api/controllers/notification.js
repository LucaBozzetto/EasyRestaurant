const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
// const User = mongoose.model('User');
const errorUtility = require('../config/errorUtility');
const Table = mongoose.model('Table');

const listTableNotifications = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const notifications = await Notification
      .find({waiter: req.user._id, table: req.params.id})
      .exec();

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification
      .find({waiter: req.user._id})
      .exec();

    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const getNotification = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const notification = await Notification
      .findById(req.params.id)
      .exec();

    if (!notification) {
      return next(errorUtility.errorMessage(errorUtility.NOTIFICATION_NOT_FOUND));
    }

    if (notification.waiter.toString() !== req.user._id.toString()) {
      console.log(notification.waiter);
      console.log(req.user._id);
      return next(errorUtility.errorMessage(errorUtility.NOTIFICATION_NOT_YOURS));
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const deleteNotication = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const notification = await Notification
      .findByIdAndDelete(req.params.id)
      .exec();

    return res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const deleteTableNotifications = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const table = Table.findById(req.params.id).exec();
    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    const notifications = await Notification
      .deleteMany({table: req.params.id})
      .exec();

    return res.status(200).json(notifications );
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

module.exports = {
  listNotifications,
  listTableNotifications,
  getNotification,
  deleteNotication,
  deleteTableNotifications,
};
