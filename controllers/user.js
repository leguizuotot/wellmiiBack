
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var user = require ('../models/user');
var settings = require('../settings');

//***********************************************************************
//************************* HTTP Status Codes ***************************
/*  
http://www.restapitutorial.com/httpstatuscodes.html
	200 OK											400 Bad Request
	201 Created										401 Unauthorized
	202 Accepted									402 Payment Required
	203 Non-Authoritative Information				403 Forbidden
	204 No Content-Type	##no sale en el RES##		404 Not Found
	205 Reset Content								405 Method Not Allowed
*/
//***********************************************************************
//***********************************************************************

function errMessage(res, err) {
	console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err}]))
	res.writeHead(500, {'Content-Type':'application/json'});
	res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err}]));
	res.end();
}

//***********************************************************************
//************************* Register a new user *************************
// creates an account for the new user and links the taxId of the reference used for login. It returns the user ownAccessToken, profile and linked TaxIds

module.exports.registerWithEmail = function(email, password, req, res) {	
	console.log('#Backend_msg module.exports.registerWithEmail controller called');

	user.findUserByEmail(email, function (searchedProfile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(searchedProfile).length > 0) 
			{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Email already registered, try to log in with password'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Email already registered, try to log in with password'} ));
				res.end();
			}
			else{
				user.createUserWithEmail(email, password, function (newProfile, err){
					if (err) {
						errMessage(res, err);
					}
					else{
						// SAME CODE AS IN MODULE module.exports.sendValidationEmail = function(email, req, res) {
						user.findUserByEmail(email, function (profile, err) {
							if(err) {
								errMessage(res, err);
							}
							else{
								if (Object.keys(profile).length == 1 && profile[0].email) {
									var mailOptions = {
					    				from: settings.mail.accountActivation.mailOptions.from,
					    				to: profile[0].email,
					    				subject: settings.mail.accountActivation.mailOptions.from,
					    				text: mailBodyValidation(profile[0].email),
					    				html: mailBodyValidationHTML(profile[0].email),
									};

									var transporter = nodemailer.createTransport({
					        			service: settings.mail.accountActivation.transporter.service,
					        			auth: {
					            			user: settings.mail.accountActivation.transporter.auth.user,
					            			pass: settings.mail.accountActivation.transporter.auth.pass
					        			}
					      			})			

									transporter.sendMail(mailOptions, function(err, info){
					    				if(err){
					        				errMessage(res, err);
					    				}
					    				else{
					        				console.log(JSON.stringify( {status: 200, statusDescription: 'Registered succesfully. We\'ve sent you an email so you can activate your account. Please check your inbox', info} ));
											res.writeHead(200, {'Content-Type':'application/json'});
											res.write(JSON.stringify( {status: 200, statusDescription: 'Registered succesfully. We\'ve sent you an email so you can activate your account. Please check your inbox', info} ));
											res.end();

					    				};
									})
								}
								else{
									console.log(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
									res.writeHead(404, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
									res.end();
								}
							}
						})
						// END OF SAME CODE					
					}
				})
			}
		}
	})
}

module.exports.sendValidationEmail = function(email, req, res) {
    console.log('#Backend_msg module.exports.sendValidationEmail controller called');
    console.log('#Backend_msg email: ' + email);
	user.findUserByEmail(email, function (profile, err) {
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) {
				var mailOptions = {
    				from: settings.mail.accountActivation.mailOptions.from,
    				to: profile[0].email,
    				subject: settings.mail.accountActivation.mailOptions.from,
    				text: mailBodyValidation(profile[0].email),
    				html: mailBodyValidationHTML(profile[0].email),
				};

				var transporter = nodemailer.createTransport({
        			service: settings.mail.accountActivation.transporter.service,
        			auth: {
            			user: settings.mail.accountActivation.transporter.auth.user,
            			pass: settings.mail.accountActivation.transporter.auth.pass
        			}
      			})			

				transporter.sendMail(mailOptions, function(err, info){
    				if(err){
        				errMessage(res, err);
    				}
    				else{
        				console.log(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email so you can activate your account. Please check your inbox', info} ));
						res.writeHead(200, {'Content-Type':'application/json'});
						res.write(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email so you can activate your account. Please check your inbox', info} ));
						res.end();

    				};
				})
			}
			else{
				console.log(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.end();
			}
		}
	})
}

function mailBodyValidation(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 600000 });
	var link = settings.domains.home + '/users/register/getEmailValidated/?validationToken=' + ownAccessToken

	var text = 	'Go to this link to activate your account: ' + link
	return text;
}
				
