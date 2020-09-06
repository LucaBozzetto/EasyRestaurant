const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const Item = mongoose.model('Item');

// The status the element can be in
const Status = Object.freeze({
  Waiting: 'waiting',
  Preparation: 'preparation',
  Completed: 'completed',
});

const elementSchema = mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(Status),
    required: true,
    default: Status.Waiting,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  extra: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  }],
  note: {
    type: String,
    // validate: function() {
    //   return this.item.type == Item.Type.Food;
    // },
  },
});

elementSchema.methods.isCompleted = function() {
  return this.status == Status.Completed;
};

Object.assign(elementSchema.statics, {
  Status,
});

mongoose.model('Element', elementSchema);
