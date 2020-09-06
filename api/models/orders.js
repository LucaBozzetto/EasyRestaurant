const mongoose = require('mongoose');
const Element = mongoose.model('Element');
const autoIncrement = require('mongoose-plugin-autoinc').autoIncrement;

// The status the order can be in
const Status = Object.freeze({
  Preparation: 'preparation',
  BeverageReady: 'beverageready',
  FoodReady: 'foodready',
  Completed: 'completed',
  Checkedout: 'checkedout',
});

const orderSchema = mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    required: true,
    default: Status.Preparation,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  food: [Element.schema],
  beverage: [Element.schema],
});

orderSchema.methods.isCompleted = function() {
  return this.status == Status.Completed;
};

Object.assign(orderSchema.statics, {
  Status,
});

orderSchema.plugin(autoIncrement, {
  model: 'Order',
  field: 'orderNumber',
  startAt: 1,
});

mongoose.model('Order', orderSchema);
