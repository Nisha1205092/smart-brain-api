const fetch = require('node-fetch');
const Clarifai = require('clarifai');
const USER_ID = 'nisha-1205092';
// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = 'c2a459add0d445a085463d2bac09df1a';
const APP_ID = 'my-general-image-recognition';
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'general-image-recognition';
const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';    
const IMAGE_URL = 'https://image.shutterstock.com/image-photo/isolated-shot-young-handsome-male-260nw-762790210.jpg';

const handleImage = (req, res, db) => {
	const {id} = req.body;
	db('users').where('id', '=', id)
  	.increment('entries', 1)
  	.returning('entries')
	.then(entries => {
		res.json(entries[0].entries);
	})
	.catch(err => res.status(400).json('unable to get entries'));
}

const handleApiCall = (req, res) => {
	// ---------------clafifai related code
	const raw = JSON.stringify({
	 user_app_id : {
	   user_id: USER_ID,
	   app_id: APP_ID
	 },
	 inputs: [
	   {
	     data: {
	       image: {
	         url: req.body.input //Andrei said to use 'input' instead of imageUrl. It gives an error
	       },
	     },
	   },
	 ],
	});

    const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
    };

    fetch("https://api.clarifai.com/v2/models/f76196b43bbd45c99b4f3cd8e8b40a8a/outputs", requestOptions)
      .then(response => response.json())
      .then(result => {
      	if (result) {
      		res.json(result);
      	}
      })
      .catch(err => console.log('error working with the API')) 
      // ---------------clafifai related code
}

module.exports = {
	handleApiCall: handleApiCall, 
	handleImage: handleImage
}