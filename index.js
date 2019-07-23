console.log("starting up!!");

const express = require('express');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'yixin',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

// Init express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


const redirectPokemons = (req, res) => {
  // query database for all pokemon
    res.redirect( '/pokemons' );
}

const showPokemons = (req, res) => {
  // query database for all pokemon
    const queryString = 'SELECT * from pokemons';
    pool.query(queryString, (err, result) => {

        if (err) {
            console.error('query error:', err.stack);
            res.send( 'query error' );
        }
        else {
            //console.log('query result:', result);
            // redirect to home page
            // respond with text that lists the names of all the pokemons
            res.send( result.rows );
        }
    });
}
const addPokemonForm = (req,res) => {
    let form = `
    <form method="POST" action="/pokemons">
        <label>Name:</label><input type="text" name="name"></input><br>
        <label>Image Link:</label><input type="text" name="img"></input><br>
        <label>Weight:</label><input type="text" name="weight"></input><br>
        <label>Height:</label><input type="text" name="height"></input><br>
        <button type="submit">Add Pokemon</button>
    </form>
    `
    res.send(form)
}

const addPokemon = (req,res) =>{
    let input = req.body;
    let values = [input.name, input.img, input.weight, input.height];
    const queryString = 'INSERT INTO pokemons (name,img,weight,height) VALUES ($1,$2,$3,$4)';
    pool.query(queryString, values, (err, result) => {
        if (err) {
            console.error('query error:', err.stack);
            res.send( 'query error' );
        }
        else {
            res.redirect('/pokemons');
        }
    });
};

const showPokemon = (req, res) => {
    let pokemonID = [req.params.id];
  // query database for all pokemon
    const queryString = 'SELECT * from pokemon WHERE id = $1';
    pool.query(queryString, pokemonID, (err, result) => {

        if (err) {
            console.error('query error:', err.stack);
            res.send( 'query error' );
        }
        else {
            res.send( result.rows );
        }
    });
}

app.get('/', redirectPokemons);

app.get('/pokemons', showPokemons);

app.get('/pokemons/add', addPokemonForm);

app.post('/pokemons', addPokemon);

app.get('/pokemons/:id', showPokemon);
// boilerplate for listening and ending the program

const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function(){

  console.log("closing");

  server.close(() => {

    console.log('Process terminated');

    pool.end( () => console.log('Shut down db connection pool'));
  })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);
