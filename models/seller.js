var sqlDB = require ('mssql');
var bcrypt = require('bcryptjs');
var uuid = require('uuid');

var settings = require ('../settings');

// ***********************************************
// ********** DATA TYPES EQUIVALENCE *************
/*		JS Data Type To SQL Data Type Map
		String -> sql.NVarChar
		Number -> sql.Int
		Boolean -> sql.Bit
		Date -> sql.DateTime
		Buffer -> sql.VarBinary
		sql.Table -> sql.TVP
*/

// **************************************************************************
// **************************************************************************

sellerTable = ' [dbo].[zzz_app_dm_seller] ';


// **************************************************************************
// **************************************************************************
// **************************************************************************
// FUNCIONES PARA TABLA DE VENDEDORES   
// **************************************************************************


// CREA UN USUARIO CON ESTRATEGIA LOCAL UTILIZANDO EL CORREO ELECTRÓNICO Y GENERA UN TOKEN UNICO DE USUARIO
module.exports.createSellerWithEmail = function(email, password, callback) {	
	
	console.log('#Backend_msg module.exports.createSellerWithEmail model called');

	var sellerId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		sellerId = uuid.v1();
		console.log(sellerId);
	})
	.then(function() {
		console.log('#Backend_msg Connection opened');
		
				console.log(password);
				var hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(9));
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
		
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.input('email', sqlDB.NVarChar, email)
				.input('hashPassword', sqlDB.NVarChar, hashPassword)
				.query(	'INSERT INTO ' + sellerTable + ' (isActive, lastModified, sellerId, email, hashPassword) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @sellerId, @email, @hashPassword)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createSellerWithEmail');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createSellerWithEmail');
        console.log(err);
        callback(err, null);
	});

}

module.exports.createNewPassword = function(sellerId, callback) {	
	
	console.log('#Backend_msg module.exports.createNewPassword model called');

	var values = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789i';
	var newPassword = ''
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)))
		+ values.charAt(Math.floor(Math.random() * (values.length-1)));

	var hashPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(9));

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
				.input('hashPassword', sqlDB.NVarChar, hashPassword)
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.query(	'UPDATE ' + sellerTable + ' ' +
						'SET 	lastModified = convert(varchar(24), getdate(), 121), ' + 
						'		hashPassword = @hashPassword ' +
						'WHERE sellerId = @sellerId and isActive = 1'
						)
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        var isUpdated = {
			        	data : data,
			        	password : newPassword
			        }
			        console.log(isUpdated);
			        callback(isUpdated,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createNewPassword');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createNewPassword');
        console.log(err);
        callback(err, null);
	});
}

module.exports.validateSellerMail = function(sellerId, callback) {	
	
	console.log('#Backend_msg module.exports.validateSellerMail model called');

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
		
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.query(	'UPDATE ' + sellerTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' +
						'emailVerified = convert(varchar(24), getdate(), 121) ' +
						'WHERE sellerId = @sellerId and isActive = 1'
						)

				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.validateSellerMail');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.validateSellerMail');
        console.log(err);
        callback(err, null);
	});

}


module.exports.createSellerWithFacebook = function(sellerFacebook, callback) {	
	console.log('#Backend_msg module.exports.createSellerWithFacebook model called');

	var sellerId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		sellerId = uuid.v1();
		console.log(sellerId);
	})
	.then(function() {
		console.log('#Backend_msg Connection opened');
				console.log(sellerFacebook)
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
			
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.input('facebookToken', sqlDB.NVarChar, sellerFacebook.facebookToken)
				.input('facebookId', sqlDB.NVarChar, sellerFacebook.facebookId)			
				.input('facebookDisplayName', sqlDB.NVarChar, sellerFacebook.facebookDisplayName)
				.query(	'INSERT INTO ' + sellerTable + ' (isActive, lastModified, sellerId, facebookId, facebookToken, facebookDisplayName) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @sellerId, @facebookId, @facebookToken, @facebookDisplayName)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createSellerWithFacebook');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createSellerWithFacebook');
        console.log(err);
        callback(err, null);
	});

}

