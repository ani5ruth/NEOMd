const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

// get popular movies by all genre
router.get('/', async (req, res) => {
    const allGenrePopular = await Movie.getPopularMovies(25);
    const genres = await Genre.getAllGenres();
    res.render('genre-list', {
        title: 'All Genres',
        header: 'Popular Movies: All Genres',
        movies: allGenrePopular,
        genres
    });
});

// get popular movies by genre
router.get('/:genre?', async (req, res) => {
    const genre = new Genre(req.params.genre);
    const popularMovies = await Movie.getMovieList(await genre.getPopularMovies(25));
    const genres = await Genre.getAllGenres();
    res.render('genre-list', {
        title: `${genre.name}`,
        header: `Popular Movies: ${genre.name}`,
        movies: popularMovies,
        genres
    });
});

module.exports = router;