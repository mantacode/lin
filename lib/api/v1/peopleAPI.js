var PEOPLE_RESOURCE = "people";

// standardPersonFields: ":(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance)";

function standardPersonFields() {
  return "id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance";
}
function basicPersonFields() {
  return "id,first-name,last-name,headline,picture-url,auth-token,distance";
}


/**
  Profile:
  Get a user's profile.  If no id is passed, view your own profile.  If no authToken is provided, you can view profiles
  within your 1st degree connections.  If viewing outside of your connections, provide an authToken (received via search, for example)
  *  options:
    -  id: target linkedin id (else default "self")
    -  fields: what profile fields do you want returned (else default set)
    -  authToken: needed to view out of network profiles (retrieved from search results)
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','peopleAPI','profile', {id:"15003820", authToken:'NAME:Yc02'});
*/
function profile(options) {
  if (!options) options = {};
  var url = ["people/"];
  url.push(options.id || "~");
  url.push(options.fields ||  ":(" + standardPersonFields() + ")");
  var params = [];
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  if (options.authToken) {
    params.push("auth-token=" + options.authToken);
    headers['x-li-auth-token'] = options.authToken;
  }
  if (options.start) params.push("start=" + options.start);
  if (options.count) params.push("count=" + options.count);
  if (params.length > 0) {
    url.push("?");
    url.push(params.join('&'));
  }
  var palRequest = {method:'GET', path:url.join(''), headers:headers, resource:PEOPLE_RESOURCE};
  return palRequest;
}

/**
  Connections:
  Get a user's first-degree connections:
  *  options:
    -  id: target linkedin id (else default "self")
    -  fields: what profile fields do you want returned (else default set)
    -  start:0,
    -  count:10,
    -  since:1302819203000 (optional timestamp applied to modified field -- return only changes SINCE this time)
    -  modified:"new"  #  new, updates, new-or-updated, or undefined
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','peopleAPI','connections', {id:"15003820"});
*/
function connections(options) {
  var url = ["people/"];
  url.push(options.id || "~");
  url.push("/connections");
  url.push(options.fields || ":(" + standardPersonFields() + ")");
  var params = [];
  if (options.start) params.push("start=" + options.start);
  if (options.count) params.push("count=" + options.count);
  if (options.since) params.push("modified-since=" + options.since);
  if (options.modified) params.push("modified=" + options.modified);
  if (params.length > 0) {
    url.push("?");
    url.push(params.join('&'));
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:PEOPLE_RESOURCE};
}

function dasherize(str) {
  return str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
}


/**
  Search:
  Search for people
 
  http://developer.linkedin.com/docs/DOC-1191
 ":(people:(id,first-name,last-name,formatted-name,formatted-phonetic-name,picture-url,headline),facets:(code,buckets:(code,name)))"
 *  options:
   -  fields: ":(id,first-name,last-name,formatted-name,formatted-phonetic-name,picture-url,headline)"
   -  keywords: [space delimited keywords]
   -  firstName: [first name]
   -  lastName: [last name]
   -  companyName: [company name]
   -  currentCompany: [true|false]
   -  title: [title]
   -  currentTitle: [true|false]
   -  schoolName: [school name]
   -  currentSchool: [true|false]
   -  countryCode: [country code]
   -  postalCode: [postal code]
   -  distance: [miles]
   -  start: [number]
   -  count: [1-25]
   -  sort: [connections|recommenders|distance|relevance]
   -  networkOptions: A string like "F,S,O". Valid options are F, S, A, O. See doc above for more info.
   -  facets: ["location,us:84", "location,fr:0","network,facet"]  <<<<<<< not supported yet
   
   example:
   var Lin = require('lin');
   var api = Lin.api('v1','peopleAPI','search', {keywords:"Alex Zoff"});
*/
function search(options) {
  var fields = options.fields ? options.fields : ":(people:(" + standardPersonFields() + "))";
  
  var params = [];
  var keys = ["keywords","firstName","lastName","companyName", "currentCompany","title","currentTitle","schoolName",
              "currentSchool","countryCode","postalCode","distance","start","count","sort"];
  for(var i in keys) {
    if (options[keys[i]]) params.push(dasherize(keys[i]) + "=" +  encodeURI(options[keys[i]]));
  }
  if (options.networkOptions) {
    params.push("facet=network," + options.networkOptions);
  }
  
  var url = ["people-search"];
  url.push(fields);
  if (params.length > 0) url.push("?");
  url.push(params.join('&'));
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:PEOPLE_RESOURCE};
}


// ====== EXPORTS ==============================================================

module.exports = {
  profile: profile,
  connections: connections,
  search: search,
  standardPersonFields:standardPersonFields,
  basicPersonFields:basicPersonFields
};;
