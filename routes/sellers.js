var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');

var settings = require('../settings');
var seller = require('../controllers/seller')

//***********************************************************************
/************************* HTTP Status Codes ****************************
/*  
http://www.restapitutorial.com/httpstatuscodes.html
    200 OK                                          400 Bad Request
    201 Created                                     401 Unauthorized
    202 Accepted                                    402 Payment Required
    203 Non-Authoritative Information               403 Forbidden
    204 No Content-Type ##no sale en el RES##       404 Not Found
    205 Reset Content                               405 Method Not Allowed
*/

// **********************************************************************
// ************************ Facebook auth routes ************************

router.get('/auth/facebook',    
    passport.authenticate('facebook', { scope: ['email', 'seller_birthday', 'seller_likes'] })
);

router.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
    function(req, res) {
        console.log(req.user);

        var sellerFacebook = {
        
            facebookId: req.user.profile.id,
            facebookToken: req.user.accessToken,
            facebookDisplayName: req.user.profile.displayName,
            facebookPicture: 'https://graph.facebook.com/' + req.user.profile.id + '/picture?type=square'
        }

        var ownAccessFacebook = jwt.sign({ sellerFacebook: sellerFacebook}, settings.secretKeys.jwt, { expiresIn: 60000 });

        res.cookie('authFacebook', ownAccessFacebook, { maxAge: 60000000, httpOnly: true, overwrite: true/*, secure: true*/}); // con secure TRUE el cookie manager de react no lee la cookie
        res.end();
    }
);

router.post('/login/facebook', function(req, res) {

     // Si ya se habia logado logado con otra estrategia y tiene un token de acceso a la api entonces su cuenta de FB se añadira a la del usuario si no existia ya.
    var ownAccessToken = req.body.ownAccessToken;
    var ownAccessFacebook = req.body.ownAccessFacebook;    

    console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    req.checkBody('ownAccessFacebook', 'ownAccessFacebook is required').notEmpty();


    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('ownAccessToken').trim();
    
    req.sanitize('ownAccessFacebook').escape();
    req.sanitize('ownAccessFacebook').trim();

    var err = req.validationErrors();
    
    if(err || Object.keys(req.body).indexOf('ownAccessToken') < 0) {
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.end();
    }
    else{
        if(ownAccessToken != null && ownAccessToken != '') {
            jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerId == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessToken} ));
                    res.end();
                }
                else { //YA ESTABA LOGADO Y HAY QUE LINKAR CUENTAS SI TODO ESTA OK
                    var sellerId = decoded.sellerId;
                    jwt.verify(ownAccessFacebook, settings.secretKeys.jwt, function(err, decoded) {
                        if(err || decoded.sellerFacebook == null) {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessFacebook} ));
                            res.end();
                        }
                        else{
                            console.log(JSON.stringify('#Backend_msg decoded: ' + sellerId));
                            seller.loginLinkingFacebook(decoded.sellerFacebook, sellerId, req, res);
                        }
                    });
                }
            });
        }
        else{ //NO ESTABA LOGADO SE LOGA SI YA EXISTIA USUARIO ACTIVO Y EN CASO CONTRARIO CREA EL USUARIO
            jwt.verify(ownAccessFacebook, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerFacebook == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessFacebook} ));
                    res.end();
                }
                else{
                    console.log('sellerFacebook: ' + decoded.sellerFacebook);
                    seller.loginFacebook(decoded.sellerFacebook, req, res);
                }
            });
        }
    }
});


// **********************************************************************
// ************************ Google login routes *************************
router.get('/auth/google',
    passport.authenticate('google', {scope : ['profile', 'email']})
);