module.exports.addFacebookAccount = function(sellerFacebook, sellerId, callback) {	
	console.log('#Backend_msg module.exports.addFacebookAccount model called');
	console.log('#Backend_msg sellerFacebook: ' + sellerFacebook);
	console.log('#Backend_msg sellerId: ' + sellerId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(sellerFacebook)
	    new sqlDB.Request()
		// ************************************
	    // ************ QUERY *****************
		/*
		JS Data Type To SQL Data Type Map
			String -> sql.NVarChar
			Number -> sql.Int
			Boolean -> sql.Bit
			Date -> sql.DateTime
			Buffer -> sql.VarBinary
			sql.Table -> sql.TVP
		*/		
		.input('sellerId', sqlDB.NVarChar, sellerId)
		.input('facebookToken', sqlDB.NVarChar, sellerFacebook.facebookToken)
		.input('facebookId', sqlDB.NVarChar, sellerFacebook.facebookId)			
		.input('facebookDisplayName', sqlDB.NVarChar, sellerFacebook.facebookDisplayName)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		facebookId = @facebookId, ' +
				' 		facebookToken = @facebookToken, ' +
				' 		facebookDisplayName = @facebookDisplayName ' +
				'WHERE sellerId = @sellerId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(null,data);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addFacebookAccount');
	        console.log(err);
	        callback(err, null);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addFacebookAccount');
        console.log(err);
        callback(err, null);
	});
}

module.exports.mergeAccountsByFacebook = function(sellerFacebook, actualProfile, previousProfile, callback) {	
	console.log('#Backend_msg module.exports.mergeAccountsByFacebook model called');
	console.log('#Backend_msg sellerFacebook: ' + sellerFacebook);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('sellerId', sqlDB.NVarChar, previousProfile.sellerId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.sellerId)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ,' +
				' 		transferedTo = @transferedTo ' +
				'WHERE sellerId = @sellerId'
				)
	    .then(function() {
			new sqlDB.Request()
			// ************************************
			// ************ QUERY *****************			
			/*  HACEN LO MISMO PERO EL IF NO SE PEUDE METER EN CUALQUIER LADO
				var googleId =  actualProfile.googleId ? actualProfile.googleId : previousProfile.googleId;
				var googleId =  actualProfile.googleId || previousProfile.googleId;
				var googleId =  if(actualProfile.googleId) 	{return actualProfile.googleId} else {return previousProfile.googleId};
			*/
			.input('sellerId', sqlDB.NVarChar, actualProfile.sellerId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, sellerFacebook.facebookId)
			.input('facebookToken', sqlDB.NVarChar, sellerFacebook.facebookToken)

			.input('googleId', sqlDB.NVarChar, actualProfile.googleId || previousProfile.googleId)
			.input('googleToken', sqlDB.NVarChar, actualProfile.googleToken || previousProfile.googleToken)

			.input('twitterId', sqlDB.NVarChar, actualProfile.twitterId || previousProfile.twitterId)
			.query(	'UPDATE ' + sellerTable + ' ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookId, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE sellerId = @sellerId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(null,data);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByFacebook updating actualProfile');
	            console.log(err);
	            callback(err, null);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByFacebook updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(err, null);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByFacebook');
        console.log(err);
        callback(err, null);
	});
}

module.exports.createSellerWithGoogle = function(sellerGoogle, callback) {	
	console.log('#Backend_msg module.exports.createSellerWithGoogle model called');

	var sellerId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		sellerId = uuid.v1();
		console.log(sellerId);
	})
	.then(function() {
		console.log('#Backend_msg Connection opened');
		
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
		
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.input('googleToken', sqlDB.NVarChar, sellerGoogle.googleToken)
				.input('googleId', sqlDB.NVarChar, sellerGoogle.googleId)			
				.input('googleDisplayName', sqlDB.NVarChar, sellerGoogle.googleDisplayName)
				.input('googleGender', sqlDB.NVarChar, sellerGoogle.googleGender)
				.query(	'INSERT INTO ' + sellerTable + ' (isActive, lastModified, sellerId, googleToken, googleId, googleDisplayName, googleGender) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @sellerId, @googleToken, @googleId, @googleDisplayName, @googleGender)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createSellerWithGoogle');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createSellerWithGoogle');
        console.log(err);
        callback(err, null);
	});
}


