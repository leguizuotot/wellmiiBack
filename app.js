var express = require('express');
var session = require('express-session');
var expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
var helmet = require('helmet');
//var morgan = require('morgan');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;

var settings = require('./settings');

var users = require('./routes/users');
var stripe = require('./routes/stripe');

// ***                PASSPORT STRATEGIES                             ***
//***********************************************************************
//**************************** Facebook *********************************
passport.use(new FacebookStrategy({
    clientID: settings.Auth.facebook.clientID,
    clientSecret: settings.Auth.facebook.clientSecret,
    callbackURL: settings.Auth.facebook.callbackURL
    //profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, cb) {
        var user = {accessToken, refreshToken, profile};
        return cb(null, user);
}));

//***********************************************************************
//**************************** Google ***********************************
passport.use(new GoogleStrategy({
    clientID: settings.Auth.google.clientID,
    clientSecret: settings.Auth.google.clientSecret,
    callbackURL: settings.Auth.google.callbackURL
    },
    function(token, refreshToken, profile, cb) {
        var user = {token, refreshToken, profile};
        return cb(null, user);
}));

//***********************************************************************
//**************************** Twitter **********************************
passport.use(new TwitterStrategy({
    consumerKey: settings.Auth.twitter.consumerKey,
    consumerSecret: settings.Auth.twitter.consumerSecret,
    callbackURL: settings.Auth.twitter.callbackURL
    },
    function(token, tokenSecret, profile, cb) {
        var user = {profile};
        return cb(null, user);
}));

//***********************************************************************
//***********************************************************************
// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

// *********************************************************************
// ************************************ INITIALIZE APP *****************
var server = express();

// Configure view engine to render EJS templates.
//server.set('views', __dirname + '/views');
//server.set('view engine', 'ejs');

server.engine('handlebars', exphbs({defaultLayout:'layout'}));
server.set('view engine', 'handlebars');
server.set('views', path.join(__dirname, './views'));

//server.set('views', path.join(__dirname, 'views'));

//server.set('view engine', 'handlebars');

// *********************************************************************
// ************************************ MIDDLEWARE *********************
// Helmet helps you secure your Express servers by setting various HTTP headers 
server.use(helmet());
// HTTP request logger middleware for node.js
//server.use(morgan('dev'));

server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// PUBLIC FOLDER FOR STATIC CONTENT
server.use(express.static(path.join(__dirname, 'public')));

server.use(session({
    secret: settings.secretKeys.expressSession,
    saveUninitialized: true, //si grabamos sesiones en una BDD y si el servidor se cae la session sigue abierta
    resave: true
}));

// Passport Initilization... debe ser después de iniciar las sesiones de express
server.use(passport.initialize());
server.use(passport.session());

// Sirve para los mensajes de error en las comprobaciones de los parametros que se hacen en las rutas.
server.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

server.use(expressValidator({
    toSanitizeSomehow: function(value) {
        var newValue = value;//some operations
        return newValue;
    }
}));

// *********************************************************************
// ************************************ ROUTES *************************

server.use('/users', users);
server.use('/stripe', stripe);

/*
server.use('/', function(req,res){
    res.write(JSON.stringify([{status: 200, statusDescription: 'Welcome to the server'}]));
    res.end();
    console.log('morgan_msg cookie: ' + JSON.stringify([req.cookies]) );
    // connect.sid la primera parte de la cookie es el session id y la segunda la firma para autenticar la cookie ene l servidor
    console.log('************************');
    console.log('morgan_msg session: ' + JSON.stringify([req.sessions]) );
});
*/

// *********************************************************************
// ************************************ SERVER *************************
server.set('port', (process.env.PORT || settings.webPORT.port));
server.listen(server.get('port'), function() {
    console.log('Server started on port ' + server.get('port'));
});

module.exports = server;