router.get('/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/auth/google' }),
    function(req, res) {
        console.log(req.user);
        var sellerGoogle = {
            googleToken: req.user.token,
            googleId: req.user.profile.id,
            googleDisplayName: req.user.profile.displayName,
            googleGender: req.user.profile.gender
        }

        var ownAccessGoogle = jwt.sign({sellerGoogle: sellerGoogle}, settings.secretKeys.jwt, { expiresIn: 60000 });

        res.cookie('authGoogle', ownAccessGoogle, { maxAge: 60000000, httpOnly: true, overwrite: true /*, secure: true*/}); // con secure TRUE el cookie manager de react no lee la cookie
        res.end();
    }
);

router.post('/login/google', function(req, res) {

    // Si ya se habia logado logado con otra estrategia y tiene un token de acceso a la api entonces su cuenta de FB se añadira a la del usuario si no existia ya.
    var ownAccessToken = req.body.ownAccessToken;
    var ownAccessGoogle = req.body.ownAccessGoogle;    

    console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    req.checkBody('ownAccessGoogle', 'ownAccessGoogle is required').notEmpty();


    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('ownAccessToken').trim();
    
    req.sanitize('ownAccessGoogle').escape();
    req.sanitize('ownAccessGoogle').trim();

    var err = req.validationErrors();
    
    if(err || Object.keys(req.body).indexOf('ownAccessToken') < 0) {
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.end();
    }
    else{
        if(ownAccessToken != null && ownAccessToken != '') {
            jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerId == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessToken} ));
                    res.end();
                }
                else { //YA ESTABA LOGADO Y HAY QUE LINKAR CUENTAS SI TODO ESTA OK
                    var sellerId = decoded.sellerId;
                    jwt.verify(ownAccessGoogle, settings.secretKeys.jwt, function(err, decoded) {
                        if(err || decoded.sellerGoogle == null) {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessGoogle} ));
                            res.end();
                        }
                        else{
                            console.log(JSON.stringify('#Backend_msg decoded: ' + sellerId));
                            seller.loginLinkingGoogle(decoded.sellerGoogle, sellerId, req, res);
                        }
                    });
                }
            });
        }
        else{ //NO ESTABA LOGADO SE LOGA SI YA EXISTIA USUARIO ACTIVO Y EN CASO CONTRARIO CREA EL USUARIO
            jwt.verify(ownAccessGoogle, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerGoogle == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessGoogle} ));
                    res.end();
                }
                else{
                    console.log('sellerGoogle: ' + decoded.sellerGoogle);
                    seller.loginGoogle(decoded.sellerGoogle, req, res);
                }
            });
        }
    }
});

// **********************************************************************
// ************************ Twitter login routes ************************
router.get('/auth/twitter',
    passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
    passport.authenticate('twitter', { failureRedirect: '/auth/twitter' }),
    function(req, res) {
        console.log(req.user.profile._json);
        
        var sellerTwitter = {

            twitterId: req.user.profile._json.id,
            twitterName: req.user.profile._json.name,
            twitterScreen_name: req.user.profile._json.screen_name,
            twitterLocation: req.user.profile._json.location,
            twitterFollowers_count: req.user.profile._json.followers_count,
            twitterFriends_count: req.user.profile._json.friends_count,
            twitterTime_zone: req.user.profile._json.time_zone,
            twitterStatuses_count: req.user.profile._json.statuses_count,
            twitterLang: req.user.profile._json.lang,
            twitterProfile_image_url_https: req.user.profile._json.profile_image_url_https
        }
        console.log(sellerTwitter);

        var ownAccessTwitter = jwt.sign({sellerTwitter: sellerTwitter}, settings.secretKeys.jwt, { expiresIn: 60000 });

        res.cookie('authTwitter', ownAccessTwitter, { maxAge: 60000000, httpOnly: true, overwrite: true /*, secure: true*/}); // con secure TRUE el cookie manager de react no lee la cookie
        res.end();
    }
);

