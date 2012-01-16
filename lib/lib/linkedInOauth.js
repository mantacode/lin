/**

LinkedInOAuth
=============

This provides OAuth support for LinkedIn's node apps. This extends the `OAuth` class from
[OAuth](https://github.com/ciaranj/node-oauth) so that we can record responses from
web services (like PAL).

*/
var OAuth = require('./oauth').OAuth,
    Querystring= require('querystring'),
    Util = require('util');
    URL= require('url');

var oauth, config;

/**
- `init`
--------------------
Initialze environment and return `oauth` object.

  configOptions
  {"apiKey": get from developer.linkedin.com
   "apiSecret": get from developer.linkedin.com
   "apiServer":"http://api.linkedin.com:80", 
   "apiAuthority":"http://api.linkedin.com:80",
   "tokenServer":"https://api.linkedin.com",
   "directRequestServer":"https://www.linkedin.com",
   "directRequestUrl":"https://www.linkedin.com/uas/oauth/direct",
   "requestTokenCallback": needed for redirect auth; value depends on server routes 
   },
*/
function init(configOptions) {
  if (oauth === undefined) {
    config = configOptions;
    
    var missingConfig = false;
    ["apiKey","apiSecret","apiServer","apiAuthority","directRequestServer","directRequestUrl"].forEach(function (key) {
      if (!config[key]) { missingConfig = true; }
    });
    if (missingConfig) {
      var defaultConfigOptions = [];
      defaultConfigOptions.push("Suggested configOptions:");
      defaultConfigOptions.push("- apiKey");
      defaultConfigOptions.push("- apiSecret");
      defaultConfigOptions.push("- apiServer: 'http://api.linkedin.com:80'");
      defaultConfigOptions.push("- apiAuthority: 'http://api.linkedin.com:80'");
      defaultConfigOptions.push("- directRequestServer: 'https://www.linkedin.com'");
      defaultConfigOptions.push("- directRequestUrl: 'https://www.linkedin.com/uas/oauth/direct'");
      defaultConfigOptions.push("- tokenServer: 'https://api.linkedin.com'");
      defaultConfigOptions.push("- requestTokenCallback: optional, only needed for redirect-style-auth");
      console.log("WARNING:  linkedInOauth missing config.  " + defaultConfigOptions.join("\n") + "\n");
    }
    config.directRequestMethod = "POST";
    config.requestTokenUrl = (config.tokenServer || '') + "/uas/oauth/requestToken";
    config.accessTokenUrl = (config.tokenServer || '') + "/uas/oauth/accessToken";
    config.authorizeUrl = (config.tokenServer || '') + "/uas/oauth/authorize";
    
    oauth = new OAuth(config.requestTokenUrl,
                      config.accessTokenUrl,
                      config.apiKey,
                      config.apiSecret,
                      '1.0',
                      config.requestTokenCallback || '',
                      'HMAC-SHA1', null,
                      { "Accept" : "*/*", "Connection" : "close", "User-Agent" : "Node authentication"});
  }
  return oauth;
}

/**
- getOuath
----------
Return handle to "inner" oauth object (needed by VCR)
*/
function getOauth() {
  return init();
}


function urlEncode(item) {
  return Querystring.stringify(item);
}

// ====== 3-Legged Oauth ==========================================================================

/**
  Make requestToken request.  Get back a request token, secret, and a redirectUrl for authorization
  - next (err, result)
*/
function requestToken(next) {
  oauth.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
    if (error) {
      next(error);
    } else {
      next(null, {requestToken:oauthToken, 
                  requestTokenSecret:oauthTokenSecret, 
                  redirectUrl:config.authorizeUrl + "?oauth_token=" + oauthToken});
    }
  });
}


/**
  make accessToken request.  Given requestToken and requestTokenSecret (from requestToken api call), and
  queryoauthVerifier (from req.query.oauth_verifier), get accessToken and accessToken secret from LinkedIn.
  
  - next(err, result)

*/
function accessToken(requestToken, requestTokenSecret, queryOauthVerifier, next) {
  oauth.getOAuthAccessToken(requestToken, requestTokenSecret, queryOauthVerifier,
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        next(error);
      } else {
        next(null, {accessToken: oauthAccessToken, accessTokenSecret:oauthAccessTokenSecret});
      }
  });
}

// ====== Direct Login 2-Legged Oauth =============================================================

function getPostBody(username, password, options) {
  // WARNING: The fields *MUST* be in alphabetical order so that the signature is valid
  // NOTE: We need to encode the headers in the same way as passwords.
  var bodyParams;
  if (!options || options.captchaDisabled) {
    bodyParams =  {
      'linked_member_id': username,
      'linked_password': password
    };
  } else {
    bodyParams =  {
      'client_headers': encodePassword(JSON.stringify(options.client_headers)),
      'client_ip': options.client_ip,
      'device_id': options.device_id,
      'linked_member_id': username,
      'linked_password': password,
      'passed_challenge': options.passed_challenge
    };
  }
  return urlEncode(bodyParams);
}

