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

var userTable = '[dbo].[zzz_app_dm_service]';

// **************************************************************************
// **************************************************************************

module.exports.getService = function(serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.getService model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.query(	'Select * from ' + userTable + ' ' +
						'WHERE serviceId = @serviceId order by lastModified desc'
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
		            console.log('#Backend_msg Connection closed with query error module.exports.getService  service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.getService service model');
        console.log(err);
        callback(err, null);
	});
}


module.exports.getUserIdServices = function(userId, callback) {	
	
	console.log('#Backend_msg module.exports.getUserIdServices model called');

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
				.query(	'Select * from ' + userTable + ' ' +
						'WHERE userId = @userId order by lastModified desc'
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
		            console.log('#Backend_msg Connection closed with query error module.exports.getUserIdServices  service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.getUserIdServices service model');
        console.log(err);
        callback(err, null);
	});
}

module.exports.getSellerIdServices = function(sellerId, callback) {	
	
	console.log('#Backend_msg module.exports.getUserIdServices model called');

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
				.query(	'Select * from ' + userTable + ' ' +
						'WHERE sellerId = @sellerId order by lastModified desc'
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
		            console.log('#Backend_msg Connection closed with query error module.exports.getUserIdServices  service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.getUserIdServices service model');
        console.log(err);
        callback(err, null);
	});
}

// CREA UN USUARIO CON ESTRATEGIA LOCAL UTILIZANDO EL CORREO ELECTRÓNICO Y GENERA UN TOKEN UNICO DE USUARIO
module.exports.publish = function(userId,
								stripeAmountInCents, stripeCurrency, stripeApplication_feeInCents,
								userPayAmountInCents, userServiceAmountInCents, userTaxAmountInCents, 
                    			sellerFeeAmountInCents, sellerTaxAmountInCents,
								hora, fecha, lugar, tipoServicio, 
								callback) {	
	
	console.log('#Backend_msg module.exports.publish service model called');

	var serviceId;

	sqlDB.connect(settings.dbConfigMsSQL)
	.then(function() {
		serviceId = uuid.v1();
		console.log('serviceId: ' + serviceId);
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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('userId', sqlDB.NVarChar, userId)

				.input('stripeAmountInCents', sqlDB.NVarChar, stripeAmountInCents)
				.input('stripeCurrency', sqlDB.NVarChar, stripeCurrency)
				.input('stripeApplication_feeInCents', sqlDB.NVarChar, stripeApplication_feeInCents)

				.input('userPayAmountInCents', sqlDB.NVarChar, userPayAmountInCents)
				.input('userServiceAmountInCents', sqlDB.NVarChar, userServiceAmountInCents)
				.input('userTaxAmountInCents', sqlDB.NVarChar, userTaxAmountInCents)
				.input('sellerFeeAmountInCents', sqlDB.NVarChar, sellerFeeAmountInCents)
				.input('sellerTaxAmountInCents', sqlDB.NVarChar, sellerTaxAmountInCents)

				.input('hora', sqlDB.NVarChar, hora)
				.input('fecha', sqlDB.NVarChar, fecha)
				.input('lugar', sqlDB.NVarChar, lugar)
				.input('tipoServicio', sqlDB.NVarChar, tipoServicio)

				.input('serviceStatus', sqlDB.NVarChar, 'published')
				.query(	'INSERT INTO ' + userTable + ' (serviceStatus, dateCreated, lastModified, serviceId, userId, ' +
						' stripeAmountInCents, stripeCurrency, stripeApplication_feeInCents, ' +
						' userPayAmountInCents, userServiceAmountInCents, userTaxAmountInCents, ' +
						' sellerFeeAmountInCents, sellerTaxAmountInCents, ' +
						' hora, fecha, lugar, tipoServicio) ' +
						'VALUES (@serviceStatus, convert(varchar(24), getdate(), 121), convert(varchar(24), getdate(), 121), @serviceId, @userId, ' +
						' @stripeAmountInCents, @stripeCurrency, @stripeApplication_feeInCents, ' +
						' @userPayAmountInCents, @userServiceAmountInCents, @userTaxAmountInCents, ' +
						' @sellerFeeAmountInCents, @sellerTaxAmountInCents, ' +
						' @hora, @fecha, @lugar, @tipoServicio)'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.publish service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.publish service model');
        console.log(err);
        callback(err, null);
	});
}


module.exports.setSellerCandidate = function(sellerId, serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.setSellerCandidate service model called');

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
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('serviceStatus', sqlDB.NVarChar, 'pending approval')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121),' + 
						'sellerId = @sellerId, ' + 
						'serviceStatus =  @serviceStatus ' + 
						'WHERE serviceId = @serviceId and serviceStatus = \'published\' '
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.setSellerCandidate service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.setSellerCandidate service model');
        console.log(err);
        callback(err, null);
	});

}


