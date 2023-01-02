const express = require('express');
const initWebRoute = require('./router/index.js');
const configViewEngine = require('./config/viewEngine');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const chat = require('./controller/chatController');

const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
const port = process.env.PORT || 4000;
const cookieParser = require('cookie-parser');

app.use(morgan('combined'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser('asdfsdgfsdr243234'));

//config view engine
configViewEngine(app);

//init web route
initWebRoute(app);

chat(io);

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
