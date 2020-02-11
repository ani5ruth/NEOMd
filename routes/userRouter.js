const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const User = require('../models/User');

router.get('/watchlist', async (req, res) => {
    const movies = await Movie.getMovieList(await new User(req.session.email).getWatchlist());
    res.render('similar-movie-list', { title: "Your Watchlist", movies });
});

router.get('/ratings', async (req, res) => {
    const records = await new User(req.session.email).getAllRated();

    const ratings = [];
    for (const record of records) {
        const movie = new Movie(record[0]);
        await movie.getDetails();
        const rating = record[1];
        ratings.push({
            movie: movie,
            rating: rating
        });
    }
    res.render('ratings', { title: "Movies Rated By You", ratings });
});

router.get('/recommendations', async (req, res) => {
    const movies = await Movie.getMovieList(await new User(req.session.email).getRecommendations());
    res.render('similar-movie-list', { title: "Your Personalized Recommendations", movies });
});

router.post('/watchlist/:id?', async (req, res) => {
    const imdbId = req.params.id;
    const user = new User(req.session.email);
    if (await user.movieInWatchlist(imdbId))
        await user.removeFromWatchlist(imdbId);
    else
        await user.addToWatchList(imdbId);
    res.redirect(`/movies/id/${req.params.id}`);
});

router.post('/rate/:id?', async (req, res) => {
    await new User(req.session.email).setRating(req.params.id, req.body.rating);
    res.redirect(`/movies/id/${req.params.id}`);
});

router.post('/review/:id?', async (req, res) => {
    await new User(req.session.email).addReview(req.params.id, req.body.review);
    res.redirect(`/movies/id/${req.params.id}`);
})


module.exports = router;