router.post('/login/twitter', function(req, res) {

    // Si ya se habia logado logado con otra estrategia y tiene un token de acceso a la api entonces su cuenta de FB se añadira a la del usuario si no existia ya.
    var ownAccessToken = req.body.ownAccessToken;
    var ownAccessTwitter = req.body.ownAccessTwitter;    

    console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

    //validaciones sobre los campos del formulario
    req.checkBody('ownAccessTwitter', 'ownAccessTwitter is required').notEmpty();


    //SANITAZES STRING FIELD
    req.sanitize('ownAccessToken').escape();
    req.sanitize('ownAccessToken').trim();
    
    req.sanitize('ownAccessTwitter').escape();
    req.sanitize('ownAccessTwitter').trim();

    var err = req.validationErrors();
    
    if(err || Object.keys(req.body).indexOf('ownAccessToken') < 0) {
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters or ownAccessToken parameter not included', err} ));
        res.end();
    }
    else{
        if(ownAccessToken != null && ownAccessToken != '') {
            jwt.verify(ownAccessToken, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerId == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessToken} ));
                    res.end();
                }
                else { //YA ESTABA LOGADO Y HAY QUE LINKAR CUENTAS SI TODO ESTA OK
                    var sellerId = decoded.sellerId;
                    jwt.verify(ownAccessTwitter, settings.secretKeys.jwt, function(err, decoded) {
                        if(err || decoded.sellerTwitter == null) {
                            res.writeHead(401, {'Content-Type':'application/json'});
                            res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessTwitter} ));
                            res.end();
                        }
                        else{
                            console.log(JSON.stringify('#Backend_msg decoded: ' + sellerId));
                            seller.loginLinkingTwitter(decoded.sellerTwitter, sellerId, req, res);
                        }
                    });
                }
            });
        }
        else{ //NO ESTABA LOGADO SE LOGA SI YA EXISTIA USUARIO ACTIVO Y EN CASO CONTRARIO CREA EL USUARIO
            jwt.verify(ownAccessTwitter, settings.secretKeys.jwt, function(err, decoded) {
                if(err || decoded.sellerTwitter == null) {
                    res.writeHead(401, {'Content-Type':'application/json'});
                    res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid token or token has expired', ownAccessTwitter} ));
                    res.end();
                }
                else{
                    console.log('sellerTwitter: ' + decoded.sellerTwitter);
                    seller.loginTwitter(decoded.sellerTwitter, req, res);
                }
            });
        }
    }
});

//***********************************************************************
//************************* ROUTES **************************************

// **********************************************************************
// ************************ Register/login routes local+ gb + g + t *****

router.post('/register/local', function(req, res) {

 	var email = req.body.email;
 	var password = req.body.password;
 	var password2 = req.body.password2;

 	console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

 	//validaciones sobre los campos del formulario
 	req.checkBody('email', 'email is required').isEmail();
 	req.checkBody('password', 'password is required').notEmpty();
 	req.checkBody('password2', 'password2 is required').notEmpty();
 	req.checkBody('password2', 'unequal passwords').equals(req.body.password);


    //SANITAZES STRING FIELD
    req.sanitize('email').escape();
    req.sanitize('email').trim();
    req.sanitize('password').escape();
    req.sanitize('password').trim();
 	var err = req.validationErrors();

 	if(err){
 		console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
		res.writeHead(400, {'Content-Type':'application/json'});
		res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
		res.end();
 	}
 	else {
		seller.registerWithEmail(email, password, req, res);
	}
});

router.get('/register/getEmailValidated', function(req, res) {

    console.log('#Backend_msg Get query: ' + JSON.stringify(req.query));

    var validationToken = req.query.validationToken;
    console.log('#Backend_msg Get validationToken: ' + validationToken);

    //SANITAZES STRING FIELDS
    //req.sanitize('validationToken').escape();
    //req.sanitize('validationToken').trim();

    var err = req.validationErrors();

    if(err){
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(validationToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + JSON.stringify(decoded)));
            if(err || decoded.email == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', validationToken} ));
                res.end();
            }
            else {
                seller.validateLocalEmail(decoded.email, req, res);
            }
        });      
    }
});

