drop table [zzz_app_dm_user]
;

CREATE TABLE [zzz_app_dm_user] (
-- minsait fields
isActive			integer,
transferedTo		VARCHAR(250),
lastModified		VARCHAR(250),
userId				VARCHAR(250)	NOT NULL,

email				VARCHAR(250),
emailVerified		VARCHAR(250),
hashPassword		VARCHAR(250),

-- stripe ustomer
StripeCustomer		VARCHAR(250),

-- facebook fields
facebookId			VARCHAR(250),
facebookToken		VARCHAR(250),
facebookEmail		VARCHAR(250),
facebookDisplayName	VARCHAR(250),
facebookBirthdate	VARCHAR(250),
facebookgender		VARCHAR(250),
facebookPicture		VARCHAR(250),

-- google fields
googleId			VARCHAR(250),
googleToken			VARCHAR(250),
googleEmail			VARCHAR(250),
googleDisplayName	VARCHAR(250),
googleGender		VARCHAR(250),

-- twitter fields
twitterId			VARCHAR(250),
twitterName			VARCHAR(250),
twitterScreen_name	VARCHAR(250),
twitterLocation		VARCHAR(250),
twitterFollowers_count	VARCHAR(250),
twitterFriends_count	VARCHAR(250),
twitterTime_zone		VARCHAR(250),
twitterStatuses_count	VARCHAR(250),
twitterLang			VARCHAR(250),
twitterProfile_image_url_https	VARCHAR(250),

-- USER MINSAIT PROFILE
name				VARCHAR(250),
phone				INT,
tipoComercio		VARCHAR(250),

CP					VARCHAR(5),
direccion			VARCHAR(500),
numero				VARCHAR(250),
municipio			VARCHAR(250),

-- CONSTRAINS
CONSTRAINT pk_user_userId PRIMARY KEY (userId),
)
;

-- ******************************************************************************************
-- ******************************************************************************************
-- ******************************************************************************************
-- select * from  [zzz_app_dm_NifCifActivation]

DROP TABLE [zzz_app_dm_NifCifActivation]
;

CREATE TABLE [zzz_app_dm_NifCifActivation] (
CD_NIFCIF				VARCHAR(250)	NOT NULL,
misnaitRegisterToken	VARCHAR(250)	NOT NULL,
CONSTRAINT pk_app_CD_NIFCIF PRIMARY KEY (CD_NIFCIF),
CONSTRAINT unique_app_misnaitRegisterToken UNIQUE (misnaitRegisterToken)
)
;


-- select * from [zzz_app_dm_NifCifActivation];
INSERT INTO [zzz_app_dm_NifCifActivation] (CD_NIFCIF, misnaitRegisterToken)
    select CD_NIFCIF,
	concat(		substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				'-',
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1),
				substring('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', CAST(1.0 + floor(36 * RAND(convert(varbinary, newid()))) AS INTEGER), 1)
             ) as misnaitRegisterToken
	from (
		SELECT [dbo].[DM_CLIENTES].CD_NIFCIF
		FROM [dbo].[DM_CLIENTES] left join (select cd_nifcif from [zzz_app_dm_NifCifActivation]) t
		on [dbo].[DM_CLIENTES].CD_NIFCIF = t.CD_NIFCIF
		where t.CD_NIFCIF is null
		group by [dbo].[DM_CLIENTES].CD_NIFCIF
	) t
;

-- ******************************************************************************************
-- ******************************************************************************************
-- ******************************************************************************************

DROP TABLE [zzz_app_dm_userNifCif]
;
-- RELACIONA EL USUARIO DE LA APP CON EL USUARIO DEL TRANSACCO
CREATE TABLE [zzz_app_dm_userNifCif] (
minsaitId				VARCHAR(250)	NOT NULL,
CD_NIFCIF				VARCHAR(250)	NOT NULL,
CONSTRAINT pk_app_minsaitIdCD_NIFCIF PRIMARY KEY (minsaitId, CD_NIFCIF)
)
;

-- ******************************************************************************************
-- ******************************************************************************************
-- ******************************************************************************************