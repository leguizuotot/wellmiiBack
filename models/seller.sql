drop table [zzz_app_dm_seller]
;
CREATE TABLE [zzz_app_dm_seller] (
-- minsait fields
isActive			integer,
transferedTo		VARCHAR(250),
lastModified		VARCHAR(250),
sellerId			VARCHAR(250)	NOT NULL,

email				VARCHAR(250),
emailVerified		VARCHAR(250),
hashPassword		VARCHAR(250),
-- stripe data
StripeManagedAccount	VARCHAR(250),
StripeAccount		VARCHAR(250),

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
CONSTRAINT pk_seller_sellerId PRIMARY KEY (sellerId),
)
;