router.post('/register/local/requestMailActivationReminder', function(req, res) {
    //Todo lo que llega del formulario en variables POST lo metemos en variables

    var email = req.body.email;

    console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

    //VALIDATES FIELD FORMATING
    req.checkBody('email', 'email is required').isEmail();

    //SANITAZES STRING FIELD
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
        seller.sendValidationEmail(email, req, res);
    }
});

router.post('/register/local/forgotPassword', function(req, res) {
 
    var email = req.body.email;

    console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

    //VALIDATES FIELD FORMATING
    req.checkBody('email', 'email is required').isEmail();

    //SANITAZES STRING FIELD
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
        seller.resetPasswordInstructions(email, req, res);
    }
});

router.get('/register/local/getNewPassword', function(req, res) {

    console.log('#Backend_msg Get query: ' + JSON.stringify(req.query));

    var validationToken = req.query.validationToken;

    //SANITAZES STRING FIELDS
    req.sanitize('validationToken').escape();
    req.sanitize('validationToken').trim();

    var err = req.validationErrors();

    if(err) {
        console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.writeHead(400, {'Content-Type':'application/json'});
        res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
        res.end();
    }
    else {
        jwt.verify(validationToken, settings.secretKeys.jwt, function(err, decoded) {
            console.log(JSON.stringify('#Backend_msg decoded: ' + decoded));
            if(err || decoded.email == null){
                res.writeHead(401, {'Content-Type':'application/json'});
                res.write(JSON.stringify( {status: 401, statusDescription: 'Unauthorized, invalid Token or token has expired', validationToken} ));
                res.end();
            }
            else {
                seller.setNewPassword(decoded.email, req, res);
            }
        });      
    } 
});

router.post('/login/local', function(req, res) {
	//Todo lo que llega del formulario en variables POST lo metemos en variables

 	var email = req.body.email;
 	var password = req.body.password;

 	console.log('#Backend_msg Post Body: ' + JSON.stringify(req.body));

 	//VALIDATES FIELD FORMATING
 	req.checkBody('email', 'email is required').isEmail();
 	req.checkBody('password', 'password is required').notEmpty();

    //SANITAZES STRING FIELD
    req.sanitize('email').escape();
    req.sanitize('email').trim();
    req.sanitize('password').escape();
    req.sanitize('password').trim();

 	var err = req.validationErrors();

 	if(err){
 		console.log(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
		res.writeHead(400, {'Content-Type':'application/json'});
		res.write(JSON.stringify( {status: 400, statusDescription: 'Error, Invalid parameters', err} ));
		res.end();
 	}
 	else {
		seller.loginLocal(email, password, req, res);
	}
});

router.post('/refresh/ownAccessToken', function(req, res) {

    console.log('#Backend_msg Post body: ' + JSON.stringify(req.body));

    var ownAccessToken = req.body.ownAccessToken;

    //VALIDATES FIELD FORMATING
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty();

    //SANITAZES STRING FIELDS
    req.sanitize('ownAccessToken').escape();
    req.sanitize('ownAccessToken').trim();

    var err = req.validationErrors();

    if(err) {
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
                seller.refreshOwnAccessToken(decoded.sellerId, req, res);
            }
        });      
    } 
});

// para poder asocar al usuario una cuenta de stripe

router.post('/getStripeManagedAccount', function(req, res) {

    console.log('#Backend_msg Post body: ' + JSON.stringify(req.body));

    var ownAccessToken = req.sanitize('ownAccessToken').escape();

    //VALIDATES FIELD FORMATING
    req.checkBody('ownAccessToken', 'ownAccessToken is required').notEmpty(); 
 
    var err = req.validationErrors();

    if(err) {
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
                seller.getStripeManagedAccount(decoded.sellerId, req, res);
            }
        });      
    } 
});

// **********************************************************************
// **********************************************************************
module.exports = router;
