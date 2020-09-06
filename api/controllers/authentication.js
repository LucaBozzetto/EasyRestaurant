const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const errorUtility = require('../config/errorUtility');
const userController = require('./user');
const socketUtility = new (require('../config/socketUtility')).SocketUtility();

/**
 * @returns a jwt token if a users is succesfully registered.
 * In case something went wrong an error is returned.
 */
const register = async (req, res, next) => {
  if (!req.body || !req.body.username || !req.body.password || !req.body.name || !req.body.surname || !req.body.role) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }
  const isValid = await userController.isUsernameValid(req.body.username);

  if (!isValid) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_USERNAME));
  }

  if (req.body.role != User.Role.Waiter && req.body.role != User.Role.Bar && req.body.role != User.Role.Cook) {
    return next(errorUtility.errorMessage(errorUtility.UNEXPECTED_ROLE));
  }

  if (req.body.password.length < 6) {
    return next(errorUtility.errorMessage(errorUtility.PASSWORD_TOO_SHORT));
  }

  if (req.body.password.length > 150) {
    return next(errorUtility.errorMessage(errorUtility.PASSWORD_TOO_LONG));
  }

  const user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  user.name = req.body.name;
  user.surname = req.body.surname;
  user.role = req.body.role;

  if (req.body.wage) {
    user.wage = req.body.wage;
  } else {
    user.wage = 1200;
  }

  user.save((error) => {
    if (error) {
      return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
    } else {
      const token = user.generateJwt();
      socketUtility.broadcast(socketUtility.USER_AUTHENTICATED_EVENT, {id: user._id, role: user.role});
      socketUtility.roomBroadcast(socketUtility.USER_SIGNED_UP_EVENT, user.username, User.Role.Cashier);
      return res
        .status(200)
        .json({token: token});
    }
  });
};

/**
 * @return the jwt if the credentials provided are correct, an error otherwise.
 */
const login = (req, res, next) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(errorUtility.errorMessage(errorUtility.DEFAULT_ERROR));
    }

    if (user) {
      const token = user.generateJwt();
      socketUtility.broadcast(socketUtility.USER_AUTHENTICATED_EVENT, {id: user._id, role: user.role});
      return res.status(200).json({token: token});
    } else {
      return next(errorUtility.errorMessage(errorUtility.WRONG_CREDENTIALS));
    }
  })(req, res, next);
};

module.exports = {
  register,
  login,
};
