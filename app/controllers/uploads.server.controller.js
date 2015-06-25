// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Upload = mongoose.model('Upload'),
	cloudinary = require('cloudinary'),
	fs = require('fs'),
	User = mongoose.model('User');

// Create a new error handling controller method
var getErrorMessage = function(err) {
	if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) return err.errors[errName].message;
		}
	} else {
		return 'Unknown server error';
	}
};

// exports.upload = function(req, res) {
// 	var imageStream = fs.createReadStream(req.files.image.path, 
// 		{ encoding: 'binary' }),
// 		cloudStream = cloudinary.uploader.upload_stream(function() { 
//     		res.redirect('/'); });
//   		imageStream.on('data', cloudStream.write).on('end', cloudStream.end);
//    };
exports.doNothing = function(req, res){};
exports.uploadToCloud = function(file, req){
	//upload image to cloudinary
	cloudinary.uploader.upload(
		file.path,//file path on the server, need to delete folder files
		function(result) { 
	        // var upload = new Upload({
         //        public_id: result.public_id
         //    });
            // upload.creator = req.user;
            // console.log('result.url ' + result.url);

            //update user data and attach web url for profile image
            // app.route('/api/users/:userId')
            //cloudinary url for thumb profile image
			var newUrl = cloudinary.url(result.public_id, {width: 100, height: 100, crop:'thumb', gravity: 'face', radius: '25'});
			// console.log('newUrl: ' + newUrl);
			User.findById(req.user.id).exec(function(err, user) {
				if (err) console.log('find user error: ' + getErrorMessage(err));
				else if (!user) console.log('find user error: no user: ' + getErrorMessage(err));
				else {
					console.log('cloud: result.url:' + result.url);
					user.profileUrl = newUrl;
					user.save(function(err) {
						if (err) {
							console.log('profile image update error: ' + getErrorMessage(err));
						} else {
							// Send a JSON representation of the article 
							console.log('profile image updated');
						}
					});
				}
			});			

			// console.log(req.user.id);
	 	}    
		// ,{
		// 	// public_id:req.files.file.name, 
		// 	crop: 'limit',
		// 	width: 2000,
		// 	height: 2000,
		// 	eager: [
		// 	{ width: 200, height: 200, crop: 'thumb', gravity: 'face',
		// 	  radius: 20, effect: 'sepia' },
		// 	{ width: 100, height: 150, crop: 'fit', format: 'png' }
		// 	],                                     
		// 	tags: ['special', 'for_homepage']
		// }

	);

};

exports.downloadFromCloud = function(req, res){

};
