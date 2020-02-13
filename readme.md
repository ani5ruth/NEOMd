# Neo4j Movie Recommendation Web App based on IMDb movies dataset  

## Technology Stack:
- Front End     : Twitter Bootstrap, Pug(templating engine)
- Server Side   : Express.js, Neo4j driver
- Database      : Neo4j

## Installation:
- Install [Neo4j Desktop](https://neo4j.com/)
- Create a new project and create a graph within that project
- Set username to 'neo4j' and password to '123456'
- Extract [dataset](recommendation-system-using-graph-db/docs/dataset/recommendations.db.zip) file to Neo4j %NEO4J_HOME%/data/database/graphdb
- Install [npm](https://www.npmjs.com/) and run the following command inside the root directory  
    - `npm install`  
    - `npm start`
    
## Working:
- Browse movies by - year, genres, actor/directors, search.
- Get info about specific movie and a list of movies similar to it.
- Rate and/or wishlist movies.
- Recommendatios will be genreated based on your ratings.

## Algorithms Used:
- Weighted Similarity Algorithm - computes similar movies based on matching parameters like genres, directors, actors etc.. Weights are used to modify results.
- Random Seed Algorithm - used for generate recommendations for a particular user. Works by selecting random movies(seeds) rated highly(>=3) by user and generating list of similar movies of these seeds using weighted similarity algorithm mentioned above.
- Collaborative Filtering Algorithm - generates similar movies for a given movie by taking into consideration ratings of others movies  given by users who also rated the given movie. 
