const executeQuery = require('./db/Neo4jApi').executeQuery;

module.exports = class Person {
    constructor(name) {
        this.name = name;
    }

    async getPopularMovies(limit) {
        const response = await executeQuery(
            'MATCH(a) WHERE a:Actor OR a:Director\
            MATCH(m:Movie)<-[:ACTED_IN | :DIRECTED]-(a {name : $name})\
            MATCH(m)<-[:RATED]-(:User)\
            WITH m.imdbId AS id, m.title as title, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(id)',
            { name: this.name, limit }
        );
        return await response.records[0]._fields[0];
    }

    static getPersonList(names) {
        const persons = [];
        names.forEach(name => persons.push(new Person(name)));
        return persons;
    }

    static async getPopularDirector(limit) {
        const response = await executeQuery(
            'MATCH (d)-[:DIRECTED]->(m :Movie)<-[:RATED]-(:User)\
            WITH d.name as name, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(name)',
            { limit });

        return Person.getPersonList(response.records[0]._fields[0]);
    }

    static async getPopularActor(limit) {
        const response = await executeQuery(
            'MATCH (d)-[:ACTED_IN]->(m :Movie)<-[:RATED]-(:User)\
            WITH d.name as name, COUNT(*) AS Relevance\
            ORDER BY Relevance DESC\
            LIMIT $limit\
            RETURN collect(name)',
            { limit });

        return Person.getPersonList(response.records[0]._fields[0]);
    }

    static async test() {
        console.log(await Person.getPopularActor(5));
        console.log(await Person.getPopularDirector(5));
    }
}