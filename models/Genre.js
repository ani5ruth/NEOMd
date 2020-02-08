const executeQuery = require('./db/Neo4jApi').executeQuery;

module.exports = class Genre {
    constructor(name) {
        this.name = name;
    }

    async getPopularMovies(limit) {
        const response = await executeQuery(
            'MATCH(:Genre { name: $name })<-[:IN_GENRE]-(m :Movie)<-[:RATED]-(:User)\
            WITH m.imdbId as imdbId, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(imdbId)',
            { name: this.name, limit }
        );

        return await response.records[0]._fields[0];
    }

    static getGenreList(names) {
        const genres = [];
        names.forEach(name => genres.push(new Genre(name)));
        return genres;
    }

    static async getAllGenres() {
        const response = await executeQuery(
            'MATCH (g:Genre) return collect (g.name)'
        );
        return Genre.getGenreList(response.records[0]._fields[0]);
    }

    static async test() {
        const action = new Genre('Animation');
        console.log(await action.getPopularMovies(5));
        console.log(Genre.getGenreList(["Action", "Crime", "Thriller"]));
    }
}