function mailBodyValidationHTML(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 600000 });
	var link = settings.domains.home + '/users/register/getEmailValidated/?validationToken=' + ownAccessToken

	var html = 	'<!DOCTYPE html><html><body>' + 
				'<a href="' + link + '">Click here to activate your account.</a>' + 
				'</body></html>';
	return html;
}

module.exports.validateLocalEmail = function(email, req, res) {	
	console.log('#Backend_msg module.exports.validateLocalEmail controller called');
	user.findUserByEmail(email, function (profile, err){
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) {
				user.validateUserMail(profile[0].userId, function (profile, err){
					if(err) {
						errMessage(res, err);
					}
					else{
						console.log(JSON.stringify( {status: 200, statusDescription: 'Email validated correctly, you can now log in'} ));
						res.writeHead(200, {'Content-Type':'application/json'});
						res.write(JSON.stringify( {status: 200, statusDescription: 'Email validated correctly, you can now log in'} ));
						res.end();
					}
				})
			}
			else{
				console.log(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.end();
			}
		}
	})
}

//***********************************************************************
//************************* Reseting password ***************************


module.exports.resetPasswordInstructions = function(email, req, res) {	
	console.log('#Backend_msg module.exports.resetPasswordInstructions controller called');
	console.log('#Backend_msg email:' + email);
	user.findUserByEmail(email, function (profile, err){
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) 
			{
				sendMailResetPasswordInstructions(email, res);
			}
			else{
				console.log(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.end();
			}
		}
	})
}

function sendMailResetPasswordInstructions(email, res) {
	console.log('#Backend_msg function sendMailResetPasswordInstructions called');
	console.log('#Backend_msg email:' + email);

	var mailOptions = {
    	from: settings.mail.accountActivation.mailOptions.from,
    	to: email,
    	subject: settings.mail.accountActivation.mailOptions.from,
    	text: mailBodyResetPassword(email),
    	html: mailBodyResetPasswordHTML(email),
	};

	var transporter = nodemailer.createTransport({
		service: settings.mail.accountActivation.transporter.service,
		auth: {
   			user: settings.mail.accountActivation.transporter.auth.user,
   			pass: settings.mail.accountActivation.transporter.auth.pass
		}
	})			

	transporter.sendMail(mailOptions, function(err, info){
		if(err){
			errMessage(res, err);
		}
    	else{
    		console.log(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email with instructions to reset your password. Please check your inbox', info} ));
			res.writeHead(200, {'Content-Type':'application/json'});
			res.write(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email with instructions to reset your password. Please check your inbox', info} ));
			res.end();
    	};
	})
}

function mailBodyResetPassword(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 900 });
	var link = settings.domains.home + '/users/register/local/getNewPassword?validationToken=' + ownAccessToken

	var text = 	'If you\'ve forgoten your password click this link so we can send you a new password to your email account (available for 5 minutes). ' + link
	return text;
}
				
function mailBodyResetPasswordHTML(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 900 });
	var link = settings.domains.home + '/users/register/local/getNewPassword?validationToken=' + ownAccessToken

	var html = 	'<!DOCTYPE html><html><body>' + 
				'<a href="' + link + '">If you\'ve forgoten your password click this link so we can send you a new password to your email account (available for 5 minutes).</a>' + 
				'</body></html>';
	return html;
}

module.exports.setNewPassword = function(email, req, res) {	
	console.log('#Backend_msg module.exports.setNewPassword controller called');
	console.log('#Backend_msg email: ' + email);

	user.findUserByEmail(email, function (profile, err){
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) 
			{
				user.createNewPassword(profile[0].userId, function (info, err){
					if(err) {
						errMessage(res, err);
					}
					else{
						console.log('info.password: ' + info.password);
						sendMailNewPassword(email, info.password, res);
					}
				})
			}
			else{
				console.log(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'User not found or no email registered'} ));
				res.end();
			}
		}
	})
}

