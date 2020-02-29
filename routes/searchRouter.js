const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const Movie = require('../models/Movie');
const Search = require('../models/Search');

router.get('/:searchString?', async (req, res) => {
    const search = new Search(req.query.searchString);

    res.render('search', {
        title: `Search - ${search.searchString}`,
        header: `Search results for ${search.searchString} `,
        movies: await Movie.getMovieList(await search.getMovies()),
        persons: Person.getPersonList(await search.getPersons())
    });
})

module.exports = router;