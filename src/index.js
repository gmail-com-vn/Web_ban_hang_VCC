const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const handlebars = require('express-handlebars');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const app = express();
const port = 3000;
const SortMiddleware = require('./app/middlewares/sortMiddleware');
const route = require('./routes'); // tự nạp file index
const db = require('./config/db');

const Category = require('./app/models/Category');
const User = require('./app/models/User');
const { mutipleMongooseToObject } = require('../src/util/mongoose');

// Connect to DB
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch();

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/product',
    collection: 'sessions',
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(methodOverride('_method'));

//HTTP logger
app.use(morgan('combined'));

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch();
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    res.locals.role = req.session.role;
    Category.find({})
        .then((category) => {
            res.locals.category = mutipleMongooseToObject(category);
            next();
        })
        .catch();
});

//Custom middlewares
app.use(SortMiddleware);

// Template engine
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: require('./helpers/handlebars'),
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Rotes init
route(app);