module.exports.addGoogleAccount = function(sellerGoogle, sellerId, callback) {	
	console.log('#Backend_msg module.exports.addgoogleAccount model called');
	console.log('#Backend_msg sellerGoogle: ' + sellerGoogle);
	console.log('#Backend_msg sellerId: ' + sellerId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(sellerGoogle)
	    new sqlDB.Request()
		// ************************************
	    // ************ QUERY *****************
		/*
		JS Data Type To SQL Data Type Map
			String -> sql.NVarChar
			Number -> sql.Int
			Boolean -> sql.Bit
			Date -> sql.DateTime
			Buffer -> sql.VarBinary
			sql.Table -> sql.TVP
		*/		
		.input('sellerId', sqlDB.NVarChar, sellerId)
		.input('googleToken', sqlDB.NVarChar, sellerGoogle.googleToken)
		.input('googleId', sqlDB.NVarChar, sellerGoogle.googleId)			
		.input('googleDisplayName', sqlDB.NVarChar, sellerGoogle.googleDisplayName)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		googleId = @googleId, ' +
				' 		googleToken = @googleToken, ' +
				' 		googleDisplayName = @googleDisplayName ' +
				'WHERE sellerId = @sellerId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(null,data);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addgoogleAccount');
	        console.log(err);
	        callback(err, null);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addgoogleAccount');
        console.log(err);
        callback(err, null);
	});
}

module.exports.mergeAccountsByGoogle = function(sellerGoogle, actualProfile, previousProfile, callback) {	

	console.log('#Backend_msg module.exports.mergeAccountsByGoogle model called');
	console.log('#Backend_msg sellerGoogle: ' + sellerGoogle);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('sellerId', sqlDB.NVarChar, previousProfile.sellerId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.sellerId)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ,' +
				' 		transferedTo = @transferedTo ' +
				'WHERE sellerId = @sellerId'
				)
	    .then(function() {
			new sqlDB.Request()
			// ************************************
			// ************ QUERY *****************			
			/*  HACEN LO MISMO PERO EL IF NO SE PEUDE METER EN CUALQUIER LADO
				var googleId =  actualProfile.googleId ? actualProfile.googleId : previousProfile.googleId;
				var googleId =  actualProfile.googleId || previousProfile.googleId;
				var googleId =  if(actualProfile.googleId) 	{return actualProfile.googleId} else {return previousProfile.googleId};
			*/
			.input('sellerId', sqlDB.NVarChar, actualProfile.sellerId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, actualProfile.facebookId || previousProfile.facebookId)
			.input('facebookToken', sqlDB.NVarChar, actualProfile.facebookToken || previousProfile.facebookToken)

			.input('googleId', sqlDB.NVarChar, sellerGoogle.googleId)
			.input('googleToken', sqlDB.NVarChar, sellerGoogle.googleToken)

			.input('twitterId', sqlDB.NVarChar, actualProfile.twitterId || previousProfile.twitterId)
			.query(	'UPDATE ' + sellerTable + ' ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookToken, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE sellerId = @sellerId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(null,data);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByGoogle updating actualProfile');
	            console.log(err);
	            callback(err, null);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByGoogle updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(err, null);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByGoogle');
        console.log(err);
        callback(err, null);
	});

}