function sendMailNewPassword(email, newPassword, res) {
	console.log('#Backend_msg function sendMailResetPasswordInstructions called');
	console.log('#Backend_msg email:' + email);
	console.log('#Backend_msg newPassword:' + newPassword);
	var mailOptions = {
    	from: settings.mail.accountActivation.mailOptions.from,
    	to: email,
    	subject: settings.mail.accountActivation.mailOptions.from,
    	text: mailBodyNewPassword(newPassword),
    	html: mailBodyNewPasswordHTML(newPassword),
	};

	var transporter = nodemailer.createTransport({
		service: settings.mail.accountActivation.transporter.service,
		auth: {
   			user: settings.mail.accountActivation.transporter.auth.user,
   			pass: settings.mail.accountActivation.transporter.auth.pass
		}
	})			

	transporter.sendMail(mailOptions, function(err, info){
		if(err){
			errMessage(res, err);
		}
    	else{
    		console.log(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email with your new password. Please check your inbox', info} ));
			res.writeHead(200, {'Content-Type':'application/json'});
			res.write(JSON.stringify( {status: 200, statusDescription: 'We\'ve sent you an email with your new password. Please check your inbox', info} ));
			res.end();
    	};
	})
}

function mailBodyNewPassword(newPassword) {

	var text = 	'Your new password is: ' + newPassword + ' please remember to change your password from the app to set a password easy to remember'
	return text;
}
				
function mailBodyNewPasswordHTML(newPassword) {

	var html = 	'<!DOCTYPE html><html><body>' + 
				'Your new password is: ' + newPassword + ' please remember to change your password from the app to set a password easy to remember' + 
				'</body></html>';
	return html;
}

//***********************************************************************
//************************* Login  LOCAL with email *********************
// Validates username and password and returns the user ownAccessToken, profile and linked TaxIds

module.exports.loginLocal = function(email, password, req, res) {	
	console.log('#Backend_msg module.exports.loginLocal  controller called');
	console.log('#Backend_msg email: ' + email);
	console.log('#Backend_msg email: ' + password);
	user.findUserByEmail(email, function (profile, err){
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) {
				if(profile[0].emailVerified) {
					if(bcrypt.compareSync(password, profile[0].hashPassword)) {
								
							var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
							
							console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
							res.writeHead(200, {'Content-Type':'application/json'});
							res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
							res.end();	
					}
					else {
						console.log(JSON.stringify( {status: 401, statusDescription: 'Invalid password'} ));
						res.writeHead(401, {'Content-Type':'application/json'});
						res.write(JSON.stringify( {status: 401, statusDescription: 'Invalid password'} ));
						res.end();
					}
				}
				else{
					console.log(JSON.stringify( {status: 401, statusDescription: 'Validate you email to be able to log in'} ));
					res.writeHead(401, {'Content-Type':'application/json'});
					res.write(JSON.stringify( {status: 401, statusDescription: 'Validate you email to be able to log in'} ));
					res.end();
				}
			}
			else{
				if (Object.keys(profile).length == 0) {
					console.log(JSON.stringify( {status: 404, statusDescription: 'User not found'} ));
					res.writeHead(404, {'Content-Type':'application/json'});
					res.write(JSON.stringify( {status: 404, statusDescription: 'User not found'} ));
					res.end();
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'No object or data integration error, more than 1 ibject where there should be 0 or 1. user.findUserByEmail(email, function (profile, err). Mail: ' + email}]))
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'No object or data integration error, more than 1 ibject where there should be 0 or 1. user.findUserByEmail(email, function (profile, err). Mail: ' + email}]));
					res.end();
				}
			}
		}
	})
}


//***********************************************************************
//************************* Register with Facebook **********************

