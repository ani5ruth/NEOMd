const executeQuery = require('./db/Neo4jApi').executeQuery;

module.exports = class User {
    constructor(email) {
        this.email = email;
    }

    // sets details of given email to create user object
    async  getDetails() {
        const response = await executeQuery(
            'MATCH (u:User{email : $email})\
            RETURN u.name, u.password',
            { email: this.email }
        );
        this.name = response.records[0]._fields[0];
        this.password = response.records[0]._fields[1];
    }

    // returns rating of user of a given movie (if movie not rated returns null)
    async  getRating(imdbId) {
        const response = await executeQuery(
            'MATCH (u:User{email : $email})-[r:RATED]->(m:Movie {imdbId : $imdbId})\
            RETURN r.rating',
            { email: this.email, imdbId }
        );
        return response.records.length == 0 ? null : response.records[0]._fields[0];
    }

    // sets rating for a given movie given by user
    async  setRating(imdbId, rating) {
        await executeQuery(
            'MATCH(u:User {email : $email}), (m:Movie {imdbId : $imdbId })\
            MERGE(u)-[r :RATED]->(m) SET r.rating = $rating',
            { email: this.email, imdbId, rating }
        );
    }

    // removes rating set by user for a movie
    async  removeRating(imdbId) {
        await executeQuery(
            'MATCH(:User {email : $email})-[r:RATED]->(:Movie {imdbId : $imdbId }) \
            DELETE r',
            { email: this.email, imdbId }
        );
    }

    // get all ratings of a user (returns json arr: {movie, rating})
    async  getAllRated() {
        const response = await executeQuery(
            'MATCH (:User{email : $email})-[r:RATED]->(m:Movie)\
            RETURN collect([m.imdbId, r.rating])',
            { email: this.email }
        );

        return response.records[0]._fields[0];
    }

    // return a boolean that indicates whether a movie is in watchlist or not
    async  movieInWatchlist(imdbId) {
        const response = await executeQuery(
            'MATCH(u :User {email : $email})-[r:WATCHLISTED]->(m :Movie {imdbId : $imdbId })\
            RETURN r',
            { email: this.email, imdbId }
        );
        return response.records.length != 0;
    }

    // returns a list of movies in users watchlist(returns null if no movie watchlisted) 
    async  getWatchlist() {
        const response = await executeQuery(
            'MATCH(u :User {email : $email})-[r:WATCHLISTED]->(m :Movie)\
            RETURN collect(m.imdbId)',
            { email: this.email }
        );

        return response.records[0]._fields[0];
    }

    // creates watchlisted relationship with a movie and user 
    async  addToWatchList(imdbId) {
        await executeQuery(
            'MATCH(u:User {email : $email}), (m:Movie {imdbId : $imdbId })\
            MERGE(u)-[r:WATCHLISTED]->(m)',
            { email: this.email, imdbId }
        );
    }

    // removes watchlisted relationship of user with a movie
    async  removeFromWatchlist(imdbId) {
        await executeQuery(
            'MATCH(u:User {email : $email})-[r:WATCHLISTED]->(m:Movie {imdbId : $imdbId })\
            DELETE r',
            { email: this.email, imdbId }
        );
    }

    async addReview(imdbId, review) {
        await executeQuery(
            'MATCH(u:User{email : $email}), (m:Movie{imdbId : $imdbId})\
            MERGE (u)-[r:REVIEWED{review : $review}]->(m)',
            { email: this.email, imdbId, review }
        );
    }

    // genreate recommendations based on ratings
    async  getRecommendations() {
        const response = await executeQuery(
            'MATCH(u:User {email : $email})-[r:RATED]->(m:Movie)\
            WHERE toInteger(r.rating) >= 3\
            WITH m.imdbId AS imdbId, rand() as random\
            ORDER BY random LIMIT 5\
            RETURN collect(imdbId)',
            { email: this.email }
        );

        // for each seed movie generate 10 similar movies
        const recommendations = [];
        if (response.records.length != 0) {
            for (const id of response.records[0]._fields[0]) {
                const response = await executeQuery(
                    'MATCH (sim:Movie) WHERE NOT (:User {email : $email})-[:RATED]->(sim)\
                MATCH (curr:Movie { imdbId : $id })-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(sim)\
                WITH curr, sim, COUNT(*) AS commonGenres\
                OPTIONAL MATCH(curr)<-[: DIRECTED]-(d:Director)-[:DIRECTED]->(sim)\
                WITH curr, sim, commonGenres, COUNT(d) AS commonDirectors\
                OPTIONAL MATCH(curr)<-[: ACTED_IN]-(a: Actor)-[:ACTED_IN]->(sim)\
                WITH curr, sim, commonGenres, commonDirectors, COUNT(a) AS commonActors\
                WITH sim.imdbId AS id, (3 * commonGenres) + (5 * commonDirectors) + (2 * commonActors) AS Similarity\
                ORDER BY Similarity DESC LIMIT 5\
                RETURN collect(id)',
                    { email: this.email, id }
                );
                response.records[0]._fields[0].forEach(movie => recommendations.push(movie));
            }
        }
        return recommendations;
    }

    // returns boolean if email already taken
    static async emailExists(email) {
        const response = await executeQuery(
            'MATCH (u: User {email: $email}) RETURN u',
            { email }
        );
        return response.records.length != 0;
    }

    // add user to db
    static async  addUser(user) {
        await executeQuery(
            'CREATE (u:User {email : $email, name : $name, password : $password})',
            user
        );
    }

    static async  test() {
    }
}

