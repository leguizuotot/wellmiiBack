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




// **************************************************************************
// **************************************************************************
// **************************************************************************
// FUNCIONES PARA TABLA DE USUARIOS   [dbo].[zzz_app_dm_user]
// **************************************************************************


// CREA UN USUARIO CON ESTRATEGIA LOCAL UTILIZANDO EL CORREO ELECTRÓNICO Y GENERA UN TOKEN UNICO DE USUARIO
module.exports.createUserWithEmail = function(email, password, callback) {	
	
	console.log('#Backend_msg module.exports.createUserWithEmail model called');

	var userId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		userId = uuid.v1();
		console.log(userId);
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
		
				.input('userId', sqlDB.NVarChar, userId)
				.input('email', sqlDB.NVarChar, email)
				.input('hashPassword', sqlDB.NVarChar, hashPassword)
				.query(	'INSERT INTO [dbo].[zzz_app_dm_user] (isActive, lastModified, userId, email, hashPassword) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @userId, @email, @hashPassword)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(data,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createUserWithEmail');
		            console.log(err);
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createUserWithEmail');
        console.log(err);
        callback(null, err);
	});

}

module.exports.createNewPassword = function(userId, callback) {	
	
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
				.input('userId', sqlDB.NVarChar, userId)
				.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
						'SET 	lastModified = convert(varchar(24), getdate(), 121), ' + 
						'		hashPassword = @hashPassword ' +
						'WHERE userId = @userId and isActive = 1'
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
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createNewPassword');
        console.log(err);
        callback(null, err);
	});
}

module.exports.validateUserMail = function(userId, callback) {	
	
	console.log('#Backend_msg module.exports.validateUserMail model called');

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
		
				.input('userId', sqlDB.NVarChar, userId)
				.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' +
						'emailVerified = convert(varchar(24), getdate(), 121) ' +
						'WHERE userId = @userId and isActive = 1'
						)

				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(data,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.validateUserMail');
		            console.log(err);
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.validateUserMail');
        console.log(err);
        callback(null, err);
	});

}


module.exports.createUserWithFacebook = function(userFacebook, callback) {	
	console.log('#Backend_msg module.exports.createUserWithFacebook model called');

	var userId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		userId = uuid.v1();
		console.log(userId);
	})
	.then(function() {
		console.log('#Backend_msg Connection opened');
				console.log(userFacebook)
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
			
				.input('userId', sqlDB.NVarChar, userId)
				.input('facebookToken', sqlDB.NVarChar, userFacebook.facebookToken)
				.input('facebookId', sqlDB.NVarChar, userFacebook.facebookId)			
				.input('facebookDisplayName', sqlDB.NVarChar, userFacebook.facebookDisplayName)
				.query(	'INSERT INTO [dbo].[zzz_app_dm_user] (isActive, lastModified, userId, facebookId, facebookToken, facebookDisplayName) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @userId, @facebookId, @facebookToken, @facebookDisplayName)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(data,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createUserWithFacebook');
		            console.log(err);
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createUserWithFacebook');
        console.log(err);
        callback(null, err);
	});

}

module.exports.addFacebookAccount = function(userFacebook, userId, callback) {	
	console.log('#Backend_msg module.exports.addFacebookAccount model called');
	console.log('#Backend_msg userFacebook: ' + userFacebook);
	console.log('#Backend_msg userId: ' + userId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(userFacebook)
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
		.input('userId', sqlDB.NVarChar, userId)
		.input('facebookToken', sqlDB.NVarChar, userFacebook.facebookToken)
		.input('facebookId', sqlDB.NVarChar, userFacebook.facebookId)			
		.input('facebookDisplayName', sqlDB.NVarChar, userFacebook.facebookDisplayName)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		facebookId = @facebookId, ' +
				' 		facebookToken = @facebookToken, ' +
				' 		facebookDisplayName = @facebookDisplayName ' +
				'WHERE userId = @userId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(data,null);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addFacebookAccount');
	        console.log(err);
	        callback(null, err);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addFacebookAccount');
        console.log(err);
        callback(null, err);
	});
}

