const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(new LocalStrategy({}, (username, password, done) => {
  User.findOne({username: username}, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user || !(user.validatePassword(password))) {
      return done(null, false, {message: 'Incorrect username or password.'});
    }
    return done(null, user);
  });
}));

passport.use('userStrategy',
  new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  function(jwtPayload, done) {
    return User.findOne({username: jwtPayload.username})
      .then((user) => {
        return done(null, user);
      }).catch((err) => {
        return done(err);
      });
  })
);

passport.use('adminStrategy',
  new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  function(jwtPayload, done) {
    return User.findOne({username: jwtPayload.username})
      .then((user) => {
        if (user.admin) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'This functionality is accessible to admins only.'});
        }
      }).catch((err) => {
        return done(err);
      });
  })
);
