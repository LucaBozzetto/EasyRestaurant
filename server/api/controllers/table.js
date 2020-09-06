const mongoose = require('mongoose');
const Table = mongoose.model('Table');
const Order = mongoose.model('Order');
const Element = mongoose.model('Element');
const User = mongoose.model('User');
const Item = mongoose.model('Item');
const Notification = mongoose.model('Notification');
const Statistic = mongoose.model('Statistic');
const errorUtility = require('../config/errorUtility');
const socketUtility = new (require('../config/socketUtility')).SocketUtility();

/**
 * @returns the list of all tables in the database accordingly to the query parameters.
 */
const listTables = async (req, res, next) => {
  try {
    const tables = await Table.find().exec();
    return res.status(200).json(tables);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * @returns a single table based on the id provided.
 */
const getTable = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const table = await Table
      .findById(req.params.id)
      // .populate({path: 'orders'})
      .exec();

    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    return res.status(200).json(table);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * @returns the occupied table if no errors were encountered
 */
const occupyTable = async (req, res, next) => {
  if (!req.body || !req.params.id || !req.body.customers || !req.user._id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  if (req.user.role != User.Role.Waiter) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_ROLE(req.user.role)));
  }

  try {
    const table = await Table.findById(req.params.id).exec();

    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    if (!table.isFree()) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_OCCUPIED));
    }

    table.customers = req.body.customers;
    table.waiter = req.user._id;
    table.free = false;
    table.occupiedAt = Date.now();

    const updatedTable = await table.save();

    socketUtility.roomBroadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedTable.id, User.Role.Waiter);
    socketUtility.roomBroadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedTable.id, User.Role.Cashier);

    return res
      .status(200)
      .json(updatedTable);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * @returns the freed table
 */
const freeTable = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const table = await Table.findById(req.params.id).exec();

    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    if (table.isFree()) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_FREE));
    }

    // Update waiter stats
    let waiterStatistic = await Statistic.find({user: table.waiter}).exec();
    if (waiterStatistic.length < 1) {
      waiterStatistic = new Statistic();
      waiterStatistic.user = table.waiter;
      waiterStatistic.customersServed = 0;
      waiterStatistic.customersHistory = [];
    } else {
      waiterStatistic = waiterStatistic[0];
    }
    waiterStatistic.customersServed += table.customers;


    const oldTable = {
      id: req.params.id,
      waiter: table.waiter,
    };

    // mark the orders as checkedout or delete them if they were dropped.
    for (orderId of table.orders) {
      const order = await Order.findById(orderId).exec();

      if (order.status === Order.Status.Completed) {
        await Order.findByIdAndUpdate(orderId, {status: Order.Status.Checkedout}).exec();

        socketUtility.roomBroadcast(socketUtility.ORDER_CHECKEDOUT_EVENT, order._id, User.Role.Cashier);

        // update historic stats
        const dateString = new Date(order.submittedAt).toDateString();
        const index = waiterStatistic.customersHistory.findIndex((elem) => elem.date === dateString);
        if (index > -1) {
          waiterStatistic.customersHistory[index].customers += table.customers;
        } else {
          waiterStatistic.customersHistory.push({date: dateString, customers: table.customers});
        }
      } else {
        await Order.findByIdAndDelete(orderId).exec();
        socketUtility.roomBroadcast(socketUtility.ORDER_DELETED_EVENT, {id: order.id, status: order.status}, User.Role.Cashier);
      }
    }

    table.customers = 0;
    table.waiter = null;
    table.occupiedAt = null;
    table.free = true;
    table.orders = [];

    // Save the updated stats
    waiterStatistic.save((error) => {
      if (error) {
        return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
      }
    });
    socketUtility.roomBroadcast(socketUtility.STATISTIC_UPDATED_EVENT, waiterStatistic.user, User.Role.Cashier);

    await Notification.deleteMany({table: table.id}).exec();

    const updatedTable = await table.save();

    // socketUtility.roomBroadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedTable.id, User.Role.Waiter);
    // socketUtility.roomBroadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedTable.id, User.Role.Cashier);
    socketUtility.broadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedTable.id);

    socketUtility.sendTo(socketUtility.TABLE_NOTIFICATIONS_DELETED_EVENT, oldTable.id, oldTable.waiter);

    return res
      .status(200)
      .json(updatedTable);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * @returns all the orders associated with this table
 */
