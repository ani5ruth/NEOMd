const express = require('express');
const router = express.Router();
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const movieRouter = require('./movieRouter');
const genreRouter = require('./genreRouter');
const personRouter = require('./personRouter');
const searchRouter = require('./searchRouter');

router.get('/', (req, res) => {
    if (req.session.email)
        res.redirect('/welcome');
    else
        res.redirect('/auth/login');
});
router.get('/welcome', (req, res) => {
    if (req.session.email)
        res.render('welcome', { title: 'Welcome', header: 'Welcome to NEOMDb' });
    else
        res.redirect('/auth/login');
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use('/genres', genreRouter);
router.use('/persons', personRouter);
router.use('/search', searchRouter);
router.use('*', (req, res) => res.render('error', { title: "error", header: "error" }));
module.exports = router;