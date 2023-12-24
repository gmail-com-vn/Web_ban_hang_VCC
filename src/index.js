const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const handlebars = require('express-handlebars');
const app = express();
const port = 3000;
const SortMiddleware = require('./app/middlewares/sortMiddleware');
const route = require('./routes'); // tự nạp file index
const db = require('./config/db');

// Connect to DB
db.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch();

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