const listOrders = async (req, res, next) => {
  // TODO: Can further expand this adding queries like food status or type
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  const query = {};
  const status = req.query.status;
  const queryParameters = Object.keys(req.query);

  if (status) {
    query.status = status;
  }

  if ( (queryParameters.length == 1 && !query.status) || queryParameters.length > 1) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_QUERY));
  }

  try {
    let table = await Table
      .findById(req.params.id)
      .populate({
        path: 'orders',
        match: query,
      })
      .exec();

    table = await table
      .populate({path: 'orders.food.item'})
      .populate({path: 'orders.beverage.item'})
      .populate({path: 'orders.food.extra'})
      .execPopulate();

    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    if (table.isFree()) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_FREE));
    }

    return res
      .status(200)
      .json(table.orders);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const addOrder = async (req, res, next) => {
  if (!req.params || !req.params.tableId || !req.body || !req.user.role || !req.user._id || !req.body.food || !req.body.beverage
    || (req.body.food.length < 1 && req.body.beverage.length < 1)) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.tableId)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  if (req.user.role != User.Role.Waiter) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_ROLE(req.user.role)));
  }

  try {
    const table = await Table.findById(req.params.tableId).exec();

    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    if (table.isFree()) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_FREE));
    }

    const order = new Order();

    for (let i=0; i< req.body.food.length; i++) {
      const food = req.body.food[i];
      const isFood = await Item.isFood(food.item);

      if (!isFood) {
        return next(errorUtility.errorMessage(errorUtility.NOT_FOOD));
      }

      if (food.quantity && food.item) {
        const orderElement = new Element();

        orderElement.quantity = food.quantity;
        orderElement.item = food.item;

        if (food.note) {
          orderElement.note = food.note;
        }

        if (food.extra && food.extra.length > 0) {
          orderElement.extra = [];
          orderElement.extra.push(...food.extra); // Use the spread operator to add all the array elems to the document array
        }

        order.food.push(orderElement);
      }
    }

    for (let i=0; i< req.body.beverage.length; i++) {
      const beverage = req.body.beverage[i];
      const isBeverage = await Item.isBeverage(beverage.item);

      if (!isBeverage) {
        return next(errorUtility.errorMessage(errorUtility.NOT_BEVERAGE));
      }

      if (beverage.quantity && beverage.item) {
        const orderElement = new Element();

        orderElement.quantity = beverage.quantity;
        orderElement.item = beverage.item;

        order.beverage.push(orderElement);
      }
    }

    if (req.body.beverage.length < 1) {
      order.status = Order.Status.BeverageReady;
    }

    if (req.body.food.length < 1) {
      order.status = Order.Status.FoodReady;
    }

    order.waiter = req.user.id;
    order.table = req.params.tableId;
    order.tableNumber = table.tableNumber;
    const newOrder = await order.save();

    table.orders.push(newOrder.id);
    await table.save();
    // const updatedTable = await table.save();

    // let populated = await updatedTable.populate({path: 'orders'}).execPopulate();
    // populated = await populated
    //   .populate({path: 'orders.food.item'})
    //   .populate({path: 'orders.beverage.item'})
    //   .execPopulate();

    if (req.body.beverage.length > 0) {
      socketUtility.roomBroadcast(socketUtility.ORDER_ADDED_EVENT, {id: newOrder.id, status: newOrder.status}, User.Role.Bar);
    }
    if (req.body.food.length > 0) {
      socketUtility.roomBroadcast(socketUtility.ORDER_ADDED_EVENT, {id: newOrder.id, status: newOrder.status}, User.Role.Cook);
    }

    // socketUtility.sendTo(socketUtility.ORDER_ADDED_EVENT, newOrder.id, newOrder.waiter);

    socketUtility.roomBroadcast(socketUtility.ORDER_ADDED_EVENT, {id: newOrder.id, status: newOrder.status}, User.Role.Cashier);
    socketUtility.roomBroadcast(socketUtility.ORDER_ADDED_EVENT, {id: newOrder.id, status: newOrder.status}, User.Role.Waiter);

    return res
      .status(200)
      .json(newOrder);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * @returns the newly created table
 */
const addTable = (req, res, next) => {
  if (!req.body || !req.body.seats) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  const table = new Table();
  table.seats = req.body.seats;

  table.save((error) => {
    if (error) {
      return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
    } else {
      socketUtility.broadcast(socketUtility.TABLE_ADDED_EVENT, table._id);

      return res
        .status(200)
        .json(table);
    }
  });
};

module.exports = {
  listTables,
  getTable,
  occupyTable,
  freeTable,
  listOrders,
  addOrder,
  addTable,
};
