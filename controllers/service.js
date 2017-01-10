
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var settings = require('../settings');
//controllers
var stripeOwn = require ('./stripe');
//models
var user = require ('../models/user');
var seller = require ('../models/seller');
var service = require ('../models/service');

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
	console.log(JSON.stringify({status: 500, statusDescription: '500 Internal Server Error', err} ))
	res.writeHead(500, {'Content-Type':'application/json'});
	res.write(JSON.stringify({status: 500, statusDescription: '500 Internal Server Error', err} ));
	res.end();
}

function returnUserServices(res, userId, serviceId) {
	service.getUserIdServices(userId, function (err, userServices) {
		if(err){
			errMessage(res, err);
		}
		else{
			console.log(JSON.stringify({status: 200, statusDescription: 'Succeeded', services: {userServices} } ));
			res.writeHead(200, {'Content-Type':'application/json'});
			res.write(JSON.stringify({status: 200, statusDescription: 'Succeeded', services: {userServices} } ));
			res.end();
		}
	});			
}

function returnSellerServices(res, sellerId, serviceId) {
	service.getSellerIdServices(sellerId, function (err, sellerServices) {
		if(err){
			errMessage(res, err);
		}
		else{
			console.log(JSON.stringify({status: 200, statusDescription: 'Succeeded', services: {sellerServices} } ));
			res.writeHead(200, {'Content-Type':'application/json'});
			res.write(JSON.stringify({status: 200, statusDescription: 'Succeeded', services: {sellerServices} } ));
			res.end();
		}
	});
}

//***********************************************************************
//************************* Register a new user *************************
// creates an account for the new user and links the taxId of the reference used for login. It returns the user ownAccessToken, profile and linked TaxIds

module.exports.publish = function(userId,
									stripeAmountInCents, stripeCurrency,
									hora, fecha, lugar, tipoServicio,
									req, res) {	
	console.log('#Backend_msg module.exports.publish service controller called');

    // TAX & PRICING STRATEGY - should be variable and not fixed values in the future.
    var fixedStripeInCents = 25;
    var taxSeller = 0.08;
    var taxPlatform = 0.22;
    var feePlatform = 0.085;
    
    // STRIPE CHARGE CONFIGURATION
    var stripeAmountInCentsWithFixed = stripeAmountInCents + fixedStripeInCents;
    var stripeApplication_fee = parseInt(stripeAmountInCentsWithFixed*feePlatform);

    // USER RECEIPT DATA
    var userPayAmountInCents = fixedStripeInCents;
    var userServiceAmountInCents = parseInt((stripeAmountInCentsWithFixed - userPayAmountInCents)/(1+taxSeller));
    var userTaxAmountInCents = stripeAmountInCentsWithFixed - userServiceAmountInCents;

    // SELLER RECEIPT DATA
    var sellerFeeAmountInCents = parseInt(stripeApplication_fee/(1+taxPlatform));
    var sellerTaxAmountInCents = stripeApplication_fee - sellerFeeAmountInCents;

	service.publish(userId,
					stripeAmountInCentsWithFixed, stripeCurrency, stripeApplication_fee,
					userPayAmountInCents, userServiceAmountInCents, userTaxAmountInCents, 
                    sellerFeeAmountInCents, sellerTaxAmountInCents,
					hora, fecha, lugar, tipoServicio,
					function (err, userServices) {
		if(err){
			errMessage(res, err);
		}
		else{
			returnUserServices(res, userId);
			// aqui deberia de llamarse a alguna funcion que genera una notificación para el seller
		}
	});
}

module.exports.setSellerCandidate = function(sellerId, serviceId, req, res) {	
	console.log('#Backend_msg module.exports.setSellerCandidate service controller called');
	
	service.getService(serviceId, function (err, serviceDetails) {
		if(err){
			errMessage(res, err);
		}
		else{
			if(Object.keys(serviceDetails).length == 1 && serviceDetails[0].sellerId == null && serviceDetails[0].serviceStatus == 'published') {
				service.setSellerCandidate(sellerId, serviceId, function (err, assignedService) {
					if(err){
						errMessage(res, err);
					}
					else{
						returnSellerServices(res, sellerId);
						// aqui deberia de llamarse a alguna funcion que genera una notificación para el seller
					}
				});
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Service not found or already assigned to another seller'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Service not found or already assigned to another seller'} ));
				res.end();
			}
		}
	});
}

module.exports.sellerCandidateApproval = function(userId, serviceId, isApprovalTrue, req, res) {	
	console.log('#Backend_msg module.exports.setSellerCandidate service controller called');
	
	service.getService(serviceId, function (err, serviceDetails) {
		if(err){
			errMessage(res, err);
		}
		else{
			if(Object.keys(serviceDetails).length == 1 && serviceDetails[0].sellerId != null && serviceDetails[0].userId == userId  && serviceDetails[0].serviceStatus == 'pending approval' ) {
				if (isApprovalTrue == 1){
					service.sellerCandidateApprovalTrue(serviceId, function (err, assignedService) {
						if(err){
							errMessage(res, err);
						}
						else{
							returnUserServices(res, userId);
							// aqui deberia de llamarse a alguna funcion que genera una notificación para el seller
						}
					});
				}
				else{
					service.sellerCandidateApprovalFalse(serviceId, function (err, rejectedService) {
						if(err){
							errMessage(res, err);
						}
						else{
							returnUserServices(res, userId);
							// aqui deberia de llamarse a alguna funcion que genera una notificación para el seller
						}
					});
				}
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.end();
			}
		}
	});
}


