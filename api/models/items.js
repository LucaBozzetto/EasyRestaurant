const mongoose = require('mongoose');

// Used as enum for the various item types we can have
const Type = Object.freeze({
  Food: 'food',
  Beverage: 'beverage',
  Extra: 'extra',
});

const itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 1,
    maxLenght: 50,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: Object.values(Type),
    required: true,
  },
  tag: {
    type: String,
    lowercase: true,
    maxLenght: 50,
    validate: function() {
      return this.type == Type.Food;
    },
    required: function() {
      return this.type == Type.Food;
    },
  },
  // I could have chosen a Date datatype but since we are speaking
  // about food preparation times a minute precision will be more than enough.
  // Mind this represents the estimated time required for the recipe.
  timeRequired: {
    type: Number,
    min: 0,
    validate: function() {
      return this.type == Type.Food;
    },
    required: function() {
      return this.type == Type.Food;
    },
  },
});

itemSchema.statics.isFood = async function(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  try {
    const item = await this.findById(id);

    if (!item) {
      return false;
    }

    return item.type == Type.Food;
  } catch (error) {
    console.log(error);
    return false;
  }
};

itemSchema.statics.isBeverage = async function(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  try {
    const item = await this.findById(id);

    if (!item) {
      return false;
    }

    return item.type == Type.Beverage;
  } catch (error) {
    console.log(error);
    return false;
  }
};

Object.assign(itemSchema.statics, {
  Type,
});

mongoose.model('Item', itemSchema);
