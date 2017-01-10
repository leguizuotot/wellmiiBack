var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var settings = require('../settings');
var service = require('../controllers/service');
var user = require('../models/user');
var seller = require('../models/seller');

//***********************************************************************
/************************* HTTP Status Codes ****************************

http://www.restapitutorial.com/httpstatuscodes.html
	200 OK								400 Bad Request
	201 Created							401 Unauthorized
	202 Accepted						402 Payment Required
	203 Non-Authoritative Information	403 Forbidden
	204 No Content-Type					404 Not Found
	205 Reset Content					405 Method Not Allowed

//*********************************************************************
// ********************************************************************
// **************************  SERVICE CYCLE *************************/
// *******************************************************************/

router.post('/publish', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter https://github.com/chriso/validator.js
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('stripeAmountInCents', 'stripeAmountInCents is required').notEmpty();
    req.checkBody('stripeAmountInCents', 'stripeAmountInCents must be between [100, 10000]').isInt({ min: 100, max: 10000 });
    
    req.checkBody('stripeCurrency', 'stripeCurrency is required').notEmpty();
    req.checkBody('hora', 'hora is required').notEmpty();
    req.checkBody('fecha', 'fecha is required').notEmpty();
    req.checkBody('lugar', 'lugar is required').notEmpty();
    req.checkBody('tipoServicio', 'tipoServicio is required').notEmpty();


    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('stripeAmountInCents').escape();
    req.sanitize('stripeCurrency').escape();
    req.sanitize('hora').escape();
    req.sanitize('fecha').escape();
    req.sanitize('lugar').escape();
    req.sanitize('tipoServicio').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('stripeAmountInCents').trim();
    req.sanitize('stripeCurrency').trim();
    req.sanitize('hora').trim();
    req.sanitize('fecha').trim();
    req.sanitize('lugar').trim();
    req.sanitize('tipoServicio').trim();


    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;

    
    // STRIPE CHARGE CONFIGURATION
    var stripeAmountInCents = parseInt(req.body.stripeAmountInCents);
    var stripeCurrency = req.body.stripeCurrency;


    // SERVICE INFORMATION
    // ip from request
    // country from request
    var hora = req.body.hora;
    var fecha = req.body.fecha;
    var lugar = req.body.lugar;
    var tipoServicio = req.body.tipoServicio;
    // ip from running service
    // country from running service
    // time when running service starts

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.publish(profile[0].userId,
                                            stripeAmountInCents, stripeCurrency,
                                            hora, fecha, lugar, tipoServicio,
                                            req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/setSellerCandidate', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();


    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.sellerId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                seller.findSellerBySellerId(decoded.sellerId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1) {
                            service.setSellerCandidate(profile[0].sellerId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/sellerCandidateApproval', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();
    req.checkBody('isApprovalTrue', 'isApprovalTrue is required').isBoolean();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();
    req.sanitize('isApprovalTrue').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();
    req.sanitize('isApprovalTrue').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;
    var isApprovalTrue = req.body.isApprovalTrue;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.sellerCandidateApproval(profile[0].userId, serviceId, isApprovalTrue, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/cancelService', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.cancelService(profile[0].userId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/cancelSellerCandidate', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.cancelSellerCandidate(profile[0].userId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/start', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.sellerId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                seller.findSellerBySellerId(decoded.sellerId, function (err, profile) {
                    if(err) {
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1) {
                            service.start(profile[0].sellerId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/checkout', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.sellerId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                seller.findSellerBySellerId(decoded.sellerId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1) {
                            service.checkout(profile[0].sellerId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'sellerId not found'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/pay', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.pay(profile[0].userId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

router.post('/declinePaying', function(req, res) {
    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('serviceId', 'serviceId is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('serviceId').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('serviceId').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var serviceId = req.body.serviceId;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(decoded.userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            service.declinePaying(profile[0].userId, serviceId, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    }
});

// ********************************************************************
// ********************************************************************
// **************************  CHARGES ********************************
// *******************************************************************/

router.post('/createChargeCustomer', function(req, res) {

    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //check parameter
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();
    req.checkBody('amountInCents', 'amountInCents is required').notEmpty();
    req.checkBody('currency', 'currency is required').notEmpty();
    req.checkBody('currency', 'currency is required').notEmpty();
    req.checkBody('description', 'description is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('amountInCents').escape();
    req.sanitize('currency').escape();
    req.sanitize('description').escape();
    req.sanitize('metadata').escape();

    req.sanitize('ownAccessToken').trim();
    req.sanitize('amountInCents').trim();
    req.sanitize('currency').trim();
    req.sanitize('description').trim();
    req.sanitize('metadata').trim();

    //REQUIRE VARIABLES
    var ownAccessToken = req.body.ownAccessToken;
    var amountInCents = req.body.amountInCents;
    var currency = req.body.currency;
    var description = req.body.description;
    var metadata = req.body.metadata; 
    
    var err = req.validationErrors();
    
    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.userId == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', ownAccessToken} ));
                res.end();
            }
            else {
                user.findUserByUserId(userId, function (err, profile) {
                    if(err){
                        errMessage(res, err);
                    }
                    else{   
                        if (Object.keys(profile).length == 1 && profile[0].stripeCustomer != null) {
                            stripeOwn.createChargeCustomer(amount, currency, description, metadata, profile[0].stripeCustomer, req, res);
                        }
                        else {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'user not found or user doesn\'t have payment methods registered'} ));
                            res.end();
                        }
                    }
                });
            }
        });      
    } 
});

module.exports = router;
