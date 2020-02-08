const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Movie = require('../models/Movie');
const Search = require('../models/Search');

router.get('/:searchString?', async (req, res) => {
    const searchString = req.query.searchString
    const search = new Search(searchString);
    const movies = await Movie.getMovieList(await search.getMovies());
    const persons = Person.getPersonList(await search.getPersons());
    res.render('search', {
        title: searchString,
        header: `Search results for ${searchString}: `,
        movies,
        persons
    });
})

module.exports = router;