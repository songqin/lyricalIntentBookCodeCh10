// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var config = require('./config'),
	http = require('http'),
	socketio = require('socket.io'),
	express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	flash = require('connect-flash'),
	passport = require('passport'),
	cloudinary = require('cloudinary'),
	multer = require('multer');

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

// Define the Express configuration method
module.exports = function(db) {
	// Create a new Express application instance
	var app = express();
	
	// Create a new HTTP server
    var server = http.createServer(app);

    // Create a new Socket.io server
    var io = socketio.listen(server);

	// Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}

	// Use the 'body-parser' and 'method-override' middleware functions
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Configure the MongoDB session storage
	var mongoStore = new MongoStore({
        db: db.connection.db
    });

	// Configure the 'session' middleware
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: mongoStore
	}));

	// Set the application view engine and 'views' folder
	app.set('views', './app/views');
	app.set('view engine', 'ejs');

	// Configure the flash messages middleware
	app.use(flash());

	// Configure the Passport middleware
	app.use(passport.initialize());
	app.use(passport.session());

	//configure cloudinary 
	cloudinary.config({
	    cloud_name: 'dqevqceyc', 
	      api_key: '443513514397748',   
	      api_secret: 'lprAeS7gCHRibLkpY5ZGpMcAbBo'
	  });
	process.env.CLOUDINARY_URL = 'cloudinary://443513514397748:lprAeS7gCHRibLkpY5ZGpMcAbBo@dqevqceyc';
	if (typeof(process.env.CLOUDINARY_URL)=='undefined'){
	  console.warn('!! cloudinary config is undefined !!');
	  console.warn('export CLOUDINARY_URL or set dotenv file');
	}else{
	  console.log('cloudinary config:');
	  console.log(cloudinary.config());
	}

	//configure multer
	var done=false;
	// var uploads = require('../app/controllers/uploads.server.controller');
	var User = require('mongoose').model('User');
  	var rand = Math.random();
	//https://github.com/expressjs/multer
	app.use(multer({
	    // ************enable this one for Development***********
	    dest: './client/assets/images/uploads/',

	    rename: function (fieldname, filename) {
	      return filename+"-"+rand;
	     },
	    limits: {
	      fieldNameSize: 100,//Max field name size
	      files: 20,//For multipart forms, the max number of file fields	
	      fields: 5,//Max number of non-file fields
	      fileSize: 500000//500kB: For multipart forms, the max file size (in bytes)	
	     },
	    onFileUploadStart: function (file) {
	      console.log(file.originalname + ' is starting ...');
	     },
	    onFileUploadComplete: function (file, req, res) {
	      console.log(file.fieldname + ' uploaded to  ' + file.path);
	      // console.log('req.body is: ' + req.body);
	      // console.log('files.file.name' + req.files.file.name);
	      // console.log('file.name ' + file.name);
	      // console.log('file.path ' + file.path);
	      // console.log( 'req.user.id:' + req.user.id);
	      // uploads.uploadToCloud(file, req);
	      done=true;
	    }		
	}));

	app.post('/api/uploads', function(req, res){
		if(done===true){
				//upload image to cloudinary
			cloudinary.uploader.upload(
				req.files.file.path,//file.path: file path on the server, need to delete folder files
				function(result) { 
			        // var upload = new Upload({
		         //        public_id: result.public_id
		         //    });
		            // upload.creator = req.user;
		            // console.log('result.url ' + result.url);
		            //cloudinary url for thumb profile image
					var newUrl = cloudinary.url(result.public_id, {width: 100, height: 100, crop:'thumb', gravity: 'face', radius: '25'});
					// console.log('newUrl: ' + newUrl);
					User.findById(req.user.id).exec(function(err, user) {
						if (err) {
							// Use the error handling method to get the error message
							var message = getErrorMessage(err);
							// Set the flash messages
							req.flash('error', message);
							return res.redirect('/');
						}
						// console.log('cloud: result.url:' + result.url);
						user.profileUrl = newUrl;
						user.save(function(err) {
							if (err) {
								// Use the error handling method to get the error message
								var message = getErrorMessage(err);
								// Set the flash messages
								req.flash('error', message);
								return res.redirect('/');
							}

						});
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
		return res.redirect('/');
		}

	});

	// Load the routing files
	require('../app/routes/index.server.routes.js')(app);
	require('../app/routes/users.server.routes.js')(app);
	require('../app/routes/articles.server.routes.js')(app);
	require('../app/routes/uploads.server.routes.js')(app);

	// Configure static file serving
	app.use(express.static('./public'));

	// Load the Socket.io configuration
	require('./socketio')(server, io, mongoStore);
	
	// Return the Server instance
	return server;
};