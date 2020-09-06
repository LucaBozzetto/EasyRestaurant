const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const Element = mongoose.model('Element');
const Table = mongoose.model('Table');
const User = mongoose.model('User');
const Statistic = mongoose.model('Statistic');
const Notification = mongoose.model('Notification');
const errorUtility = require('../config/errorUtility');
const socketUtility = new (require('../config/socketUtility')).SocketUtility();

const getOrder = async (req, res, next) => {
  if (!req.params || !req.params.id) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  try {
    const order = await Order
      .findById(req.params.id)
      .populate({path: 'food.item'})
      .populate({path: 'beverage.item'})
      .populate({path: 'food.extra'})
      .sort({'food.item.timeRequired': 'ascending', 'status': 'ascending'})
      .exec();

    if (!order) {
      return next(errorUtility.errorMessage(errorUtility.ORDER_NOT_FOUND));
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const listOrders = async (req, res, next) => {
  const query = {};
  const status = req.query.status;
  const date = req.query.date;
  const queryParameters = Object.keys(req.query);

  if (status && Object.values(Order.Status).includes(status)) {
    query.status = status;
  } else {
    query.status = {};
    query.status.$ne = Order.Status.Checkedout;
  }

  if (date) {
    const selectedDay = new Date(date);
    selectedDay.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setUTCHours(0, 0, 0, 0);
    nextDay.setDate(selectedDay.getDate()+1);
    query.submittedAt = {'$gte': selectedDay, '$lt': nextDay};
  }


  if ( (queryParameters.length == 1 && (!query.status && !query.submittedAt))
    || (queryParameters.length == 2 && (!query.status || !query.submittedAt))
    || queryParameters.length > 2) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_QUERY));
  }

  try {
    const orders = await Order
      .find(query)
      .sort({date: 'ascending'})
      .populate({path: 'food.item'})
      .populate({path: 'beverage.item'})
      .populate({path: 'food.extra'})
      .sort({'food.item.timeRequired': 'ascending'})
      .exec();

    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

/**
 * Only the beverage status can actually be updated.
 * I might add other order properties like quantity/note only if the order status is waiting in case I want to offer more flexibility
 */
const updateOrder = async (req, res, next) => {
  if (!req.params || !req.params.id || !req.body.beverageCompleted) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  if (req.user.role != User.Role.Bar) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_ROLE(req.user.role)));
  }

  try {
    const order = await Order
      .findById(req.params.id)
      .populate({path: 'food.item'})
      .populate({path: 'beverage.item'})
      .populate({path: 'food.extra'})
      .sort({'food.item.timeRequired': 'ascending'})
      .exec();

    if (!order) {
      return next(errorUtility.errorMessage(errorUtility.ORDER_NOT_FOUND));
    }

    // the user can only set the status to be beverage completed and never change it back.
    if (!req.body.beverageCompleted) {
      return next(errorUtility.errorMessage(errorUtility.UNEXPECTED_STATUS));
    }

    if (order.status == Order.Status.Completed) {
      return next(errorUtility.errorMessage(errorUtility.ORDER_COMPLETED));
    }

    const previousStatus = order.status;

    order.beverage.forEach((element) => {
      element.status = Element.Status.Completed;
    });

    order.status = order.status == Order.Status.FoodReady ? Order.Status.Completed : Order.Status.BeverageReady;

    const updatedOrder = await order.save();

    const table = await Table.findById(updatedOrder.table);
    if (!table) {
      return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
    }

    let notification = new Notification();
    notification.waiter = updatedOrder.waiter;
    notification.table = updatedOrder.table;
    notification.tableNumber = table.tableNumber;
    notification.bar = true;
    notification.orderNumber = updatedOrder.orderNumber;

    notification = await notification.save();

    if (updatedOrder.status === Order.Status.Completed) {
      socketUtility.sendTo(socketUtility.ORDER_COMPLETED_EVENT, updatedOrder.id, updatedOrder.waiter);
      socketUtility.roomBroadcast(socketUtility.ORDER_COMPLETED_EVENT, updatedOrder.id, User.Role.Cashier);
    }

    socketUtility.roomBroadcast(socketUtility.ORDER_STATUS_CHANGED_EVENT, {id: order.id, status: order.status, previousStatus: previousStatus}, User.Role.Bar);
    socketUtility.roomBroadcast(socketUtility.ORDER_STATUS_CHANGED_EVENT, {id: order.id, status: order.status, previousStatus: previousStatus}, User.Role.Cashier);
    socketUtility.sendTo(socketUtility.NOTIFICATION_EVENT, notification.id, order.waiter);

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

const updateElement = async (req, res, next) => {
  if (!req.params || !req.params.orderId || !req.params.elementId || !req.body.status) {
    return next(errorUtility.errorMessage(errorUtility.INCOMPLETE_REQUEST));
  }

  // if the status is not a valid one
  if (!Object.values(Element.Status).includes(req.body.status) || req.body.status === Element.Status.Waiting) {
    return next(errorUtility.errorMessage(errorUtility.UNEXPECTED_STATUS));
  }

  // I could enforce the status so it can only advance (eg preparation -> foodready and ! foodready -> preparation)
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId) || !mongoose.Types.ObjectId.isValid(req.params.elementId)) {
    return next(errorUtility.errorMessage(errorUtility.INVALID_ID));
  }

  if (req.user.role != User.Role.Cook) {
    return next(errorUtility.errorMessage(errorUtility.WRONG_ROLE(req.user.role)));
  }

  try {
    const order = await Order
      .findById(req.params.orderId)
      .populate({path: 'food.item'})
      .populate({path: 'beverage.item'})
      .populate({path: 'food.extra'})
      .sort({'food.item.timeRequired': 'ascending'})
      .exec();

    if (!order) {
      return next(errorUtility.errorMessage(errorUtility.ORDER_NOT_FOUND));
    }

    if (order.status == Order.Status.Completed) {
      return next(errorUtility.errorMessage(errorUtility.ORDER_COMPLETED));
    }

    const previousStatus = order.status;

    const food = await order.food.id(req.params.elementId);
    if (food) {
      // We cannot change the status of an already completed element
      if (food.status == Element.Status.Completed) {
        return next(errorUtility.errorMessage(errorUtility.ELEMENT_COMPLETED_ALREADY));
      }

      food.status = req.body.status;

      // Check if all the foods are completed
      if (food.status == Element.Status.Completed) {
        let completed = true;
        order.food.forEach((element) => {
          if (element.status != Element.Status.Completed) {
            completed = false;
          }
        });

        // Update cook stats
        if (req.user.role == User.Role.Cook) {
          let statistic = await Statistic.find({user: req.user._id}).exec();
          if (statistic.length < 1) {
            statistic = new Statistic();
            statistic.user = req.user._id;
            statistic.dishesPrepared = 0;
            statistic.tags = [];
          } else {
            statistic = statistic[0];
          }

          statistic.dishesPrepared += food.quantity;
          const index = statistic.tags.findIndex((elem) => elem.tag === food.item.tag);
          if (index > -1) {
            statistic.tags[index].occurences++;
          } else {
            statistic.tags.push({tag: food.item.tag, occurences: 1});
          }

          statistic.save((error) => {
            if (error) {
              return next(errorUtility.errorMessage(errorUtility.CUSTOM_ERROR(500, error)));
            }
          });
        }

        if (completed) {
          order.status = order.status == Order.Status.BeverageReady ? Order.Status.Completed : Order.Status.FoodReady;

          const table = await Table.findById(order.table);
          if (!table) {
            return next(errorUtility.errorMessage(errorUtility.TABLE_NOT_FOUND));
          }

          let notification = new Notification();
          notification.waiter = order.waiter;
          notification.table = order.table;
          notification.tableNumber = table.tableNumber;
          notification.bar = false;
          notification.orderNumber = order.orderNumber;

          notification = await notification.save();

          socketUtility.sendTo(socketUtility.NOTIFICATION_EVENT, notification.id, order.waiter);
          socketUtility.roomBroadcast(socketUtility.ORDER_STATUS_CHANGED_EVENT, {id: order.id, status: order.status, previousStatus: previousStatus}, User.Role.Cook);
          socketUtility.roomBroadcast(socketUtility.ORDER_STATUS_CHANGED_EVENT, {id: order.id, status: order.status, previousStatus: previousStatus}, User.Role.Cashier);
        }
      }
    } else {
      return next(errorUtility.errorMessage(errorUtility.ELEMENT_NOT_FOUND));
    }

    const updatedOrder = await order.save();

    if (updatedOrder.status === Order.Status.Completed) {
      socketUtility.sendTo(socketUtility.ORDER_COMPLETED_EVENT, updatedOrder.id, updatedOrder.waiter);
      socketUtility.roomBroadcast(socketUtility.ORDER_COMPLETED_EVENT, updatedOrder.id, User.Role.Cashier);
    }

    socketUtility.roomBroadcast(socketUtility.ELEMENT_STATUS_CHANGED_EVENT, {
      id: order.id,
      status: order.status,
      elementId: req.params.elementId,
      elementStatus: req.body.status,
    }, User.Role.Cook);
    // socketUtility.broadcast(socketUtility.TABLE_STATUS_CHANGED_EVENT, updatedOrder.id);

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.log(error);
    return next(errorUtility.errorMessage(errorUtility.SERVER_ERROR));
  }
};

module.exports = {
  getOrder,
  listOrders,
  updateOrder,
  updateElement,
};
