
exports.dbConfigMsSQL = {
	user: 'sqlcsa',
	password: 'Zaragoza1',
	server: '40.115.26.178', // You can use 'localhost\\instance' to connect to named instance
	database: 'musgrave',
		
	options: {
		encrypt: true // Use this if you're on Windows Azure
	}	
}

exports.webPORT = {
	port: 3000
}

exports.domains = {
    home: 'www.losbrezos.xyz'
}

exports.secretKeys = {

	expressSession: '0OH0.rLPUIP7diFcppXAk0NPtAT_',
	jwt: 'I6pXVCJ9.eyJmYWN_Ym9va0ljoi',
	stripe: 'sk_test_1A0VMIVpuhkooE0s30IXCwf9',
	paypal: ''
    
}

exports.Auth = {

    facebook : {
        'clientID'      	: '495263114000955',
        'clientSecret'  	: 'e62eac0f3a76707a5fb12f4bea75d6ea',
        'callbackURL'   	: 'https://www.losbrezos.xyz/users/auth/facebook/callback'
    },

    google : {
        'clientID'      	: '825198512347-jnj797juu0htll5ump1mjfe6ing1elqh.apps.googleusercontent.com',
        'clientSecret'  	: 'bl_rVJtb0fY6G3gYAyE8XmgF',
        'callbackURL'   	: 'https://www.losbrezos.xyz/users/auth/google/callback'
    },


    twitter : {
        'consumerKey'       : 'TpBs0KPkwtAy2QfH6SGr7V5iI',
        'consumerSecret'    : 'CY5x0nck1oL5tpPM5alLn2mmHsUvM6wFTIxXVAnYmray1GdX7N',
        'callbackURL'       : 'https://www.losbrezos.xyz/users/auth/twitter/callback'
    }	
}

exports.mail = {
    accountActivation : {
        transporter :{
            service: 'gmail',
            auth: {
                user: 'mjaquotot@gmail.com',
                pass: 'fdsdsfsdfdsf'
            }
        },
        mailOptions : {
            'from'      : 'mjaquotot@gmail.com',
            'Subject'   : 'Minsait mail verification to activate your account'
        }
    }
}