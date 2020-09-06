const mongoose = require('mongoose');
const autoIncrement = require('mongoose-plugin-autoinc').autoIncrement;
// const Order = mongoose.model('Order');

const tableSchema = mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
  },
  customers: {
    type: Number,
    required: function() {
      return !this.free;
    },
    validate: function(value) {
      return value <= this.seats;
    },
    min: 0,
  },
  free: {
    type: Boolean,
    default: true,
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.free;
    },
  },
  occupiedAt: {
    type: Date,
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
});

tableSchema.methods.isFree = function() {
  return this.free;
};

tableSchema.plugin(autoIncrement, {
  model: 'Table',
  field: 'tableNumber',
  startAt: 1,
});

mongoose.model('Table', tableSchema);