module.exports.createSellerWithTwitter = function(sellerTwitter, callback) {	
	console.log('#Backend_msg module.exports.createSellerWithTwitter model called');

	var sellerId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		sellerId = uuid.v1();
		console.log(sellerId);
	})
	.then(function() {
		console.log('#Backend_msg Connection opened');
		
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/

				.input('sellerId', sqlDB.NVarChar, sellerId)
				.input('twitterId', sqlDB.NVarChar, sellerTwitter.twitterId)
				.input('twitterName', sqlDB.NVarChar, sellerTwitter.twitterName)
				.input('twitterScreen_name', sqlDB.NVarChar, sellerTwitter.twitterScreen_name)
				.input('twitterLocation', sqlDB.NVarChar, sellerTwitter.twitterLocation)
				.input('twitterFollowers_count', sqlDB.NVarChar, sellerTwitter.twitterFollowers_count)
				.input('twitterFriends_count', sqlDB.NVarChar, sellerTwitter.twitterFriends_count)
				.input('twitterTime_zone', sqlDB.NVarChar, sellerTwitter.twitterTime_zone)
				.input('twitterStatuses_count', sqlDB.NVarChar, sellerTwitter.twitterStatuses_count)
				.input('twitterLang', sqlDB.NVarChar, sellerTwitter.twitterLang)
				.input('twitterProfile_image_url_https', sqlDB.NVarChar, sellerTwitter.twitterProfile_image_url_https)

				.query(	'INSERT INTO ' + sellerTable + ' (isActive, lastModified, sellerId, twitterId, twitterScreen_name, twitterLocation, twitterProfile_image_url_https) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @sellerId, @twitterId, @twitterScreen_name, @twitterLocation, @twitterProfile_image_url_https)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createSellerWithTwitter');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createSellerWithTwitter');
        console.log(err);
        callback(err, null);
	});
}

module.exports.addTwitterAccount = function(sellerGoogle, sellerId, callback) {	

	console.log('#Backend_msg module.exports.addTwitterAccount model called');
	console.log('#Backend_msg sellerTwitter: ' + sellerTwitter);
	console.log('#Backend_msg sellerId: ' + sellerId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(sellerTwitter)
	    new sqlDB.Request()
		// ************************************
	    // ************ QUERY *****************
		/*
		JS Data Type To SQL Data Type Map
			String -> sql.NVarChar
			Number -> sql.Int
			Boolean -> sql.Bit
			Date -> sql.DateTime
			Buffer -> sql.VarBinary
			sql.Table -> sql.TVP
		*/		
		.input('sellerId', sqlDB.NVarChar, sellerId)
		.input('twitterId', sqlDB.NVarChar, sellerTwitter.twitterId)			
		.input('twitterScreenName', sqlDB.NVarChar, sellerTwitter.twitterScreenName)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		twitterId = @twitterId, ' +
				' 		twitterScreenName = @twitterScreenName ' +
				'WHERE sellerId = @sellerId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(null,data);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addTwitterAccount');
	        console.log(err);
	        callback(err, null);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addTwitterAccount');
        console.log(err);
        callback(err, null);
	});

}

module.exports.mergeAccountsByTwitter = function(sellerTwitter, actualProfile, previousProfile, callback) {	

	console.log('#Backend_msg module.exports.mergeAccountsByTwitter model called');
	console.log('#Backend_msg sellerTwitter: ' + sellerTwitter);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('sellerId', sqlDB.NVarChar, previousProfile.sellerId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.sellerId)
		.query(	'UPDATE ' + sellerTable + ' ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ,' +
				' 		transferedTo = @transferedTo ' +
				'WHERE sellerId = @sellerId'
				)
	    .then(function() {
			new sqlDB.Request()
			// ************************************
			// ************ QUERY *****************			
			/*  HACEN LO MISMO PERO EL IF NO SE PEUDE METER EN CUALQUIER LADO
				var googleId =  actualProfile.googleId ? actualProfile.googleId : previousProfile.googleId;
				var googleId =  actualProfile.googleId || previousProfile.googleId;
				var googleId =  if(actualProfile.googleId) 	{return actualProfile.googleId} else {return previousProfile.googleId};
			*/
			.input('sellerId', sqlDB.NVarChar, actualProfile.sellerId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, actualProfile.facebookId || previousProfile.facebookId)
			.input('facebookToken', sqlDB.NVarChar, actualProfile.facebookToken || previousProfile.facebookToken)

			.input('googleId', sqlDB.NVarChar, actualProfile.googleId || previousProfile.googleId)
			.input('googleToken', sqlDB.NVarChar, actualProfile.googleToken || previousProfile.googleToken)

			.input('twitterId', sqlDB.NVarChar, sellerTwitter.twitterId)
			.query(	'UPDATE ' + sellerTable + ' ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookId, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE sellerId = @sellerId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(null,data);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByTwitter updating actualProfile');
	            console.log(err);
	            callback(err, null);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByTwitter updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(err, null);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByTwitter');
        console.log(err);
        callback(err, null);
	});

}


