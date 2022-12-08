const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const image = require('./controllers/image');
const profile = require('./controllers/profile');
const PORT = process.env.PORT || 3031;

//for Render
const db = knex({
  client: 'pg',
  connection: {
  	//connectionString: 'dpg-ce12ahg2i3mkuce8j94g-a.singapore-postgres.render.com',
  	connectionString: process.env.DATABASE_URL, 
  	ssl: {rejectUnauthorized: false},	
    host : process.env.DATABASE_HOST,
    port : 5432,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PW,
    database : process.env.DATABSE_DB
  }
});

// for heroku
// const db = knex({
//   client: 'pg',
//   connection: {
//     connectionString: process.env.DATABASE_URL,
//     ssl: false,
//   },
// });

// db.select('*').from('users')
// 	.then(data => {
// 		console.log(data);
// 	}); //shows the current data in 'users' table 

const app = express();

//instead of body-parser
//to make req.body work properly
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send('success');
})

app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})

app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})

app.get('/profile/:id', (req, res) => {profile.handleProfile(req, res, db)})

app.put('/image', (req, res) => {image.handleImage(req, res, db)})

app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})


app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
})