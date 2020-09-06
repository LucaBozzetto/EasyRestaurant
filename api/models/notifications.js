const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
  },
  table: {
    type: mongoose.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  bar: {
    type: Boolean,
    required: true,
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    default: `Order is ready!`,
  },
});

mongoose.model('Notification', notificationSchema);
