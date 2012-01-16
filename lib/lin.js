var Fs = require('fs'),
    PalOAuth = require('./lib/palOAuth');

var apiCatalog;
var apiServerVersion;

/**
   Standard config values, keyed on environment
*/
var defaultConfigValues = {
  production: {
    "oauth": {
      "apiServer": "http://api.linkedin.com",
      "apiAuthority": "http://api.linkedin.com",
      "directRequestServer": "https://www.linkedin.com/uas/oauth/direct",
      "directRequestUrl": "https://www.linkedin.com/uas/oauth/direct",
      "tokenServer": "https://api.linkedin.com"
    }
  }
}


/**
  If config.env, then initialize default values based on chosen environment
*/
function initConfig(config) {
  if (!config) config = {};
  // if environment specified, initialize default values
  if (config.env) {
    if (!defaultConfigValues[config.env]) {
      console.log("Lin.init: unknown environment: " + config.env);
    } else {
      if (!config.oauth) config.oauth = {};
      if (!config.leo) config.leo = {};
      for (var key in defaultConfigValues[config.env].oauth) {
          config.oauth[key] = defaultConfigValues[config.env].oauth[key]
      }
    }
  }
  return config;
}
/**
  Initialize PAL.  Either fully specify the config, or pass an "env" variable in, indicating what defaults you'll accept.
  
  Example of fully specified config:
  config = {
    "oauth": {
      "apiKey": get from developer.linkedin.com
      "apiSecret": get from developer.linkedin.com
      "requestTokenCallback": path to your server that routes back to accessToken, ie: "http://localhost:3000/accessToken",
      
      "apiServer": "http://api.linkedin.com",
      "apiAuthority": "http://api.linkedin.com",
      "directRequestServer": "https://www.linkedin.com/uas/oauth/direct",
      "directRequestUrl": "https://www.linkedin.com/uas/oauth/direct",
      "tokenServer": "https://api.linkedin.com"
    }
    "apiServerVersion":"", //optional override v1 for blackbox deployments
  }
  
  If you'd prefer default environment, pass "env" in ("production" supported)
  Example:
  config = {
    "env":"production",
    "oauth": {
      "apiKey": get from developer.linkedin.com
      "apiSecret": get from developer.linkedin.com
      "requestTokenCallback": path to your server that routes back to accessToken, ie: "http://localhost:3000/accessToken", only needed for redirect-login
      }
  }
*/
function init(config) {
  config = initConfig(config);
  PalOAuth.init(config.oauth);
  apiServerVersion = config.apiServerVersion;
  
  // for each js file in api directory
  // build apiCatalog hash where key is versioned name of library (such as: 'v1_peopleAPI')
  // and value is require to appropriate module (eg: require('./api/v1/peopleAPI'))
  if (!apiCatalog) {
    apiCatalog = {};
    // TODO:  need to dynamically discover folders beneath api
    ["v1","v2"].forEach(function(version) {
      var path = __dirname + '/api/' + version;
      try {
        stats = Fs.lstatSync(path);
        Fs.readdirSync(path).forEach(function(filename){
          if (foo = filename.match(/(.*)\.js$/)) {
            apiCatalog[version + "_" + foo[1]] = require('./api/' + version + "/" + foo[1]);
          }
        });
      } catch (e) {}
    });
  }

}


/**
  Get parameters needed to make PAL request for chosen API and options.
  - version: eg: "v1"
  - apiClass: eg: "peopleAPI"
  - apiMethod:  string representing api method to call (see method names within lib/api/*API.js)
  - args*:  followed by additional arguments needed for the api call (see options for chosen method in lib/api/*API.js)
  
  Return everything you need to make the real request:  method, path, body, headers, etc.
*/
function api(apiVersion, apiClass, apiMethod) {
  var apiRequest = undefined;
  if (apiVersion && apiClass && apiMethod) {
    try {
      // grab the arguments and pop the first three off.  Pass the rest to the correct api method
      var args = [].slice.call(arguments, 0);
      var apiVersion = args.shift();
      var apiClass = args.shift();
      var apiMethod = args.shift();
      // find the handle to the correct module, call the method, and pass the args
      apiRequest = apiCatalog[apiVersion + "_" + apiClass][apiMethod].apply(this, args);
      if (apiRequest && apiRequest.path && apiVersion) { 
        if (typeof apiServerVersion == 'undefined') {
          apiRequest.path = apiVersion + "/" + apiRequest.path;
        } else {
          apiRequest.path = apiServerVersion + apiRequest.path;
        }
      }
    } catch (e) {
      console.log("Lin.api: unable to retrieve API for " + apiVersion + " " + apiClass + " " + apiMethod);
    }
  }
  return(apiRequest);
}


/**
  - credentials:  {linkedInId:"12345", token:{token:"abcd",secret:"12345"}}
  - options
  -- api: {method, path, body, headers}
  
  next callback (err, palResponse)
*/
function makeRequest(credentials, options, next) {
  if (!credentials || !credentials.token || !credentials.token.token) {
    return next("Lin.makeRequest invalid credentials");
  } else if (!options || !options.api || !options.api.path) {
    return next("Lin.makeRequest missing api specification");
  }
  return  PalOAuth.makeRequest(credentials, options, next);
}


// ====== PUBLIC ==============================================================

module.exports = {
  init: init,
  api: api,
  makeRequest: makeRequest,
  requestToken: PalOAuth.requestToken,
  accessToken: PalOAuth.accessToken
};
