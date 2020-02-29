const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Person = require('../models/Person');
const Genre = require('../models/Genre');
const User = require('../models/User');

// get popular movies by year
router.get('/years/:year?', async (req, res) => {
    const year = req.params.year;

    res.render('filter', {
        title: `Movies - ${year}`,
        header: `Popular Movies - ${year}`,
        item_name: 'year',
        movies: await Movie.getMovieList(
            year == 'all'
                ? await Movie.getPopularMovies(25)
                : await Movie.getPopularMoviesByYear(year, 25)
        ),
        years: await Movie.getYears()
    });
});

// get details of a given movie
router.get('/id/:id?', async (req, res) => {
    const movie = new Movie(req.params.id);
    await movie.getDetails();

    const user = new User(req.session.email);

    const reviews = [];
    (await movie.getReviews(25)).forEach(record => reviews.push({
        email: record[0],
        content: record[1]
    }));

    // respond
    res.render('movie', {
        title: `${movie.title}`,
        header: `${movie.title} ⋅ (${movie.year}) ⋅ ${movie.runtime}m`,
        movie,
        genres: Genre.getGenreList(await movie.getGenre()),
        directors: Person.getPersonList(await movie.getDirector()),
        cast: Person.getPersonList(await movie.getCast()),
        inWatchlist: await user.movieInWatchlist(movie.id),
        rating: await user.getRating(movie.id),
        similarMovies: await movie.getSimilar(5),
        similarCollab: await movie.getSimilarCollab(5),
        reviews
    });
});

// get movies similar to a given movie
router.get('/similar/:id?', async (req, res) => {
    const movie = new Movie(req.params.id);
    await movie.getDetails();

    res.render('movie-list', {
        title: `${movie.title} similar`,
        header: `Movies similar to ${movie.title}`,
        movies: await movie.getSimilar(25)
    });
});

router.get('/people_also_liked/:id?', async (req, res) => {
    const movie = new Movie(req.params.id);
    await movie.getDetails();

    res.render('movie-list', {
        title: `${movie.title} similar`,
        header: `People who liked ${movie.title} also liked`,
        movies: await movie.getSimilarCollab(25)
    });
});

router.get('/review/:id?', async (req, res) => {
    const movie = new Movie(req.params.id);
    await movie.getDetails();

    const reviews = [];
    (await movie.getReviews(25)).forEach(record => reviews.push({
        email: record[0],
        content: record[1]
    }));

    res.render('reviews', {
        title: `Reviews - ${movie.title}`,
        header: `Reviews for ${movie.title}`,
        reviews
    });
});


module.exports = router;