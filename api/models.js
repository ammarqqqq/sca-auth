
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

var config = require('./config/config').config;

var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: '/usr/local/tmp/auth.sqlite'
})

var User = sequelize.define('User', {
    //attributes
    username: Sequelize.STRING,
    email: Sequelize.STRING,
    password_hash: Sequelize.STRING,

    email_confirmed: { type: Sequelize.BOOLEAN, defaultValue: false },

    iucas: Sequelize.STRING,

    login_date: Sequelize.DATE,
    signup_date: Sequelize.DATE,

    scopes: {
        type: Sequelize.TEXT,
        get: function() {
            return JSON.parse(this.getDataValue('scopes'));
        },
        set: function(o) {
            return this.setDataValue('scopes', JSON.stringify(o));
        }
    },

    active: Sequelize.BOOLEAN,
}, {
    classMethods: {
        //why is this here?
        createToken: function(user) {
            var today = Math.round(Date.now()/1000);
            var expiration = today+3600*24*7; //7days

            //http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#RegisteredClaimName
            var token = {
                iss: "http://trident.iu.edu", //issuer
                exp: expiration,
                scopes: []
            };
            if(user) {
                token.sub = user._id;
                //token.name = user.fullname;
                token.scopes = user.scopes;
            }
            return token;
        }

    },
    instanceMethods: {
        setPassword: function (password, cb) {
            var rec = this;
            /* cost of computation https://www.npmjs.com/package/bcrypt
            * rounds=10: ~10 hashes/sec
            * rounds=13: ~1 sec/hash
            * rounds=25: ~1 hour/hash
            * rounds=31: 2-3 days/hash
            */
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, null, function(err, hash) {
                    if(err) return cb(err);
                    //console.log("hash: "+hash);
                    rec.password_hash = hash;
                    cb(null);
                });
            });
        },
        isPassword: function(password) {
            return bcrypt.compareSync(password, this.password_hash);
        }
    }
});


/*.then(function() {
  return User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  });
}).then(function(jane) {
  console.log(jane.get({
    plain: true
  }))
});
*/

/*

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    //_id is used as jwt's sub

    //for local authentication
    local: {
        username: { type: String, index: {unique: true} }, 
        password_hash: String, //bcrypt-ed password

        email: { type: String, index: {unique: true} },  //email needs to be unique 
        email_confirmed: { type: Boolean, default: false }
    },

    //for iucas authentication
    iucas: {
        id: { type: String, index: {unique: true} } //IU ID
    },

    //user profile
    profile: {
        fullname: String,
        nickname: String //usually user's first name.. just to show in various places
    },

    login_date: Date, //date when the user last logged in
    signup_date: { type: Date, default: Date.now }, //date when the user signed up

    //user account can be deactivated (temporarily?) by administrator
    active: { type: Boolean, default: true },

    //access granted to this user
    scopes: mongoose.Schema.Types.Mixed 
});
*/

/////////////////////////////////////////////////////////////////////////
// 
// methods for record instance
//

//set bcrypted password on the record cb(err)

/////////////////////////////////////////////////////////////////////////
//
//guest can request for an invite
//

/*
userSchema.statics.requestInvite = function(email, cb) {
    this.find({email: email}, function(err, users) {
        if(users.length != 0) {
            cb(new Error("requested email address already exists")); 
        } else {
            var user = new User({email: [email]});
            user.save(cb);
        }
    });
}
*/


exports.sequelize = sequelize;
exports.User = User;
