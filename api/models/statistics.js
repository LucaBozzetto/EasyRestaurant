const mongoose = require('mongoose');

const statisticSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customersServed: {
    type: Number,
    min: 0,
  },
  customersHistory: [{
    date: String,
    customers: Number,
  }],
  tags: [{
    tag: String,
    occurences: Number,
  }],
  dishesPrepared: {
    type: Number,
    min: 0,
  },
  earnings: [{
    date: String,
    amount: Number,
  }],
});

mongoose.model('Statistic', statisticSchema);