module.exports.mergeAccountsByFacebook = function(userFacebook, actualProfile, previousProfile, callback) {	
	console.log('#Backend_msg module.exports.mergeAccountsByFacebook model called');
	console.log('#Backend_msg userFacebook: ' + userFacebook);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('userId', sqlDB.NVarChar, previousProfile.userId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.userId)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ' +
				' 		transferedTo = @transferedTo ' +
				'WHERE userId = @userId'
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
			.input('userId', sqlDB.NVarChar, actualProfile.userId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, userFacebook.facebookId)
			.input('facebookToken', sqlDB.NVarChar, userFacebook.facebookToken)

			.input('googleId', sqlDB.NVarChar, actualProfile.googleId || previousProfile.googleId)
			.input('googleToken', sqlDB.NVarChar, actualProfile.googleToken || previousProfile.googleToken)

			.input('twitterId', sqlDB.NVarChar, actualProfile.twitterId || previousProfile.twitterId)
			.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookId, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE userId = @userId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(data,null);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByFacebook updating actualProfile');
	            console.log(err);
	            callback(null, err);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByFacebook updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(null, err);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByFacebook');
        console.log(err);
        callback(null, err);
	});
}

module.exports.createUserWithGoogle = function(userGoogle, callback) {	
	console.log('#Backend_msg module.exports.createUserWithGoogle model called');

	var userId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		userId = uuid.v1();
		console.log(userId);
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
		
				.input('userId', sqlDB.NVarChar, userId)
				.input('googleToken', sqlDB.NVarChar, userGoogle.googleToken)
				.input('googleId', sqlDB.NVarChar, userGoogle.googleId)			
				.input('googleDisplayName', sqlDB.NVarChar, userGoogle.googleDisplayName)
				.input('googleGender', sqlDB.NVarChar, userGoogle.googleGender)
				.query(	'INSERT INTO [dbo].[zzz_app_dm_user] (isActive, lastModified, userId, googleToken, googleId, googleDisplayName, googleGender) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @userId, @googleToken, @googleId, @googleDisplayName, @googleGender)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(data,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createUserWithGoogle');
		            console.log(err);
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createUserWithGoogle');
        console.log(err);
        callback(null, err);
	});
}


module.exports.addGoogleAccount = function(userGoogle, userId, callback) {	
	console.log('#Backend_msg module.exports.addgoogleAccount model called');
	console.log('#Backend_msg userGoogle: ' + userGoogle);
	console.log('#Backend_msg userId: ' + userId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(userGoogle)
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
		.input('userId', sqlDB.NVarChar, userId)
		.input('googleToken', sqlDB.NVarChar, userGoogle.googleToken)
		.input('googleId', sqlDB.NVarChar, userGoogle.googleId)			
		.input('googleDisplayName', sqlDB.NVarChar, userGoogle.googleDisplayName)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		googleId = @googleId, ' +
				' 		googleToken = @googleToken, ' +
				' 		googleDisplayName = @googleDisplayName ' +
				'WHERE userId = @userId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(data,null);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addgoogleAccount');
	        console.log(err);
	        callback(null, err);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addgoogleAccount');
        console.log(err);
        callback(null, err);
	});
}

module.exports.mergeAccountsByGoogle = function(userGoogle, actualProfile, previousProfile, callback) {	

	console.log('#Backend_msg module.exports.mergeAccountsByGoogle model called');
	console.log('#Backend_msg userGoogle: ' + userGoogle);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('userId', sqlDB.NVarChar, previousProfile.userId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.userId)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ' +
				' 		transferedTo = @transferedTo ' +
				'WHERE userId = @userId'
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
			.input('userId', sqlDB.NVarChar, actualProfile.userId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, actualProfile.facebookId || previousProfile.facebookId)
			.input('facebookToken', sqlDB.NVarChar, actualProfile.facebookToken || previousProfile.facebookToken)

			.input('googleId', sqlDB.NVarChar, userGoogle.googleId)
			.input('googleToken', sqlDB.NVarChar, userGoogle.googleToken)

			.input('twitterId', sqlDB.NVarChar, actualProfile.twitterId || previousProfile.twitterId)
			.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookToken, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE userId = @userId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(data,null);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByGoogle updating actualProfile');
	            console.log(err);
	            callback(null, err);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByGoogle updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(null, err);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByGoogle');
        console.log(err);
        callback(null, err);
	});

}




