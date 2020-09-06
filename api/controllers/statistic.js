const mongoose = require('mongoose');
const User = mongoose.model('User');
const Statistic = mongoose.model('Statistic');
const errorUtility = require('../config/errorUtility');

const getStatistics = async (req, res, next) => {
  if (!req.params || !req.params.userId) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  try {
    const user = await User.findById(req.params.userId).exec();

    if (!user) {
      return next(errorUtility.errorMessage(errorUtility.STATS_NOT_FOUND));
    }

    const statistics = await Statistic.findOne({user: req.params.userId}).exec();
    if (!statistics) {
      return next(errorUtility.errorMessage(errorUtility.STATS_NOT_FOUND));
    }

    return res.status(200).json(statistics);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const listStatistics = async (req, res, next) => {
  try {
    const statistics = await Statistic
      .find()
      .where('user').ne(req.user._id)
      .exec();

    return res.status(200).json(statistics);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

module.exports = {
  getStatistics,
  listStatistics,
};
