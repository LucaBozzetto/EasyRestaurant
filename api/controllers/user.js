const mongoose = require('mongoose');
const User = mongoose.model('User');
const Table = mongoose.model('Table');
const Statistic = mongoose.model('Statistic');
const errorUtility = require('../config/errorUtility');
const socketUtility = new (require('../config/socketUtility')).SocketUtility();

const getUser = async (req, res, next) => {
  if (!req.params || !req.params.username) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  try {
    const user = await User
      .findOne({username: req.params.username})
      .exec();

    if (!user) {
      return next(errorUtility.errorMessage(errorUtility.USER_NOT_FOUND));
    }

    // User is asking for its own profile or an admin is
    if (req.user.username == req.params.username || req.user.admin) {
      return res.status(200).json(user);
    } else {
      return res.status(200).json({validUsername: true});
    }
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const updateUser = async (req, res, next) => {
  if (!req.params || !req.params.username || !req.body.admin) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  try {
    const user = await User
      .findOne({username: req.params.username})
      .exec();

    if (!user) {
      return next(errorUtility.errorMessage(errorUtility.USER_NOT_FOUND));
    }

    const table = await Table.findOne({waiter: user._id}).exec();
    if (table) {
      console.log(table);
      return next(errorUtility.errorMessage(errorUtility.USER_ASSIGNED_TO_TABLE));
    }


    if (user.admin) {
      return next(errorUtility.errorMessage(errorUtility.ADMIN_ALREADY));
    }

    user.admin = req.body.admin;
    user.role = User.Role.Cashier;
    await user.save((error) => {
      if (error) {
        return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
      }
    });

    socketUtility.sendTo(socketUtility.USER_PROMOTED_EVENT, user._id, user._id);

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const deleteUser = async (req, res, next) => {
  if (!req.params || !req.params.username) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  try {
    let user = await User
      .findOne({username: req.params.username})
      .exec();

    if (!user) {
      return next(errorUtility.errorMessage(errorUtility.USER_NOT_FOUND));
    }

    const table = await Table.findOne({waiter: user._id}).exec();
    if (table) {
      console.log(table);
      return next(errorUtility.errorMessage(errorUtility.USER_ASSIGNED_TO_TABLE));
    }

    await Statistic.findOneAndDelete({user: user._id}).exec();

    user = await User
      .findByIdAndDelete(user._id)
      .exec();

    socketUtility.sendTo(socketUtility.USER_DELETED_EVENT, user._id, user._id);

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 @returns true if the param username is not already in the database, false otherwise
  */
const isUsernameValid = async (username) => {
  if (!username) {
    return false;
  }

  username = username.toLowerCase();
  try {
    const result = await User.findOne({username: username}).exec();
    return result ? false : true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User
      .find()
      .where('_id').ne(req.user._id)
      // .select('name surname role hired wage')
      .exec();

    if (users.length < 1) {
      return next(errorUtility.errorMessage(errorUtility.USER_NOT_FOUND));
    }

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

module.exports = {
  getUser,
  isUsernameValid,
  listUsers,
  updateUser,
  deleteUser,
};