module.exports.loginFacebook = function(userFacebook, req, res) {
	console.log('#Backend_msg module.exports.loginFacebook controller called');
	console.log('#Backend_msg userFacebook: ' + userFacebook);

	user.findUserByFacebook(userFacebook.facebookId, function (profile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) 
			{
				var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					user.createUserWithFacebook(userFacebook, function (newUser, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByFacebook(userFacebook.facebookId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									console.log(profile);

									var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
									console.log(ownAccessToken);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByFacebook(userFacebook.facebookId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByFacebook(userFacebook.facebookId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginLinkingFacebook = function(userFacebook, userId, req, res) {
	console.log('#Backend_msg module.exports.loginFacebook controller called');
	console.log('#Backend_msg userFacebook: ' + userFacebook);
	console.log('#Backend_msg userId: ' + userId);

	//Hay que controlar cuando el userId es uno mismo

	user.findUserByFacebook(userFacebook.facebookId, function (previousProfile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				user.findUserByUserId(userId, function (actualProfile, err){
					if(err){
						errMessage(res, err);
					}
					else{
						if (Object.keys(actualProfile).length == 1) {
							if(		(previousProfile.email == null || actualProfile.email == null || previousProfile.email == actualProfile.email)
								&&	(previousProfile.facebookId == null || actualProfile.facebookId == null || previousProfile.facebookId == actualProfile.facebookId)
								&&	(previousProfile.googleId == null || actualProfile.googleId == null || previousProfile.googleId == actualProfile.googleId)
								&&	(previousProfile.twitterId == null || actualProfile.twitterId == null || previousProfile.twitterId == actualProfile.twitterId)
								) {
								// MERGING ACCOUNTS IS POSSIBLE
								user.mergeAccountsByFacebook(userFacebook, actualProfile[0], previousProfile[0], function(info, err){
									if(err){
										errMessage(res, err);
									}
									else {
										user.findUserByUserId(userId, function (profile, err){
											if(err) {
												errMessage(res, err);
											}
											else{
												var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
												console.log(ownAccessToken);
												res.writeHead(200, {'Content-Type':'application/json'});
												res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
												res.end();
											}
										})
									}
								})
							}
							else{ // MERGING ACCOUNTS IS NOT POSSIBLE
								res.writeHead(400, {'Content-Type':'application/json'});
								res.write(JSON.stringify( {status: 400, statusDescription: 'Error, can\'t merge accounts', err: {previousProfile, actualProfile}}));
								res.end();
							}
						}
						else{ //no actual profile found, this should be imposible

						}
					}
				})
			}
			else{
				// si no existia se añade en la cuenta y ya esta
				if(Object.keys(previousProfile).length == 0) {
					user.addFacebookAccount(userFacebook, userId, function (info, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByFacebook(userFacebook.facebookId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										console.log(profile);
										var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
										console.log(ownAccessToken);

										console.log( JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.writeHead(200, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.end();
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'User not found', facebookId : userFacebook.facebookId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'User not found', facebookId : userFacebook.facebookId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByFacebook(userFacebook.facebookId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByFacebook(userFacebook.facebookId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}


module.exports.loginGoogle = function(userGoogle, req, res) {	
	console.log('#Backend_msg module.exports.loginGoogle controller called');
	console.log('#Backend_msg userGoogle: ' + userGoogle);

	user.findUserByGoogle(userGoogle.googleId, function (profile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) 
			{
				var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					user.createUserWithGoogle(userGoogle, function (newProfile, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByGoogle(userGoogle.googleId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);

									console.log(ownAccessToken + '\n'+ profile);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByGoogle(userGoogle.googleId, function (profile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByGoogle(userGoogle.googleId, function (profile, err).'}]));
					res.end();
				}
			}
		}
	})
}           

module.exports.loginLinkingGoogle = function(userGoogle, userId, req, res) {
	console.log('#Backend_msg module.exports.loginGoogle controller called');
	console.log('#Backend_msg userGoogle: ' + userGoogle);
	console.log('#Backend_msg userId: ' + userId);

	//Hay que controlar cuando el userId es uno mismo

	user.findUserByGoogle(userGoogle.googleId, function (previousProfile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				user.findUserByUserId(userId, function (actualProfile, err){
					if(err){
						errMessage(res, err);
					}
					else{
						if (Object.keys(actualProfile).length == 1) {
							if(		(previousProfile.email == null || actualProfile.email == null || previousProfile.email == actualProfile.email)
								&&	(previousProfile.facebookId == null || actualProfile.facebookId == null || previousProfile.facebookId == actualProfile.facebookId)
								&&	(previousProfile.googleId == null || actualProfile.googleId == null || previousProfile.googleId == actualProfile.googleId)
								&&	(previousProfile.twitterId == null || actualProfile.twitterId == null || previousProfile.twitterId == actualProfile.twitterId)
								) {
								// MERGING ACCOUNTS IS POSSIBLE
								user.mergeAccountsByGoogle(userGoogle, actualProfile[0], previousProfile[0], function(info, err){
									if(err){
										errMessage(res, err);
									}
									else {
										user.findUserByUserId(userId, function (profile, err){
											if(err) {
												errMessage(res, err);
											}
											else{
												var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
												console.log(ownAccessToken);
												res.writeHead(200, {'Content-Type':'application/json'});
												res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
												res.end();
											}
										})
									}
								})
							}
							else{ // MERGING ACCOUNTS IS NOT POSSIBLE
								res.writeHead(400, {'Content-Type':'application/json'});
								res.write(JSON.stringify( {status: 400, statusDescription: 'Error, can\'t merge accounts', err: {previousProfile, actualProfile}}));
								res.end();
							}
						}
						else{ //no actual profile found, this should be imposible

						}
					}
				})
			}
			else{
				// si no existia se añade en la cuenta y ya esta
				if(Object.keys(previousProfile).length == 0) {
					user.addGoogleAccount(userGoogle, userId, function (info, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByGoogle(userGoogle.googleId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										console.log(profile);
										var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
										console.log(ownAccessToken);

										console.log( JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.writeHead(200, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.end();
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'User not found', googleId : userGoogle.googleId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'User not found', googleId : userGoogle.googleId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByGoogle(userGoogle.googleId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByGoogle(userGoogle.googleId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginTwitter = function(userTwitter, req, res) {	
	console.log('#Backend_msg module.exports.loginTwitter controller called');
	console.log('#Backend_msg userTwitter: ' + userTwitter);

	user.findUserByTwitter(userTwitter.twitterId, function (profile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) {
				var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					user.createUserWithTwitter(userTwitter, function (newProfile, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByTwitter(userTwitter.twitterId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);

									console.log(ownAccessToken + '\n'+ profile);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByTwitter(userTwitter.twitterId, function (profile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByTwitter(userTwitter.twitterId, function (profile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginLinkingTwitter = function(userTwitter, userId, req, res) {
	console.log('#Backend_msg module.exports.loginTwitter controller called');
	console.log('#Backend_msg userTwitter: ' + userTwitter);
	console.log('#Backend_msg userId: ' + userId);

	//Hay que controlar cuando el userId es uno mismo

	user.findUserByTwitter(userTwitter.twitterId, function (previousProfile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				user.findUserByUserId(userId, function (actualProfile, err){
					if(err){
						errMessage(res, err);
					}
					else{
						if (Object.keys(actualProfile).length == 1) {
							if(		(previousProfile.email == null || actualProfile.email == null || previousProfile.email == actualProfile.email)
								&&	(previousProfile.facebookId == null || actualProfile.facebookId == null || previousProfile.facebookId == actualProfile.facebookId)
								&&	(previousProfile.googleId == null || actualProfile.googleId == null || previousProfile.googleId == actualProfile.googleId)
								&&	(previousProfile.twitterId == null || actualProfile.twitterId == null || previousProfile.twitterId == actualProfile.twitterId)
								) {
								// MERGING ACCOUNTS IS POSSIBLE
								user.mergeAccountsByTwitter(userTwitter, actualProfile[0], previousProfile[0], function(info, err){
									if(err){
										errMessage(res, err);
									}
									else {
										user.findUserByUserId(userId, function (profile, err){
											if(err) {
												errMessage(res, err);
											}
											else{
												var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
												console.log(ownAccessToken);
												res.writeHead(200, {'Content-Type':'application/json'});
												res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
												res.end();
											}
										})
									}
								})
							}
							else{ // MERGING ACCOUNTS IS NOT POSSIBLE
								res.writeHead(400, {'Content-Type':'application/json'});
								res.write(JSON.stringify( {status: 400, statusDescription: 'Error, can\'t merge accounts', err: {previousProfile, actualProfile}}));
								res.end();
							}
						}
						else{ //no actual profile found, this should be imposible

						}
					}
				})
			}
			else{
				// si no existia se añade en la cuenta y ya esta
				if(Object.keys(previousProfile).length == 0) {
					user.addTwitterAccount(userTwitter, userId, function (info, err){
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							user.findUserByTwitter(userTwitter.twitterId, function (profile, err){
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										console.log(profile);
										var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt);
										console.log(ownAccessToken);

										console.log( JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.writeHead(200, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
										res.end();
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'User not found', twitterId : userTwitter.twitterId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'User not found', twitterId : userTwitter.twitterId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByTwitter(userTwitter.twitterId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model user.findUserByTwitter(userTwitter.twitterId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}
       

module.exports.refreshOwnAccessToken = function(userId, req, res) {	
	console.log('#Backend_msg module.exports.refreshAccessToken controller called');
	console.log('#Backend_msg userId: ' + userId);


	user.findUserByuserId(userId, function (profile, err){
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) //si ya existia hay que comprobar si las cuentas pueden combinarse
			{
				var ownAccessToken = jwt.sign({ userId:  profile[0].userId}, settings.secretKeys.jwt , { expiresIn: 1200000 });
				console.log(ownAccessToken);
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', user: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				console.log(JSON.stringify( {status: 401, statusDescription: 'Invalid token or session has expired, please log in to create a new session.'} ));
				res.writeHead(401, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 401, statusDescription: 'Invalid token or session has expired, please log in to create a new session.'} ));
				res.end();
			}
		}
	})
}    