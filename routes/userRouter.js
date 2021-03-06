const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const User = require('../models/User');

router.get('/watchlist', async (req, res) => {
    const user = new User(req.session.email);
    await user.getDetails();

    res.render('movie-list', {
        title: "Your Watchlist",
        header: `${user.name}'s Watchlist`,
        movies: await Movie.getMovieList(await user.getWatchlist())
    });
});

router.get('/ratings', async (req, res) => {
    const user = new User(req.session.email);
    await user.getDetails();

    const ratings = [];
    for (const record of await user.getAllRated()) {
        const movie = new Movie(record[0]);
        await movie.getDetails();
        const rating = parseInt(record[1]);
        ratings.push({
            movie: movie,
            rating: rating
        });
    }
    res.render('ratings', {
        title: "Movies Rated By You",
        header: `${user.name}'s Ratings`,
        ratings
    });
});

router.get('/recommendations', async (req, res) => {
    const user = new User(req.session.email);
    await user.getDetails();

    res.render('movie-list', {
        title: "Recommendations",
        header: `Recommendations`,
        movies: await Movie.getMovieList(await user.getRecommendations())
    });
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