module.exports.createUserWithTwitter = function(userTwitter, callback) {	
	console.log('#Backend_msg module.exports.createUserWithTwitter model called');

	var userId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		userId = uuid.v1();
		console.log(userId);
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

				.input('userId', sqlDB.NVarChar, userId)
				.input('twitterId', sqlDB.NVarChar, userTwitter.twitterId)
				.input('twitterName', sqlDB.NVarChar, userTwitter.twitterName)
				.input('twitterScreen_name', sqlDB.NVarChar, userTwitter.twitterScreen_name)
				.input('twitterLocation', sqlDB.NVarChar, userTwitter.twitterLocation)
				.input('twitterFollowers_count', sqlDB.NVarChar, userTwitter.twitterFollowers_count)
				.input('twitterFriends_count', sqlDB.NVarChar, userTwitter.twitterFriends_count)
				.input('twitterTime_zone', sqlDB.NVarChar, userTwitter.twitterTime_zone)
				.input('twitterStatuses_count', sqlDB.NVarChar, userTwitter.twitterStatuses_count)
				.input('twitterLang', sqlDB.NVarChar, userTwitter.twitterLang)
				.input('twitterProfile_image_url_https', sqlDB.NVarChar, userTwitter.twitterProfile_image_url_https)

				.query(	'INSERT INTO [dbo].[zzz_app_dm_user] (isActive, lastModified, userId, twitterId, twitterScreen_name, twitterLocation, twitterProfile_image_url_https) ' +
						'VALUES (1, convert(varchar(24), getdate(), 121), @userId, @twitterId, @twitterScreen_name, @twitterLocation, @twitterProfile_image_url_https)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed');
			        console.log(data);
			        callback(data,null);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.createUserWithTwitter');
		            console.log(err);
		            callback(null, err);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.createUserWithTwitter');
        console.log(err);
        callback(null, err);
	});
}

module.exports.addTwitterAccount = function(userGoogle, userId, callback) {	

	console.log('#Backend_msg module.exports.addTwitterAccount model called');
	console.log('#Backend_msg userTwitter: ' + userTwitter);
	console.log('#Backend_msg userId: ' + userId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
		console.log(userTwitter)
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
		.input('userId', sqlDB.NVarChar, userId)
		.input('twitterId', sqlDB.NVarChar, userTwitter.twitterId)			
		.input('twitterScreenName', sqlDB.NVarChar, userTwitter.twitterScreenName)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		twitterId = @twitterId, ' +
				' 		twitterScreenName = @twitterScreenName ' +
				'WHERE userId = @userId'
				)
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(data,null);
		})
	    .catch(function(err) {
	        sqlDB.close();
			console.log('#Backend_msg Connection closed with query error module.exports.addTwitterAccount');
	        console.log(err);
	        callback(null, err);
		});	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.addTwitterAccount');
        console.log(err);
        callback(null, err);
	});

}