//devuelve el perfil del usuario a partir del correo electronico. SOLO PARA EL LOGIN
module.exports.findSellerByEmail = function(email, callback) {

	console.log('#Backend_msg module.exports.findSellerByEmail model called');
	console.log('#Backend_msg email: ' + email);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('email', sqlDB.NVarChar, email)
	    .query('select * from ' + sellerTable + ' where isActive = 1 and email = @email')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        //console.log('#Backend_msg items retrieved :' + Object.keys(data).length);
	        console.log(data);
	        callback(null,data);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findSellerByEmail ' + email);
            console.log(err);
            callback(err, null);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findSellerByEmail ' + email);
        console.log(err);
        callback(err, null);
	});
}

module.exports.findSellerByFacebook = function(facebookId, callback) {

	console.log('#Backend_msg module.exports.findSellerByFacebook model called');
	console.log('#Backend_msg facebookId: ' + facebookId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('facebookId', sqlDB.NVarChar, facebookId)
	    .query('select * from ' + sellerTable + ' where isActive = 1 and facebookId = @facebookId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        //console.log('#Backend_msg items retrieved :' + Object.keys(data).length);
	        console.log(data);
	        callback(data, null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findSellerByFacebook');
            console.log(err);
            callback(err, null);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findSellerByFacebook');
        console.log(err);
        callback(err, null);
	});
}

module.exports.findSellerByGoogle = function(googleId, callback) {

	console.log('#Backend_msg module.exports.findSellerByGoogle model called');
	console.log(googleId);
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('googleId', sqlDB.NVarChar, googleId)
	    .query('select * from ' + sellerTable + ' where isActive = 1 and  googleId = @googleId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved: ' + Object.keys(data).length);
	        console.log(data);
	        callback(null,data);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findSellerByGoogle');
            console.log(err);
            callback(err, null);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findSellerByGoogle');
        console.log(err);
        callback(err, null);
	});
}

module.exports.findSellerByTwitter = function(twitterId, callback) {

	console.log('#Backend_msg module.exports.findSellerByTwitter model called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('twitterId', sqlDB.NVarChar, twitterId)
	    .query('select * from ' + sellerTable + ' where isActive = 1 and twitterId = @twitterId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved: ' + Object.keys(data).length);
	        console.log(data);
	        callback(null,data);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findSellerByTwitter');
            console.log(err);
            callback(err, null);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findSellerByTwitter');
        console.log(err);
        callback(err, null);
	});
}


//devuelve el perfil de usuario a partir del id propio de la app NO SIRVE PARA LOGIN
module.exports.findSellerBySellerId = function(sellerId, callback) {

	console.log('#Backend_msg module.exports.findSellerBySellerId called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('sellerId', sqlDB.NVarChar, sellerId)
	    .query('select * from ' + sellerTable + ' where isActive = 1 and sellerId = @sellerId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved:' + Object.keys(data).length);
	        console.log(data);
	        callback(null,data);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findSellerBySellerId');
            console.log(err);
            callback(err, null);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findSellerBySellerId');
        console.log(err);
        callback(err, null);
	});
}

module.exports.setSellerStripeManagedAccount = function(sellerId, accountId, callback) {	
	
	console.log('#Backend_msg module.exports.setSellerStripeManagedAccount model called');

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
			    new sqlDB.Request()
			    // ************************************
			    // ************ QUERY *****************
				/*
				JS Data Type To SQL Data Type Map
					String -> sql.NVarChar
					Number -> sql.Int
					Boolean -> sql.Bit
					Date -> sql.DateTime
					Buffer -> sql.VarBinary
					sql.Table -> sql.TVP
				*/
		
				.input('sellerId', sqlDB.NVarChar, sellerId)
				.input('StripeManagedAccount', sqlDB.NVarChar, accountId)
				.query(	'UPDATE ' + sellerTable +
						'set StripeManagedAccount = @StripeManagedAccount ' +
						'where sellerId = @sellerId '
						)
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.setSellerStripeManagedAccount');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.setSellerStripeManagedAccount');
        console.log(err);
        callback(err, null);
	});

}