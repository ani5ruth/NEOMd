const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '123456'));

async function executeQuery(query, params) {
    const session = driver.session();
    try {
        const response = await session.run(query, params);
        session.close();
        return response;
    } catch (error) {
        session.close();
        console.log(error);
    }
}

module.exports = { executeQuery };