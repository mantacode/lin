var Assert = require('assert'),
    PersonAPI = require('../../../lib/api/v1/peopleAPI');

module.exports = {
  'Test profile defaults': function() {
    var options = {};
    var palRequest = PersonAPI.profile(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance)"});
  },
  'Test profile': function() {
    var options = {id:"12345", authToken:"MyAuthToken", fields:":(id,first-name,last-name)"};
    var palRequest = PersonAPI.profile(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  path:"people/12345:(id,first-name,last-name)?auth-token=MyAuthToken",
                                  headers:{"x-li-format":"json","x-li-auth-token":"MyAuthToken"}});
  },
  'Test connections defaults': function() {
    var options = {};
    var palRequest = PersonAPI.connections(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/connections:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance)"});
  },
  'Test connections': function() {
    var options = {id:"12345",
                   fields:":(id,first-name,last-name)",
                   start:0,
                   start:50,
                   since:1302819203000,
                   modified:"new"};
    var palRequest = PersonAPI.connections(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  headers:{"x-li-format":"json"},
                                  path:"people/12345/connections:(id,first-name,last-name)?start=50&modified-since=1302819203000&modified=new"});
  },
  'Test search defaults': function() {
    var options = {};
    var palRequest = PersonAPI.search(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  headers:{"x-li-format":"json"},
                                  path:"people-search:(people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))"});
  },
  'Test search': function() {
    var options = {fields:":(id,first-name,last-name)",
                   keywords:"Hello World",
                   start:0,
                   count:25,
                   firstName:"Billy",
                   lastName:"Smith",
                   companyName:"The LinkedIn",
                   currentCompany:true,
                   title:"Engineer",
                   currentTitle:false,
                   schoolName:"Fast Track School",
                   countryCode:"ABC",
                   postalCode:"12345-ABCDE",
                   distance:5,
                   sort:"connections"
                   };
    var palRequest = PersonAPI.search(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"people",
                                  headers:{"x-li-format":"json"},
                                  path:"people-search:(id,first-name,last-name)?keywords=Hello%20World&first-name=Billy&last-name=Smith&company-name=The%20LinkedIn&current-company=true&title=Engineer&school-name=Fast%20Track%20School&country-code=ABC&postal-code=12345-ABCDE&distance=5&count=25&sort=connections"});
  }
}


