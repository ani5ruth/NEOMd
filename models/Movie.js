const executeQuery = require('./db/Neo4jApi').executeQuery;

module.exports = class Movie {
    constructor(id) {
        this.id = id;
    }

    setPoster() {
        let poster_id = "";
        for (var i = 0; i < this.id.length; i++) {
            if (this.id[i] != '0') {
                poster_id = this.id.substring(i);
                break;
            }
        }
        this.poster = '/images/' + poster_id + '.jpg';
    }

    // set details of given imdbid to build object
    async getDetails() {
        const response = await executeQuery(
            'MATCH (m:Movie {imdbId : $id})\
             RETURN m.title, m.runtime, m.year, m.plot, m.poster',
            { id: this.id }
        );

        const fields = response.records[0]._fields;
        this.title = fields[0];
        this.runtime = fields[1].low;
        this.year = fields[2].low;
        this.plot = fields[3];
        this.rating = await this.getAvgRating();
        this.setPoster();
    }

    // return list of movie objects corresponding the given list of imdbIds
    static async getMovieList(ids) {
        const movies = [];
        ids.forEach(id => movies.push(new Movie(id)));
        for (const movie of movies) await movie.getDetails();

        return movies;
    }

    // return list of genres of movie
    async getGenre() {
        const response = await executeQuery(
            'MATCH (m:Movie {imdbId : $id})-[:IN_GENRE]->(g:Genre)\
            RETURN collect(g.name)',
            { id: this.id }
        );

        return response.records[0]._fields[0];
    }

    // returns average rating of movie (out of 5)
    async getAvgRating() {
        const response = await executeQuery(
            'MATCH (:Movie {imdbId : $id})<-[r:RATED]->(:User)\
            RETURN AVG(toInt(r.rating))',
            { id: this.id }
        );

        return response.records[0]._fields[0].toFixed(2);
    }

    // return director/s of movie
    async getDirector() {
        const response = await executeQuery(
            'MATCH (m:Movie {imdbId : $id})<-[:DIRECTED]-(d:Director)\
            RETURN collect(d.name)',
            { id: this.id }
        );

        return response.records[0]._fields[0];
    }

    // returns cast of  movie
    async getCast() {
        const response = await executeQuery(
            'MATCH (m:Movie {imdbId : $id})<-[:ACTED_IN]-(a:Actor)\
            RETURN collect(a.name)',
            { id: this.id }
        );

        return response.records[0]._fields[0];
    }

    // returns movies similar to this movie
    async getSimilar(limit) {
        const response = await executeQuery(
            'MATCH (curr :Movie { imdbId: $id })-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(sim :Movie)\
            WITH curr, sim, COUNT(*) AS commonGenres\
            OPTIONAL MATCH(curr)<-[: DIRECTED]-(d:Director)-[:DIRECTED]-> (sim)\
            WITH curr, sim, commonGenres, COUNT(d) AS commonDirectors\
            OPTIONAL MATCH(curr)<-[: ACTED_IN]-(a: Actor)-[:ACTED_IN]->(sim)\
            WITH curr, sim, commonGenres, commonDirectors, COUNT(a) AS commonActors\
            WITH sim.imdbId AS id, (3 * commonGenres) + (5 * commonDirectors) + (2 * commonActors) AS Similarity\
            ORDER BY Similarity DESC\
            LIMIT $limit\
            RETURN collect(id)',
            { id: this.id, limit }
        );

        return await Movie.getMovieList(response.records[0]._fields[0]);
    }

    async getReviews(limit) {
        const response = await executeQuery(
            'MATCH(u:User)-[r:REVIEWED]->(m:Movie{imdbId : $imdbId})\
            RETURN collect([u.email, r.review])\
            LIMIT $limit',
            { imdbId: this.id, limit }
        );
        return response.records[0]._fields[0];
    }

    // returns all time popular movie
    static async getPopularMovies(limit) {
        const response = await executeQuery(
            'MATCH (m :Movie)<-[:RATED]-(:User)\
            WITH m.imdbId as imdbId, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(imdbId)',
            { limit }
        );
        return await Movie.getMovieList(response.records[0]._fields[0]);
    }

    // returns popular movies of given year
    static async getPopularMoviesByYear(year, limit) {
        const response = await executeQuery(
            'MATCH(m :Movie {year : $year})<-[:RATED]-(:User)\
            WITH m.imdbId as imdbId, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(imdbId)',
            { year, limit }
        );
        return await Movie.getMovieList(response.records[0]._fields[0]);
    }

    static async getYears() {
        const response = await executeQuery(
            'MATCH (m:Movie)\
            WITH DISTINCT m.year AS year ORDER BY year DESC\
            RETURN COLLECT(year)'
        );
        return response.records[0]._fields[0];
    }

    static async test() {
    }
}