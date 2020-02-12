const express = require('express');
const router = express.Router();
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const movieRouter = require('./movieRouter');
const genreRouter = require('./genreRouter');
const personRouter = require('./personRouter');
const searchRouter = require('./searchRoute');

router.get('/', (_req, res) => res.redirect('/auth/login'));
router.get('/welcome', (req, res) => res.render('welcome', { title: 'Welcome', header: `Welcome to NEOMDb` }));

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/movies', movieRouter);
router.use('/genres', genreRouter);
router.use('/persons', personRouter);
router.use('/search', searchRouter);

module.exports = router;