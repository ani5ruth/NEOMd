const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
    res.render('person', {
        title: `Persons`,
        header: 'Popular Actors/Directors',
        popularActors: await Person.getPopularDirector(10),
        popularDirectors: await Person.getPopularActor(10)
    });
});

router.get('/:person?', async (req, res) => {
    const person = new Person(req.params.person);

    res.render('movie-list', {
        title: `${person.name}`,
        header: `Popular ${person.name} Movies`,
        movies: await Movie.getMovieList(await person.getPopularMovies(25))
    });
});

module.exports = router;