module.exports.mergeAccountsByTwitter = function(userTwitter, actualProfile, previousProfile, callback) {	

	console.log('#Backend_msg module.exports.mergeAccountsByTwitter model called');
	console.log('#Backend_msg userTwitter: ' + userTwitter);
	console.log('#Backend_msg actualProfile: ' + actualProfile);
	console.log('#Backend_msg previousProfile: ' + previousProfile);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');

		new sqlDB.Request()
		.input('userId', sqlDB.NVarChar, previousProfile.userId)
		.input('transferedTo', sqlDB.NVarChar, actualProfile.userId)
		.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
				'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
				' 		isActive = 0 ' +
				' 		transferedTo = @transferedTo ' +
				'WHERE userId = @userId'
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
			.input('userId', sqlDB.NVarChar, actualProfile.userId)
			.input('email', sqlDB.NVarChar, actualProfile.email || previousProfile.email)
			.input('emailVerified', sqlDB.NVarChar, actualProfile.emailVerified || previousProfile.emailVerified)
			.input('hashPassword', sqlDB.NVarChar, actualProfile.hashPassword || previousProfile.hashPassword)

			.input('facebookId', sqlDB.NVarChar, actualProfile.facebookId || previousProfile.facebookId)
			.input('facebookToken', sqlDB.NVarChar, actualProfile.facebookToken || previousProfile.facebookToken)

			.input('googleId', sqlDB.NVarChar, actualProfile.googleId || previousProfile.googleId)
			.input('googleToken', sqlDB.NVarChar, actualProfile.googleToken || previousProfile.googleToken)

			.input('twitterId', sqlDB.NVarChar, userTwitter.twitterId)
			.query(	'UPDATE [dbo].[zzz_app_dm_user] ' +
					'SET 	lastModified = convert(varchar(24), getdate(), 121), ' +
					' 		email = @email, ' +
					' 		emailVerified = @emailVerified, ' +
					' 		hashPassword = @hashPassword, ' +
					'		facebookId = @facebookId, ' +
					' 		facebookToken = @facebookToken, ' +
					' 		googleId = @googleId, ' +
					' 		googleToken = @googleToken, ' +
					' 		twitterId = @twitterId ' +
					'WHERE userId = @userId'
					)
		// ************************************
		// ***************************
			.then(function(data) {
				sqlDB.close();
	        	console.log('#Backend_msg Connection closed');
	        	console.log(data);
	        	callback(data,null);
			})
			.catch(function(err) {
				 sqlDB.close();
	            console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByTwitter updating actualProfile');
	            console.log(err);
	            callback(null, err);
			});
	    })
	    .catch(function(err) {
            sqlDB.close();
	        console.log('#Backend_msg Connection closed with query error module.exports.mergeAccountsByTwitter updating isActive to 0 in previousProfile');
	        console.log(err);
	        callback(null, err);
		});
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.mergeAccountsByTwitter');
        console.log(err);
        callback(null, err);
	});

}


//devuelve el perfil del usuario a partir del correo electronico. SOLO PARA EL LOGIN
module.exports.findUserByEmail = function(email, callback) {

	console.log('#Backend_msg module.exports.findUserByEmail model called');
	console.log('#Backend_msg email: ' + email);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('email', sqlDB.NVarChar, email)
	    .query('select * from [dbo].[zzz_app_dm_user] where isActive = 1 and email = @email')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        //console.log('#Backend_msg items retrieved :' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findUserByEmail ' + email);
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByEmail ' + email);
        console.log(err);
        callback(null, err);
	});
}

module.exports.findUserByFacebook = function(facebookId, callback) {

	console.log('#Backend_msg module.exports.findUserByFacebook model called');
	console.log('#Backend_msg facebookId: ' + facebookId);

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('facebookId', sqlDB.NVarChar, facebookId)
	    .query('select * from [dbo].[zzz_app_dm_user] where isActive = 1 and facebookId = @facebookId')
		
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
            console.log('#Backend_msg Connection closed with error module.exports.findUserByFacebook');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByFacebook');
        console.log(err);
        callback(null, err);
	});
}

module.exports.findUserByGoogle = function(googleId, callback) {

	console.log('#Backend_msg module.exports.findUserByGoogle model called');
	console.log(googleId);
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('googleId', sqlDB.NVarChar, googleId)
	    .query('select * from [dbo].[zzz_app_dm_user] where isActive = 1 and  googleId = @googleId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved: ' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findUserByGoogle');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByGoogle');
        console.log(err);
        callback(null, err);
	});
}

