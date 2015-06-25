// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var users = require('../../app/controllers/users.server.controller'),
	uploads = require('../../app/controllers/uploads.server.controller');

// Define the routes module' method
module.exports = function(app) {
	// Set up the 'photos' base routes 
	// app.route('/api/photos')
	//    .post(users.requiresLogin, uploads.doNothing);

	// Set up the 'photos' parameterized routes
	// app.route('/api/photos/:photoId')
	//    .get(photos.read)
	//    .put(users.requiresLogin, photos.hasAuthorization, photos.update)
	//    .delete(users.requiresLogin, photos.hasAuthorization, photos.delete);

	// Set up the 'photoId' parameter middleware   
	// app.param('photoId', photos.photoByID);
};