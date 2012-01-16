var LIOAuth = require('./linkedInOauth');

// config defaults
var config = {};


/**
  Initialize PAL -- override config defaults
  configOptions:
    {"apiKey": get from developer.linkedin.com
     "apiSecret": get from developer.linkedin.com
     "apiServer":"http://api.linkedin.com:80", 
     "apiAuthority":"http://api.linkedin.com:80",
     "directRequestServer":"https://www.linkedin.com",
     },
*/
function init(configOptions) {
  if (!configOptions || !configOptions.apiServer || !configOptions.apiAuthority) {
    throw new Error("palOauth missing config.  Suggested configOptions:\n-apiServer: 'http://api.linkedin.com/v1/\n-apiAuthority: 'http://api.linkedin.com/v1/'\n");
  }
  config.apiAuthority = configOptions.apiAuthority;
  config.apiServer = configOptions.apiServer;
  LIOAuth.init(configOptions);
}


/**
  response = {
    - credentials // person making request
    - runtime     // msec
    - request  {
      - method
      - url
      - body
      - headers
      - resource // shortened string code used to categorize PAL resource, such as "people", "mailbox"
      }
    - response {statusCode, body, error}
  }
*/
function buildResponse(runtime, credentials, apiRequest, palResponseBody, palResponse, err) {
  var statusCode = err ? err.statusCode : (palResponse ? palResponse.statusCode : '');
  var response = {runtime:runtime, credentials:credentials, request:apiRequest, response:{statusCode:statusCode}};
  
  if (palResponseBody) response.response.body = palResponseBody;
  if (palResponse && palResponse.headers) response.request.headers = palResponse.headers;
  if (err && err.data) {
    var msg = err.data.match(/"message": "([^"]*)"/); // WARNING:  THIS WILL FAIL IF " or \" in error message
    if (msg && (msg.length > 1)) {
      response.response.error = msg[1];
    }
  }
  return(response);
}

/**
  Make request to PAL via OAuth
  - credentials: {token:{token:"abc",secret:"def"}}
  - options
  -- api: {method:"post",path:"foo",body:"blah",headers:{a:"b"}}
  
  next(err, response)

*/
function makeRequest(credentials, options, next) {
  if (!credentials || 
      !credentials.token || 
      !credentials.token.token || 
      !credentials.token.secret || 
      !options || 
      !options.api || 
      !options.api.path) {
    return next("Pal.makeRequest missing options");
  }
  
  var api = options.api;
  api.authority = config.apiAuthority + "/" + api.path;
  api.url = config.apiServer + "/" + api.path;
  var extraHeaders = api.headers ? api.headers : {"x-li-format":"json"};
  
  // this callback is called after each PAL call. It depends on previously scoped variables
  var startTime = new Date();
  function palCallback(err, palResponseBody, palResponse) {
    var runtime =  ((new Date()) - 1.0*startTime);
    return next(err, buildResponse(runtime, credentials, api, palResponseBody, palResponse, err));
  }
  
  switch (api.method) {
  case "POST":
    LIOAuth.getOauth().post(api.authority, api.url, credentials.token.token, credentials.token.secret, api.body, api.headers["Content-Type"], extraHeaders, palCallback);
    break;
  case "PUT":
    LIOAuth.getOauth().put(api.authority, api.url, credentials.token.token, credentials.token.secret, api.body, api.headers["Content-Type"], extraHeaders, palCallback);
    break;
  case "DELETE":
    LIOAuth.getOauth().delete(api.authority, api.url, credentials.token.token, credentials.token.secret, palCallback);
    break;
  default:
    LIOAuth.getOauth().get(api.authority, api.url, credentials.token.token, credentials.token.secret, extraHeaders, palCallback);
    break;
  }
}


/**
- getOuath
----------
Return handle to "inner" oauth object (needed by VCR)
*/
function getOauth() {
  return LIOAuth.getOauth();
}


// ====== PUBLIC ==============================================================
var interface = {
  getOauth: getOauth,
  init: init,
  directLogin: LIOAuth.directLogin,
  requestToken: LIOAuth.requestToken,
  accessToken: LIOAuth.accessToken,
  makeRequest: makeRequest
};
module.exports = interface;