module.exports.start = function(sellerId, serviceId, req, res) {	
	console.log('#Backend_msg module.exports.start service controller called');
	
	service.getService(serviceId, function (err, serviceDetails) {
		if(err){
			errMessage(res, err);
		}
		else{
			if(Object.keys(serviceDetails).length == 1 && serviceDetails[0].sellerId != null && serviceDetails[0].sellerId == sellerId  && serviceDetails[0].serviceStatus == 'assigned' && serviceDetails[0].serviceId == serviceId ) {
				service.start(serviceId, function (err, startedService) {
					if(err){
						errMessage(res, err);
					}
					else{
						returnSellerServices(res, sellerId);
						// aqui deberia de llamarse a alguna funcion que genera una notificación para el user de q el servicio ha comenzado
					}
				});
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.end();
			}
		}
	});
}

module.exports.checkout = function(sellerId, serviceId, req, res) {	
	console.log('#Backend_msg module.exports.start service controller called');
	
	service.getService(serviceId, function (err, serviceDetails) {
		if(err){
			errMessage(res, err);
		}
		else{
			if(Object.keys(serviceDetails).length == 1 && serviceDetails[0].sellerId != null && serviceDetails[0].sellerId == sellerId  && serviceDetails[0].serviceStatus == 'running' && serviceDetails[0].serviceId == serviceId ) {
				service.checkout(serviceId,	function (err, startedService) {
					if(err){
						errMessage(res, err);
					}
					else{
						returnSellerServices(res, sellerId);
						// aqui deberia de llamarse a alguna funcion que genera una notificación para el user de q el servicio ha terminado y debe pagar
					}
				});
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Service not found or unauthorized user'} ));
				res.end();
			}
		}
	});
}

module.exports.pay = function(userId, serviceId, req, res) {	
	console.log('#Backend_msg module.exports.start service controller called');
	
	service.getService(serviceId, function (err, serviceDetails) {
		if(err){
			errMessage(res, err);
		}
		else{
			if(Object.keys(serviceDetails).length == 1 && serviceDetails[0].userId != null && serviceDetails[0].userId == userId  && serviceDetails[0].serviceStatus == 'checkedOut' && serviceDetails[0].serviceId == serviceId && serviceDetails[0].stripeCharge == null) {
				user.findUserByUserId(serviceDetails[0].userId, function (err, userProfile) {
					if(err){
						errMessage(res, err);
					}
					else{
						if(Object.keys(userProfile).length == 1 && userProfile[0].stripeCustomer != null) {
							seller.findSellerBySellerId(serviceDetails[0].sellerId, function (err, sellerProfile) {
								if(err){
									errMessage(res, err);
								}
								else{
									if(Object.keys(sellerProfile).length == 1 && sellerProfile[0].StripeManagedAccount != null) {
										// YA ESTA COMPROBADO EL USUARIO Y EL SELLER SOLO QUEDA HACER EL CARGO Y SI SALE BIEN ASOCIARLO EN LA BBDD
										stripeOwn.createChargeCustomerWithConnect(
											serviceDetails[0].stripeAmountInCents, //amount
											serviceDetails[0].stripeCurrency, //currency
											serviceDetails[0].serviceId, //description
											{serviceId: serviceDetails[0].serviceId,
												userId: serviceDetails[0].userId,
												sellerId: serviceDetails[0].sellerId,
												userReceipt: {userPayAmountInCents: serviceDetails[0].userPayAmountInCents,
													userServiceAmountInCents: serviceDetails[0].userServiceAmountInCents,
													userTaxAmountInCents: serviceDetails[0].userTaxAmountInCents
												},
												sellerReceipt: {sellerFeeAmountInCents: serviceDetails[0].sellerFeeAmountInCents,
													sellerTaxAmountInCents: serviceDetails[0].sellerTaxAmountInCents
												}
											}, //metadata
											userProfile[0].stripeCustomer, //customer
											serviceDetails[0].stripeApplication_feeInCents, //application_fee
											sellerProfile[0].StripeManagedAccount, //destination
											function(err, charge) {
											if(err){
												errMessage(res, err);
											}
											else{
												service.pay(serviceId, charge.id, function (err, chargedService) {
													if(err){
														errMessage(res, err);
													}
													else{
														returnUserServices(res, userId, serviceId);
														//hace falta un webhook para los seller q sepan q les han pagado.		
													}
												});
											}
										});
									}
									else{
										console.log(JSON.stringify( {status: 400, statusDescription: 'sellerId not found or has no stripe account related'} ));
										res.writeHead(400, {'Content-Type':'application/json'});
										res.write(JSON.stringify( {status: 400, statusDescription: 'sellerId not found or has no stripe account related'} ));
										res.end();
									}
								}
							});
						}
						else{
							console.log(JSON.stringify( {status: 400, statusDescription: 'sellerId not found or has no stripe account related'} ));
							res.writeHead(400, {'Content-Type':'application/json'});
							res.write(JSON.stringify( {status: 400, statusDescription: 'sellerId not found or has no stripe account related'} ));
							res.end();
						}
					}
				});
			}
			else{
				console.log(JSON.stringify( {status: 400, statusDescription: 'Cannot charge service. Not found, already charge or bad info'} ));
				res.writeHead(400, {'Content-Type':'application/json'});
				res.write(JSON.stringify( {status: 400, statusDescription: 'Cannot charge service. Not found, already charge or bad info'} ));
				res.end();
			}
		}
	});
}