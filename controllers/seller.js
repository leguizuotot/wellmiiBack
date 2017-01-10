
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var settings = require('../settings');
var stripeOwn = require ('./stripe');
//models
var seller = require ('../models/seller');



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

function returnSeller(res, sellerId) {

	seller.findSellerBysellerId(sellerId, function (err, profile) {
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) {
				var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
				if (profile[0].stripeManagedAccount != null) {
					stripeOwn.retrieveAccount(profile[0].stripeCustomer,  function (err, account) {
						if(err){
							errMessage(res, err);
						}
						else{
							console.log(JSON.stringify({status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile, stripeProfile: account} } ));
							res.writeHead(200, {'Content-Type':'application/json'});
							res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile, stripeProfile: account} } ));
							res.end();
						}
					});
				}
				else{
					console.log(JSON.stringify({status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile, stripeProfile: null} } ));
					res.writeHead(200, {'Content-Type':'application/json'});
					res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile, stripeProfile: null} } ));
					res.end();
				}
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Seller not found'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Seller not found'} ));
				res.end();
			}
		}		
	});
}

//***********************************************************************
//************************* Register a new seller *************************
// creates an account for the new seller and links the taxId of the reference used for login. It returns the seller ownAccessToken, profile and linked TaxIds

module.exports.registerWithEmail = function(email, password, req, res) {	
	console.log('#Backend_msg module.exports.registerWithEmail controller called');

	seller.findSellerByEmail(email, function (err, searchedProfile) {
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
				seller.createSellerWithEmail(email, password, function (err, newProfile) {
					if (err) {
						errMessage(res, err);
					}
					else{
						// SAME CODE AS IN MODULE module.exports.sendValidationEmail = function(email, req, res) {
						seller.findSellerByEmail(email, function (err, profile) {
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
									console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
									res.writeHead(404, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
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
	seller.findSellerByEmail(email, function (profile, err) {
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
				console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
				res.end();
			}
		}
	})
}

function mailBodyValidation(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 60000000 });
	console.log('email: ' + email);
	console.log('ownAccessToken: ' + ownAccessToken);
	var link = settings.domains.home + '/sellers/register/getEmailValidated/?validationToken=' + ownAccessToken

	var text = 	'Go to this link to activate your account: ' + link
	return text;
}
				
function mailBodyValidationHTML(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 60000000 });
	console.log('email: ' + email);
	console.log('ownAccessToken: ' + ownAccessToken);
	var link = settings.domains.home + '/sellers/register/getEmailValidated/?validationToken=' + ownAccessToken
	var html = 	'<!DOCTYPE html><html><body>' + 
				'<a href="' + link + '">Click here to activate your account.</a>' + 
				'</body></html>';
	return html;
}

module.exports.validateLocalEmail = function(email, req, res) {	
	console.log('#Backend_msg module.exports.validateLocalEmail controller called');
	seller.findSellerByEmail(email, function (err, profile) {
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) {
				seller.validateSellerMail(profile[0].sellerId, function (err, profile) {
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
				console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
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
	seller.findSellerByEmail(email, function (err, profile){
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) 
			{
				sendMailResetPasswordInstructions(email, res);
			}
			else{
				console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
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
	var link = settings.domains.home + '/sellers/register/local/getNewPassword?validationToken=' + ownAccessToken

	var text = 	'If you\'ve forgoten your password click this link so we can send you a new password to your email account (available for 5 minutes). ' + link
	return text;
}
				
function mailBodyResetPasswordHTML(email) {
	var ownAccessToken = jwt.sign({ email:  email}, settings.secretKeys.jwt, { expiresIn: 900 });
	var link = settings.domains.home + '/sellers/register/local/getNewPassword?validationToken=' + ownAccessToken

	var html = 	'<!DOCTYPE html><html><body>' + 
				'<a href="' + link + '">If you\'ve forgoten your password click this link so we can send you a new password to your email account (available for 5 minutes).</a>' + 
				'</body></html>';
	return html;
}

module.exports.setNewPassword = function(email, req, res) {	
	console.log('#Backend_msg module.exports.setNewPassword controller called');
	console.log('#Backend_msg email: ' + email);

	seller.findSellerByEmail(email, function (err, profile) {
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1 && profile[0].email) 
			{
				seller.createNewPassword(profile[0].sellerId, function (err, info) {
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
				console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
				res.writeHead(404, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found or no email registered'} ));
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
// Validates sellername and password and returns the seller ownAccessToken, profile and linked TaxIds

module.exports.loginLocal = function(email, password, req, res) {	
	console.log('#Backend_msg module.exports.loginLocal  controller called');
	console.log('#Backend_msg email: ' + email);
	console.log('#Backend_msg email: ' + password);
	seller.findSellerByEmail(email, function (err, profile) {
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) {
				if(profile[0].emailVerified) {
					if(bcrypt.compareSync(password, profile[0].hashPassword)) {
								
							var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
							
							console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
							res.writeHead(200, {'Content-Type':'application/json'});
							res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
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
					console.log(JSON.stringify( {status: 404, statusDescription: 'Seller not found'} ));
					res.writeHead(404, {'Content-Type':'application/json'});
					res.write(JSON.stringify( {status: 404, statusDescription: 'Seller not found'} ));
					res.end();
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'No object or data integration error, more than 1 ibject where there should be 0 or 1. seller.findSellerByEmail(email, function (profile, err). Mail: ' + email}]))
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'No object or data integration error, more than 1 ibject where there should be 0 or 1. seller.findSellerByEmail(email, function (profile, err). Mail: ' + email}]));
					res.end();
				}
			}
		}
	})
}


//***********************************************************************
//************************* Register with Facebook **********************

module.exports.loginFacebook = function(sellerFacebook, req, res) {
	console.log('#Backend_msg module.exports.loginFacebook controller called');
	console.log('#Backend_msg sellerFacebook: ' + sellerFacebook);

	seller.findSellerByFacebook(sellerFacebook.facebookId, function (err, profile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) 
			{
				var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					seller.createSellerWithFacebook(sellerFacebook, function (err, newSeller) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByFacebook(sellerFacebook.facebookId, function (err, profile) {
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									console.log(profile);

									var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
									console.log(ownAccessToken);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByFacebook(sellerFacebook.facebookId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByFacebook(sellerFacebook.facebookId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginLinkingFacebook = function(sellerFacebook, sellerId, req, res) {
	console.log('#Backend_msg module.exports.loginFacebook controller called');
	console.log('#Backend_msg sellerFacebook: ' + sellerFacebook);
	console.log('#Backend_msg sellerId: ' + sellerId);

	//Hay que controlar cuando el sellerId es uno mismo

	seller.findSellerByFacebook(sellerFacebook.facebookId, function (err, previousProfile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				seller.findSellerBySellerId(sellerId, function (err, actualProfile) {
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
								seller.mergeAccountsByFacebook(sellerFacebook, actualProfile[0], previousProfile[0], function(err, info) {
									if(err){
										errMessage(res, err);
									}
									else {
										seller.findSellerBySellerId(sellerId, function (err, profile) {
											if(err) {
												errMessage(res, err);
											}
											else{
												var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
												console.log(ownAccessToken);
												res.writeHead(200, {'Content-Type':'application/json'});
												res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
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
					seller.addFacebookAccount(sellerFacebook, sellerId, function (err, info) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByFacebook(sellerFacebook.facebookId, function (err, profile) {
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										console.log(profile);
										var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
										console.log(ownAccessToken);

										console.log( JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
										res.writeHead(200, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
										res.end();
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'Seller not found', facebookId : sellerFacebook.facebookId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'Seller not found', facebookId : sellerFacebook.facebookId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByFacebook(sellerFacebook.facebookId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByFacebook(sellerFacebook.facebookId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}


module.exports.loginGoogle = function(sellerGoogle, req, res) {	
	console.log('#Backend_msg module.exports.loginGoogle controller called');
	console.log('#Backend_msg sellerGoogle: ' + sellerGoogle);

	seller.findSellerByGoogle(sellerGoogle.googleId, function (err, profile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) 
			{
				var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					seller.createSellerWithGoogle(sellerGoogle, function (err, newProfile) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByGoogle(sellerGoogle.googleId, function (err, profile) {
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);

									console.log(ownAccessToken + '\n'+ profile);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByGoogle(sellerGoogle.googleId, function (profile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByGoogle(sellerGoogle.googleId, function (profile, err).'}]));
					res.end();
				}
			}
		}
	})
}           

module.exports.loginLinkingGoogle = function(sellerGoogle, sellerId, req, res) {
	console.log('#Backend_msg module.exports.loginGoogle controller called');
	console.log('#Backend_msg sellerGoogle: ' + sellerGoogle);
	console.log('#Backend_msg sellerId: ' + sellerId);

	//Hay que controlar cuando el sellerId es uno mismo

	seller.findSellerByGoogle(sellerGoogle.googleId, function (err, previousProfile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				seller.findSellerBySellerId(sellerId, function (err, actualProfile) {
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
								seller.mergeAccountsByGoogle(sellerGoogle, actualProfile[0], previousProfile[0], function(err, info){
									if(err){
										errMessage(res, err);
									}
									else {
										seller.findSellerBySellerId(sellerId, function (err, profile) {
											if(err) {
												errMessage(res, err);
											}
											else{
												var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
												console.log(ownAccessToken);
												res.writeHead(200, {'Content-Type':'application/json'});
												res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
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
					seller.addGoogleAccount(sellerGoogle, sellerId, function (err, info) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByGoogle(sellerGoogle.googleId, function (err, profile){
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										console.log(profile);
										var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);
										console.log(ownAccessToken);

										console.log( JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
										res.writeHead(200, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
										res.end();
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'Seller not found', googleId : sellerGoogle.googleId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'Seller not found', googleId : sellerGoogle.googleId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByGoogle(sellerGoogle.googleId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByGoogle(sellerGoogle.googleId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginTwitter = function(sellerTwitter, req, res) {	
	console.log('#Backend_msg module.exports.loginTwitter controller called');
	console.log('#Backend_msg sellerTwitter: ' + sellerTwitter);

	seller.findSellerByTwitter(sellerTwitter.twitterId, function (err, profile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(profile).length == 1) {
				var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);

				console.log(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.writeHead(200, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
				res.end();
			}
			else{
				if(Object.keys(profile).length == 0) {
					seller.createSellerWithTwitter(sellerTwitter, function (err, newProfile) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByTwitter(sellerTwitter.twitterId, function (err, profile) {
								if(err){
									errMessage(res, err);
								}
								else{
									//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
									var ownAccessToken = jwt.sign({ sellerId:  profile[0].sellerId}, settings.secretKeys.jwt);

									console.log(ownAccessToken + '\n'+ profile);
									res.writeHead(200, {'Content-Type':'application/json'});
									res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', seller: {ownAccessToken, profile}} ));
									res.end();
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByTwitter(sellerTwitter.twitterId, function (profile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByTwitter(sellerTwitter.twitterId, function (profile, err).'}]));
					res.end();
				}
			}
		}
	})
}

module.exports.loginLinkingTwitter = function(sellerTwitter, sellerId, req, res) {
	console.log('#Backend_msg module.exports.loginTwitter controller called');
	console.log('#Backend_msg sellerTwitter: ' + sellerTwitter);
	console.log('#Backend_msg sellerId: ' + sellerId);

	//Hay que controlar cuando el sellerId es uno mismo

	seller.findSellerByTwitter(sellerTwitter.twitterId, function (err, previousProfile) {
	//COMPROBAMOS QUE EL USUARIO NO EXISTE
		if(err) {
			errMessage(res, err);
		}
		else{
			if (Object.keys(previousProfile).length == 1) {
				// tenemos que comprobar si podemos integrar o no los usuarios en uno solo
				seller.findSellerBySellerId(sellerId, function (err, actualProfile) {
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
								seller.mergeAccountsByTwitter(sellerTwitter, actualProfile[0], previousProfile[0], function(err, info) {
									if(err){
										errMessage(res, err);
									}
									else {
										returnSeller(res, actualProfile[0].sellerId);
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
					seller.addTwitterAccount(sellerTwitter, sellerId, function (err, info) {
						if (err) {
							errMessage(res, err);
						}
						else{
							//BUSCAMOS EL PERFIL DEL CLIENTE RECIEN CREADO PARA ASOCIARLO AL CIFNIF
							seller.findSellerByTwitter(sellerTwitter.twitterId, function (err, profile) {
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(profile).length == 1){
										//una vez desscargado el nuevo perfil y registrado correctamente le damos un token de acceso para la sesion
										returnSeller(res, profile[0].sellerId);
									}
									else {
										console.log( JSON.stringify( {status: 400, statusDescription: 'Seller not found', twitterId : sellerTwitter.twitterId}) );
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'Seller not found', twitterId : sellerTwitter.twitterId}) );
										res.end();
									}
								}
							})
						}
					})	
				}
				else{
					console.log(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByTwitter(sellerTwitter.twitterId, function (searchedProfile, err).'}]));
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write(JSON.stringify([{status: 500, statusDescription: '500 Internal Server Error', err : 'data integrity error. more than 1 object or none object found where there should only be one at Model seller.findSellerByTwitter(sellerTwitter.twitterId, function (searchedProfile, err).'}]));
					res.end();
				}
			}
		}
	})
}
       

module.exports.refreshOwnAccessToken = function(sellerId, req, res) {	
	console.log('#Backend_msg module.exports.refreshAccessToken controller called');
	console.log('#Backend_msg sellerId: ' + sellerId);

	returnSeller(res, sellerId);
}   

module.exports.getStripeManagedAccount = function(sellerId, req, res) {	
	console.log('#Backend_msg module.exports.getStripeCustomerAccount controller called');
	console.log('#Backend_msg sellerId: ' + sellerId);

			seller.findSellerBySellerId(sellerId, function (err, profile) {
				if(err){
					errMessage(res, err);
				}
				// UNA VEZ VALIDADO EL PERFIL Y VIENDO QUE NO TIENE USUARIO ASIGNADO LE ASIGNO UNO NUEVO
				else{				
					if (Object.keys(profile).length == 1 && profile[0].StripeManagedAccount == null) {
						stripeOwn.createManagedAccount( function (err, managedAccount) {
							if(err) {
								errMessage(res, err);
							}
							else{
								seller.setSellerStripeManagedAccount(sellerId, managedAccount.id, function (err, profile) {
									if(err){
										errMessage(res, err);
									}
									// LA CUENTA SE HA LINKADO CORRECTAMENTE HAY QUE DEVOLVER LOS DATOS DEL UDUARIO ACTUALIZADOS
									else{
										returnSeller(res, sellerId);
									}
								});
							}
						})
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

