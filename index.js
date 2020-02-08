const express = require('express');
const path = require('path');
const app = express();
const flash = require('express-flash');
const session = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('public/posters'));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(flash());

const appRouter = require('./routes/appRouter');
app.use('/', appRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running on port ${port}`));