drop table [zzz_app_dm_service]
;

CREATE TABLE [zzz_app_dm_service] (
	
-- service idetifiers
dateCreated			VARCHAR(250),
lastModified		VARCHAR(250),
serviceId			VARCHAR(250)	NOT NULL,
userId				VARCHAR(250),
sellerId			VARCHAR(250),

-- serivce satus
serviceStatus		VARCHAR(250),

-- services payment info
stripeCharge		VARCHAR(250),
stripeAmountInCents	integer,
stripeCurrency		VARCHAR(250),
stripeDescription	VARCHAR(2500),
stripeMetadata		VARCHAR(2500),
stripeApplication_feeInCents	integer,

-- userReceipt
userPayAmountInCents	integer,
userServiceAmountInCents	integer,
userTaxAmountInCents	integer,

-- sellerReceipt
sellerFeeAmountInCents	integer,
sellerTaxAmountInCents	integer,


-- service specifications
hora				VARCHAR(250),
fecha				VARCHAR(250),
lugar				VARCHAR(250),
tipoServicio		VARCHAR(250),

-- service feedback
userScore			integer,
userComment			VARCHAR(250),
sellerScore			integer,
sellerComment		VARCHAR(250)

-- CONSTRAINS
CONSTRAINT pk_service_serviceId PRIMARY KEY (serviceId),
)
;