module.exports.sellerCandidateApprovalTrue = function(serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.sellerCandidateApproval service model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('serviceStatus', sqlDB.NVarChar, 'assigned')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' + 
						'serviceStatus =  @serviceStatus ' + 
						'WHERE serviceId = @serviceId and serviceStatus = \'pending approval\' '
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.sellerCandidateApproval service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.sellerCandidateApproval service model');
        console.log(err);
        callback(err, null);
	});
}

module.exports.sellerCandidateApprovalFalse = function(serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.sellerCandidateApproval service model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('serviceStatus', sqlDB.NVarChar, 'published')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' + 
						'serviceStatus =  @serviceStatus ' + 
						'sellerId =  null ' +
						'WHERE serviceId = @serviceId and serviceStatus = \'pending approval\' '
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.sellerCandidateApproval service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.sellerCandidateApproval service model');
        console.log(err);
        callback(err, null);
	});
}

module.exports.start = function(serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.start service model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('serviceStatus', sqlDB.NVarChar, 'running')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' + 
						'serviceStatus =  @serviceStatus ' + 
						'WHERE serviceId = @serviceId and serviceStatus = \'assigned\' '
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.start service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.start service model');
        console.log(err);
        callback(err, null);
	});
}

module.exports.checkout = function(serviceId, callback) {	
	
	console.log('#Backend_msg module.exports.checkout service model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('serviceStatus', sqlDB.NVarChar, 'checkedOut')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' + 
						'serviceStatus =  @serviceStatus ' + 
						'WHERE serviceId = @serviceId and serviceStatus = \'running\' '
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.checkout service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.checkout service model');
        console.log(err);
        callback(err, null);
	});
}

module.exports.pay = function(serviceId, chargeId, callback) {	
	
	console.log('#Backend_msg module.exports.checkout service model called');

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
		
				.input('serviceId', sqlDB.NVarChar, serviceId)
				.input('chargeId', sqlDB.NVarChar, chargeId)
				.input('serviceStatus', sqlDB.NVarChar, 'paid')
				.query(	'UPDATE ' + userTable + ' ' +
						'SET lastModified = convert(varchar(24), getdate(), 121), ' + 
						'serviceStatus =  @serviceStatus, ' + 
						'stripeCharge =  @chargeId ' + 
						'WHERE serviceId = @serviceId and serviceStatus = \'checkedOut\' and stripeCharge is null'
						)
	
				// ************************************
				// ************************************
			    .then(function(data) {
			        sqlDB.close();
			        console.log('#Backend_msg Connection closed service model');
			        console.log(data);
			        callback(null,data);
			    })
			    .catch(function(err) {
		            sqlDB.close();
		            console.log('#Backend_msg Connection closed with query error module.exports.checkout service model');
		            console.log(err);
		            callback(err, null);
			    });	
	})
	.catch(function(err) {
		console.log('#Backend_msg Connection error module.exports.checkout service model');
        console.log(err);
        callback(err, null);
	});
}