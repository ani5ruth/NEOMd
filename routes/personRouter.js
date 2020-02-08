const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
    const popularDirectors = await Person.getPopularDirector(10);
    const popularActors = await Person.getPopularActor(10);
    res.render('person-list', { title: `Persons`, popularActors, popularDirectors });
});

router.get('/:person?', async (req, res) => {
    const person = new Person(req.params.person);
    const popularMovies = await Movie.getMovieList(await person.getPopularMovies(25));
    res.render('person', { title: `${person.name}`, header: `Popular ${person.name} Movies`, popularMovies });
});

module.exports = router;