module.exports.findUserByTwitter = function(twitterId, callback) {

	console.log('#Backend_msg module.exports.findUserByTwitter model called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('twitterId', sqlDB.NVarChar, twitterId)
	    .query('select * from [dbo].[zzz_app_dm_user] where isActive = 1 and twitterId = @twitterId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved: ' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findUserByTwitter');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByTwitter');
        console.log(err);
        callback(null, err);
	});
}


//devuelve el perfil de usuario a partir del id propio de la app NO SIRVE PARA LOGIN
module.exports.findUserByUserId = function(userId, callback) {

	console.log('#Backend_msg module.exports.findUserByUserId called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('userId', sqlDB.NVarChar, userId)
	    .query('select * from [dbo].[zzz_app_dm_user] where isActive = 1 and userId = @userId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved:' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findUserByUserId');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByUserId');
        console.log(err);
        callback(null, err);
	});
}

// **************************************************************************
// **************************************************************************
// **************************************************************************
// FUNCIONES PARA TABLA DE RELACION DE USUARIOS APP Y CIFNIF DE MUSGRAVE
// **************************************************************************


// devuelve los usuarios de app vinculados a un CIFNIF demusgrave
module.exports.findUserByTaxId = function(CD_NIFCIF, callback) {

	console.log('#Backend_msg module.exports.findUserByTaxId called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('CD_NIFCIF', sqlDB.NVarChar, CD_NIFCIF)
	    .query('select * from [dbo].[zzz_app_dm_userNifCif] where CD_NIFCIF = @CD_NIFCIF')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved:' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findUserByTaxId');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findUserByTaxId');
        console.log(err);
        callback(null, err);
	});
}

module.exports.findTaxIdByUser = function(userId, callback) {

	console.log('#Backend_msg module.exports.findTaxIdByUser called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('userId', sqlDB.NVarChar, userId)
	    .query('select * from [dbo].[zzz_app_dm_userNifCif] where userId = @userId')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved:' + Object.keys(data).length);
	        console.log(data);
			callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.findTaxIdByUser');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.findTaxIdByUser');
        console.log(err);
        callback(null, err);
	});
}

//aoscia un TaxID y un usuario de la app para que se pueda incluir en el perfil
module.exports.setUserToTaxId = function(userId, CD_NIFCIF, callback) {

	console.log('#Backend_msg module.exports.setUserToTaxId called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************
	    .input('CD_NIFCIF', sqlDB.NVarChar, CD_NIFCIF)
	    .input('userId', sqlDB.NVarChar, userId)
		.query(	'INSERT INTO [dbo].[zzz_app_dm_userNifCif] (CD_NIFCIF, userId) ' +
				'		VALUES (@CD_NIFCIF, @userId)')
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error module.exports.setUserToTaxId');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.setUserToTaxId');
        console.log(err);
        callback(null, err);
	});
}

// **************************************************************************
// FUNCIONES PARA TABLA DE TOKENS DE ACTIAVACIÓN DE NUEVOS CIF [dbo].[zzz_app_dm_NifCifActivation]
// **************************************************************************

// busca el token y nos devuelve el CIF al que esta asociado
module.exports.findTaxId = function(misnaitRegisterToken, callback) {

	console.log('#Backend_msg module.exports.findTaxId model called');
	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		console.log('#Backend_msg Connection opened');
	    new sqlDB.Request()
	    // ************************************
	    // ************ QUERY *****************

	    .input('misnaitRegisterToken', sqlDB.NVarChar, misnaitRegisterToken)
	    .query('select * from [dbo].[zzz_app_dm_NifCifActivation] where misnaitRegisterToken = @misnaitRegisterToken')
		
		// ************************************
		// ************************************
	    .then(function(data) {
	        sqlDB.close();
	        console.log('#Backend_msg Connection closed');
	        console.log('#Backend_msg items retrieved:' + Object.keys(data).length);
	        console.log(data);
	        callback(data,null);
	    })
	    .catch(function(err) {
            sqlDB.close();
            console.log('#Backend_msg Connection closed with error');
            console.log(err);
            callback(null, err);
	    });
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error');
        console.log(err);
        callback(null, err);
	});
}


