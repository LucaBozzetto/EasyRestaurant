const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const errorUtility = require('../config/errorUtility');
const socketUtility = new (require('../config/socketUtility')).SocketUtility();

/**
 * @returns the list of all items in the database accordingly to the query parameters.
 */
const listItems = async (req, res, next) => {
  const query = {};
  const type = req.query.type;
  const tag = req.query.tag;
  const queryParameters = Object.keys(req.query);

  if (type) {
    query.type = type;
  }

  if (tag) {
    query.tag = tag;
  }

  // We only accept a request with 1, 2 or 0 query parameters
  if (queryParameters.length > 2 || (queryParameters.length == 1 && !tag && !type) ||
  (queryParameters.length == 2 && (!tag || !type))) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_QUERY));
  }

  try {
    const items = await Item.find(query).exec();
    return res.status(200).json(items);
  } catch (error) {
    console.log(`Error ${JSON.stringify(error)}`);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * Create a new Item
 * @returns the newly created obj
 */
const addItem = (req, res, next) => {
  if (!req.body || !req.body.price || !req.body.name || !req.body.type) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!Object.values(Item.Type).includes(req.body.type)) {
    return next(errorUtility.errorMessage(errorUtility.UNEXPECTED_TYPE));
  }

  // if (req.body.type != Item.Type.Food && req.body.type != Item.Type.Beverage && req.body.type != Item.Type.Extra) {
  //   return next(errorUtility.errorMessage(errorUtility.UNEXPECTED_TYPE));
  // }

  const item = new Item();
  item.price = req.body.price;
  item.name = req.body.name;
  item.type = req.body.type;

  if (item.type === Item.Type.Food) {
    if (!req.body.tag || !req.body.timeRequired) {
      return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
    }
  }

  if (req.body.tag) {
    item.tag = req.body.tag;
  }

  if (req.body.timeRequired) {
    item.timeRequired = req.body.timeRequired;
  }

  item.save((error) => {
    if (error) {
      return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
    } else {
      socketUtility.broadcast(socketUtility.ITEM_ADDED_EVENT, item._id);

      return res
        .status(200)
        .json(item);
    }
  });
};

module.exports = {
  listItems,
  addItem,
};