PASSWORD_PLACEHOLDER = "PASSWORD";
function encodePassword(password) {
  var result = urlEncode({foo:password});
  // urlEncode does not encode special url characters WHICH SHOULD BE ENCODED if in password
  result = result.replace(/^foo=/, '');
  result = result.replace(/!/g, '%21');
  result = result.replace(/\*/g, '%2A');
  result = result.replace(/\(/g, '%28');
  result = result.replace(/\)/g, '%29');
  result = result.replace(/'/g, '%27');
  return result;
}

function getStringToSign(sigParams, password) {
  // encode password separately so that we can encode those with url meaning
  password = encodePassword(password);
  // encode the rest of request
  var result = urlEncode(sigParams)
  // substitute correctly encoded password
  result = result.replace(PASSWORD_PLACEHOLDER, password);
  return result;
}


function getSignature(username, password, options, nonce, timestamp) {
  // TODO: Ensure these are sorted at the OAuth library level
  // NOTE: These parameters must be sorted alphabetically in order to generate a valid signature
  var sigParams;
  if (!options || options.captchaDisabled) {
    sigParams =  {
      'linked_member_id': username,
      'linked_password': PASSWORD_PLACEHOLDER,
      'oauth_consumer_key': oauth._consumerKey,
      'oauth_nonce': nonce,
      'oauth_signature_method': oauth._signatureMethod,
      'oauth_timestamp': timestamp,
      'oauth_version': oauth._version
    };
  } else {
    sigParams =  {
      'client_headers': encodePassword(JSON.stringify(options.client_headers)),
      'client_ip': options.client_ip,
      'device_id': options.device_id,
      'linked_member_id': username,
      'linked_password': PASSWORD_PLACEHOLDER,
      'oauth_consumer_key': oauth._consumerKey,
      'oauth_nonce': nonce,
      'oauth_signature_method': oauth._signatureMethod,
      'oauth_timestamp': timestamp,
      'oauth_version': oauth._version,
      'passed_challenge': options.passed_challenge
    };
  }
  var stringToSign = getStringToSign(sigParams, password)
  var sigBase = oauth._createSignatureBase(config.directRequestMethod, config.directRequestUrl, stringToSign, config.apiSecret + '&');
  var result = oauth._createSignature(sigBase);
  return result;
}


function getAuthHeader(nonce, timestamp, signature) {
  var authHeaderParams = [
    "OAuth oauth_nonce=\"" + nonce + "\"",
    "oauth_signature_method=\"" + oauth._signatureMethod + "\"",
    "oauth_timestamp=\"" + timestamp + "\"",
    "oauth_consumer_key=\"" + oauth._consumerKey + "\"",
    "oauth_signature=\"" + signature + "\"",
    "oauth_version=\"" + oauth._version + "\"",
  ];
  var authHeader = authHeaderParams.join(', ');

  // NOTE: We may need to encode more characters than '+', but this is the one causing
  // whitespace errors in the OAuth signature
  authHeader = authHeader.replace(/\+/g, "%2B");
  return authHeader;
}

function getOAuthAccessToken(username, password, options, next) {
  var parsedUrl= URL.parse( config.directRequestServer, false );
  var nonce = oauth._getNonce(oauth._nonceSize);
  var timestamp = oauth._getTimestamp();
  var postBody = getPostBody(username, password, options);
  var signature = getSignature(username, password, options, nonce, timestamp);
  var authHeader = getAuthHeader(nonce, timestamp, signature);
  
  var headers= {
    "Authorization": authHeader,
    "Host": URL.parse(config.directRequestUrl)['host'],
    "Content-Length": postBody.length,
    "Content-Type": "application/x-www-form-urlencoded",
    "Client-Headers": encodePassword(JSON.stringify(options.client_headers)),
  };
  
  makeRequest(config.directRequestMethod, parsedUrl.protocol, parsedUrl.hostname, parsedUrl.port, parsedUrl.pathname, postBody, headers, function(err, statusCode, responseBody) {
    var uasResponse = {
      request: {
        method:config.directRequestMethod,
        url:config.directRequestUrl,
        body:postBody,
        headers:Util.inspect(headers)
      }
    };
    if (err) {
      uasResponse.response = {statusCode:err.statusCode, body:err.data};
    } else {
      uasResponse.response = {statusCode:statusCode, body:responseBody};
    }
    return next(err, uasResponse);
  });
};

function makeRequest(method, protocol, host, port, path, body, headers, callback) {
  var request= oauth._createClient(port, host, method, path, headers, (protocol.match(/^https/))); // true for https

  if( callback ) {
    var data="";
    var self= this;
    request.on('response', function (response) {

      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        data+=chunk;
      });
      response.on('end', function () {
        var results;
        try {
          // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
          // responses should be in JSON
          results= JSON.parse( data );
        }
        catch(e) {
          // .... However both Facebook + Github currently use rev05 of the spec
          // and neither seem to specify a content-type correctly in their response headers :(
          // clients of these services will suffer a *minor* performance cost of the exception
          // being thrown
          results= Querystring.parse( data );
        }
        if( response.statusCode != 200 ) {
          callback({ statusCode: response.statusCode, data: data });
        }
        else {
          callback(null, response.statusCode, results);
        }
      });
    });

    request.on('error', function(e) {
      callback(e);
    });

    if( (method == "POST" || method =="PUT") && body != null && body != "" ) {
      request.write(body);
    }
    request.end();
  }
  else {
    if( (method == "POST" || method =="PUT") && body != null && body != "" ) {
      request.write(body);
    }
    return request;
  }
  return;
};


// ====== EXPORTS =================================================================================

module.exports = {
  init : init,
  getOauth : getOauth,
  requestToken : requestToken,
  accessToken : accessToken,
  directLogin : getOAuthAccessToken,
};
