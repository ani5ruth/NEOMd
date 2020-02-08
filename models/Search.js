const executeQuery = require('./db/Neo4jApi').executeQuery;

module.exports = class Search {
    constructor(searchString) {
        this.searchString = searchString;
    }

    async getMovies() {
        const response = await executeQuery(
            'MATCH(m:Movie)<-[:RATED]-(:User)\
            WHERE toLower(m.title) CONTAINS toLower($searchString)\
            WITH m.imdbId as id , COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            RETURN collect(id)',
            { searchString: this.searchString }
        );
        return response.records.length == 0 ? [] : response.records[0]._fields[0];
    }

    async getPersons() {
        const response = await executeQuery(
            'MATCH(a) WHERE (a:Actor) or (a:Director)\
            MATCH (a)-[:ACTED_IN |:DIRECTED]->(m:Movie)<-[:RATED]-(:User)\
            WHERE toLower(a.name) CONTAINS toLower($searchString)\
            WITH a.name as name, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            RETURN collect(name)',
            { searchString: this.searchString }
        );
        return response.records.length == 0 ? [] : response.records[0]._fields[0];
    }
}