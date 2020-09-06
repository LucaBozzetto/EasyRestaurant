const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// This obj describes the various roles the employees can assume
const Role = Object.freeze({
  Waiter: 'waiter',
  Bar: 'bar',
  Cook: 'cook',
  Cashier: 'cashier',
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 1,
    maxLenght: 50,
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(Role),
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
    validate: function(value) {
      return ( (this.role == Role.Cashier && value == true) || (this.role != Role.Cashier && value == false) );
    },
    required: true,
  },
  hired: {
    type: Date,
    default: Date.now,
  },
  wage: {
    type: Number,
    min: 0,
  },
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.isAdmin = function() {
  return this.admin;
};

userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // FIXME: at the moment the token expires in 7 days. A bit too much?
  const token = {
    _id: this._id,
    username: this.username,
    name: this.name,
    surname: this.surname,
    role: this.role,
    admin: this.admin,
    hired: this.hired,
    wage: this.wage,
    exp: parseInt(expiry.getTime() / 1000, 10),
  };
  return jwt.sign(token, process.env.JWT_SECRET);
};

Object.assign(userSchema.statics, {
  Role,
});

mongoose.model('User', userSchema);
