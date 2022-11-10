const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'aminarahman',
    password : '',
    database : 'smart-brain'
  }
});

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

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
			}
			else {
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const {email, name, password} = req.body;
	const hash = bcrypt.hashSync(password);

	db.transaction(trx => {
		trx.insert({
			hash: hash, 
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0].email,
					name: name, 
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
				
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to register'));
	// res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	// database.users.forEach(user => {
	// 	if (user.id === id) {
	// 		found = true;
	// 		return res.json(user);
	// 	}
	// })
	db.select('*').from('users').where('id', id)
		.then(user => {
			if (user.length) {
				res.json(user[0]);
			}
			else {
				res.status(400).json('Not found')
			}
		})
		.catch(err => res.status(400).json('Error getting user'));
})

app.put('/image', (req, res) => {
	const {id} = req.body;
	db('users').where('id', '=', id)
  	.increment('entries', 1)
  	.returning('entries')
	.then(entries => {
		res.json(entries[0].entries);
	})
	.catch(err => res.status(400).json('unable to get entries'));
})

app.listen(3002, () => {
	console.log('app is running on port 3002');
})