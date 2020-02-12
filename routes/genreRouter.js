const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

// get popular movies by genre
router.get('/:genre?', async (req, res) => {
    const genre = new Genre(req.params.genre);

    res.render('filter', {
        title: `Genre - ${genre.name}`,
        header: `Popular Movies - ${genre.name} genre`,
        item_name: 'genre',
        movies: await Movie.getMovieList(
            genre.name == 'all'
                ? await Movie.getPopularMovies(25)
                : await genre.getPopularMovies(25)
        ),
        genres: await Genre.getAllGenres()
    });
});

module.exports = router;