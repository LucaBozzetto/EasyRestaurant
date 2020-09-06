require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./api/models/db');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
// This should be called before imports that use the SocketUtility class.
const socketUtility = new (require('./api/config/socketUtility')).SocketUtility(io);
require('./api/config/passport');
const apiRoutes = require('./api/routes/index');
const PORT = process.env.PORT || 5000;

require('colors');

// Are all these exceptions necessary?
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Origin', 'https://easyrestaurant-backend.herokuapp.com/');
  // res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
  // res.header('Access-Control-Allow-Origin', 'https://easyrestaurant-frontend.herokuapp.com/');
  // res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, DELETE');
  next();
});

app.use(express.urlencoded({
  extended: true,
}));
app.use(express.json());


// Passport should be initialized after the static routing and before the
// routes that need authentication.
app.use(passport.initialize());

// Socket.io setup and event binding.
socketUtility.setup();

// Returns a simple json file with the list of the available endpoints.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/api/postman_endpoints.json');
});

app.use('/api', apiRoutes);

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.use((error, req, res, next) => {
  if (Object.keys(error).length !== 0) {
    console.log('Errore richiesta: '.red + JSON.stringify(error));
    res.status(error.statusCode || 500).json(error);
  }
});
