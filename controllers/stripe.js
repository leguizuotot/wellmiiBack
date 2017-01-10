var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var settings = require('../settings');
var stripe = require("stripe")(
    settings.stripe.secretKey
);

// ********************************************************************
// ********************************************************************

module.exports.createCardToken = function(number, exp_month, exp_year, cvc, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createCardToken');
    stripe.tokens.create({
        card: {
            "number": number,
            "exp_month": exp_month,
            "exp_year": exp_year,
            "cvc": cvc
        }
    }, function(err, token) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(token);
            callback(null, token);
        }
    });
}

module.exports.createAccountToken = function(country, currency, account_holder_name, account_holder_type, routing_number, account_number, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createAccountToken');
    stripe.tokens.create({
        bank_account: {
            country: country,
            currency: currency,
            account_holder_name: account_holder_name,
            account_holder_type: account_holder_type,
            routing_number: routing_number,
            account_number: account_number
        }
    }, function(err, token) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(token);
            callback(null, token);
        }
    });
}

module.exports.createCustomer = function(description, email, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createCustomer');
    stripe.customers.create({description: description, email: email}, function(err, customer) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(customer);
            callback(null, customer);
        }
    });
}

module.exports.retrieveCustomer = function(customerId, callback) {
    console.log('#Backend_msg stripe controller called module.exports.retrieveCustomer');
    stripe.customers.retrieve(customerId, function(err, customer) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(customer);
            callback(null, customer);
        }
    });
}

module.exports.addSourceCustomer = function(customerId, source, callback) {
    console.log('#Backend_msg stripe controller called module.exports.addSourceCustomer');
    stripe.customers.update(customerId, {source: source}, function(err, customer) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(customer);
            callback(null, customer);
        }
    });
}

module.exports.createChargeCustomer = function(amount, currency, description, metadata, customer, application_fee, destination, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createChargeCustomerWithConnect');
    stripe.charges.create({
          amount: amount, // Amount in cents
          currency: currency,
          description: description,
          metadata: metadata,
          customer: customer
    }, function(err, charge) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(charge);
            callback(null, charge);
        }
    });
}


module.exports.createManagedAccount = function(callback) {
    console.log('#Backend_msg stripe controller called module.exports.createManagedAccount');
    stripe.accounts.create({country: 'ES', managed: true}, function(err, account) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(account);
            callback(null, account);
        }
    });
}

module.exports.retrieveManagedAccount = function(accountId, callback) {
    console.log('#Backend_msg stripe controller called module.exports.retrieveManagedAccount');
    stripe.accounts.retrieve(accountId, function(err, account) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(account);
            callback(null, account);
        }
    });
}

module.exports.createChargeCustomerWithConnect = function(amount, currency, description, metadata, customer, application_feeInCents, destination, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createChargeCustomerWithConnect');
    stripe.charges.create({
          amount: amount, // Amount in cents
          currency: currency,
          description: description,
          metadata: metadata,
          customer: customer,
          application_fee: application_feeInCents,
          destination: destination
    }, function(err, charge) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(charge);
            callback(null, charge);
        }
    });
}

module.exports.createChargeSource = function(amount, currency, description, metadata, source, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createChargeCustomer');
    stripe.charges.create({
          amount: amount, // Amount in cents
          currency: currency,
          description: description,
          metadata: metadata,
          source: source    
    }, function(err, charge) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(charge);
            callback(null, charge);
        }
    });
}

module.exports.createChargeSourceWithConnect = function(amount, currency, description, metadata, source, application_feeInCents, destination, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createChargeCustomerWithConnect');
    stripe.charges.create({
          amount: amount, // Amount in cents
          currency: currency,
          description: description,
          metadata: metadata,
          source: source,
          application_fee: application_feeInCents,
          destination: destination
    }, function(err, charge) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(charge);
            callback(null, charge);
        }
    });
}

module.exports.retrieveCharge = function(chargeId, callback) {
    console.log('#Backend_msg stripe controller called module.exports.createChargeCustomerWithConnect');
    stripe.charges.retrieve(chargeId, function(err, charge) {
        if(err){
            console.log(err);
            callback(err, null);
        }
        else{
            console.log(charge);
            callback(null, charge);
        }
    });
}