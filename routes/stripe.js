var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var settings = require('../settings');
var stripeOwn = require('../controllers/stripe');


//***********************************************************************
/************************* HTTP Status Codes ****************************

http://www.restapitutorial.com/httpstatuscodes.html
	200 OK								400 Bad Request
	201 Created							401 Unauthorized
	202 Accepted						402 Payment Required
	203 Non-Authoritative Information	403 Forbidden
	204 No Content-Type					404 Not Found
	205 Reset Content					405 Method Not Allowed

//**********************************************************************/

// esto debería e estar en el front utilizando la clave pubica para que los datos bancarios de clientes no pasen por el servidor.


/*
account = stripe.Account.retrieve(...id...)
account.tos_acceptance.update({
        "ip": request.META.get("HTTP_X_FORWARDED_FOR"),
        "date": datetime.datetime.now().timestamp()})
account.save()
*/

router.post('/getPublishableKey', function(req, res) {


});

// ********************************************************************
// ************************** PAYMENT SOURCES FOR FORONT END **********
// ********************************************************************

router.post('/createCardToken', function(req, res) {

    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    number = '4242424242424242';
    exp_month= 10;
    exp_year= 2020;
    cvc = 323;

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        stripeOwn.createCardToken(number , exp_month , exp_year , cvc, function(err, data) {
            if(err){
                res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                res.end();
            }
            else{
                res.writeHead(200, {'Content-Type':'application/json'});
                res.write(JSON.stringify({data}));
                res.end();
            }
        });
    }
});

//***********************************************************************
/************************ MANAGED ACCOUNTS ******************************

https://stripe.com/docs/connect/managed-accounts

*************************************************************************
************************************************************************/

router.post('/createManagedAccount', function(req, res) {

    //var ownAccessToken = req.body.ownAccessToken;
    //account details
    var country = req.body.country;
    var email = req.body.email;

    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    //req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();

    req.checkBody('country', 'country is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('country').escape();
    req.sanitize('country').trim();
    
    req.sanitize('email').escape();
    req.sanitize('email').trim();

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        stripe.accounts.create({
          managed: true,
          country: country,
          email: email
        }, function(err, stripe) {
            
            if(err){
                res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                res.end();
            }
            else{
                res.writeHead(200, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', stripe} ));
                res.end();
            }
        });
    }
});

// **********************************************************************
// **********************************************************************
module.exports = router;



// ********************************************************************
// ********************************************************************

/*
router.post('/createCharge/card', function(req, res) {

    var ownAccessToken = req.body.ownAccessToken;
    //card details
    var number = req.body.number;
    var exp_month = req.body.exp_month;
    var exp_year = req.body.exp_year;
    var cvc = req.body.cvc;
    //charge details
    var amount = req.body.amount; // en centimos!!!!!
    var currency = req.body.currency;

    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();

    req.checkBody('number', 'number is required').notEmpty();
    req.checkBody('exp_month', 'exp_month is required').notEmpty();
    req.checkBody('exp_year', 'exp_year is required').notEmpty();
    req.checkBody('cvc', 'cvc is required').notEmpty();

    req.checkBody('amount', 'amount is required').notEmpty();
    req.checkBody('currency', 'currency is required').notEmpty();

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            if(err){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token', ownAccessToken} ));
                res.end();
            }
            else {
                console.log(JSON.stringify(decoded));
                createCardToken(number, exp_month, exp_year, cvc, function(card, err){
                    if(err){
                        res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                        res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                        res.end();
                    }
                    else{
                        var source = card.id
                        stripe.charges.create({
                            amount: amount,
                            currency: currency,
                            source: source, // obtained with Stripe.js
                            description: '{userId: \'' + decoded.minsaitId + '\'}'
                        }, function(err, stripe) {
                            if(err){
                                res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                                res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                                res.end();
                            }
                            else{
                                res.writeHead(200, {'Content-Type':'application/json'});
                                res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', stripe} ));
                                res.end();
                            }
                        });
                    }
                })
            }
        });
    }
});


router.post('/createCharge/account', function(req, res) {

    var ownAccessToken = req.body.ownAccessToken;
    //account details
    var country = req.body.country;
    var currency = req.body.currency;
    var account_holder_name = req.body.account_holder_name;
    var account_holder_type = req.body.account_holder_type;
    var routing_number = req.body.routing_number;
    var account_number = req.body.account_number;
    //charge details
    var amount = req.body.amount; // en centimos!!!!!
    var currency = req.body.currency;

    console.log('#Minsait_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();

    req.checkBody('country', 'country account is required').notEmpty();
    req.checkBody('currency', 'currency account is required').notEmpty();
    req.checkBody('account_holder_name', 'account_holder_name is required').notEmpty();
    req.checkBody('account_holder_type', 'account_holder_type is required').notEmpty();
    req.checkBody('routing_number', 'routing_number is required').notEmpty();
    req.checkBody('account_number', 'account_number is required').notEmpty();

    req.checkBody('amount', 'amount is required').notEmpty();
    req.checkBody('currency', 'currency is required').notEmpty();

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
            if(err){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token', ownAccessToken} ));
                res.end();
            }
            else {
                console.log(JSON.stringify(decoded));
                createAccountToken(country, currency, account_holder_name, account_holder_type, routing_number, account_number, function(account, err){
                    if(err){
                        res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                        res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                        res.end();
                    }
                    else{
                        var source = account.id
                        stripe.charges.create({
                            amount: amount,
                            currency: currency,
                            source: source, // obtained with Stripe.js
                            description: '{userId: \'' + decoded.minsaitId + '\'}'
                        }, function(err, stripe) {
                            if(err){
                                res.writeHead(err.statusCode, {'Content-Type':'application/json'});
                                res.write(JSON.stringify( {status: err.statusCode, statusDescription: err.message, err} ));
                                res.end();
                            }
                            else{
                                res.writeHead(200, {'Content-Type':'application/json'});
                                res.write(JSON.stringify( {status: 200, statusDescription: 'Succeeded', stripe} ));
                                res.end();
                            }
                        });
                    }
                })
            }
        });
    }
});
*/





