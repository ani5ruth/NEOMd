const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Person = require('../models/Person');
const Genre = require('../models/Genre');
const User = require('../models/User');

// get all time popular movies
router.get('/', async (req, res) => {
    const allTimePopularMovies = await Movie.getPopularMovies(25);
    res.render('movie-list', {
        title: 'Movies',
        header: 'Popular Movies: All time',
        movies: allTimePopularMovies,
        years: await Movie.getYears()
    });
});

// get popular movies by year
router.get('/years/:year?', async (req, res) => {
    const year = parseInt(req.params.year);
    const givenYearPopularMovies = await Movie.getPopularMoviesByYear(year, 25);
    res.render('movie-list', {
        title: 'Movies',
        header: `Popular Movies: ${year}`,
        movies: givenYearPopularMovies,
        years: await Movie.getYears()
    });
});

// get details of a given movie
router.get('/id/:id?', async (req, res) => {
    // get movie details
    const id = req.params.id;
    const movie = new Movie(id);
    await movie.getDetails();

    // get genres
    const genres = Genre.getGenreList(await movie.getGenre());

    // get direcotors and casts
    const directors = Person.getPersonList(await movie.getDirector());
    const cast = Person.getPersonList(await movie.getCast());

    // user details
    const user = new User(req.session.email);
    const inWatchlist = await user.movieInWatchlist(id);
    const rating = await user.getRating(id);

    // get similar movies
    const similarMovies = await movie.getSimilar(5);
    const similarCollab = await movie.getSimilarCollab(5);

    // get 5 reviews
    const records = await movie.getReviews(25);
    const reviews = [];
    records.forEach(record => reviews.push({
        email: record[0],
        content: record[1]
    }));

    // respond
    res.render('movie', {
        title: `${movie.title}`,
        movie,
        genres,
        directors,
        cast,
        inWatchlist,
        rating,
        similarMovies,
        similarCollab,
        reviews
    });
});

// get movies similar to a given movie
router.get('/similar/:id?', async (req, res) => {
    const id = req.params.id;
    const movie = new Movie(id);
    await movie.getDetails();
    const movies = await movie.getSimilar(25);
    res.render('similar-movie-list', {
        title: `${movie.title} similar`,
        header: `Movies similar to ${movie.title}`,
        movies
    });
});

router.get('/people_also_liked/:id?', async (req, res) => {
    const id = req.params.id;
    const movie = new Movie(id);
    await movie.getDetails();
    const movies = await movie.getSimilarCollab(25);
    res.render('similar-movie-list', {
        title: `${movie.title} similar`,
        header: `People who liked ${movie.title} also liked`,
        movies
    });
});

router.get('/review/:id?', async (req, res) => {
    const id = req.params.id;
    const movie = new Movie(id);
    await movie.getDetails();
    const records = await movie.getReviews(25);
    const reviews = [];
    records.forEach(record => reviews.push({
        email: record[0],
        content: record[1]
    }));
    res.render('reviews', {
        title: `${movie.title} reviews`,
        header: `Reviews for ${movie.title}`,
        reviews
    });
});


module.exports = router;