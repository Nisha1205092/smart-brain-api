// CREATE TABLE users(
// 	id serial PRIMARY KEY,
// 	name VARCHAR(100),
// 	email text UNIQUE NOT NULL,
// 	entries INT DEFAULT 0,
// 	joined TIMESTAMP NOT NULL
// );

// CREATE TABLE login(
// 	id serial PRIMARY KEY,
// 	email text UNIQUE NOT NULL,
// 	hash text UNIQUE NOT NULL
// );

const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password } = req.body;
	if (!email || !name || !password) {
		console.log(`name: ${name} email: ${email} password: ${password}`);
		return res.status(400).json('empty field submission');
	}
	const hash = bcrypt.hashSync(password);
	console.log('hash ', hash);

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
}
module.exports = {
	handleRegister
}