var Assert = require('assert'),
    UpdateAPI = require('../../../lib/api/v1/updatesAPI');

module.exports = {
  'Test updates defaults': function() {
    var options = {};
    var palRequest = UpdateAPI.updates("CONN,PICT,PRFU,JGRP,JOBS,RECU,PRFX,SHAR,STAT", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/network/updates:(timestamp,update-key,update-type,update-content:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance,connections,current-share,main-address,twitter-accounts,im-accounts,phone-numbers,date-of-birth,member-groups)),updated-fields,is-commentable,update-comments,is-likable,is-liked,num-likes)?type=CONN&type=PICT&type=PRFU&type=JGRP&type=JOBS&type=RECU&type=PRFX&type=SHAR&type=STAT"});
  },
  'Test updates': function() {
    var options = {id:"12345", start:10, count:50, scope:'self', after:1302552225000, before:1303247798098};
    var palRequest = UpdateAPI.updates("CONN,PICT,PRFU,JGRP,JOBS,RECU,PRFX,SHAR,STAT", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/12345/network/updates:(timestamp,update-key,update-type,update-content:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance,connections,current-share,main-address,twitter-accounts,im-accounts,phone-numbers,date-of-birth,member-groups)),updated-fields,is-commentable,update-comments,is-likable,is-liked,num-likes)?type=CONN&type=PICT&type=PRFU&type=JGRP&type=JOBS&type=RECU&type=PRFX&type=SHAR&type=STAT&start=10&count=50&scope=self&before=1303247798098&after=1302552225000"});
  },
  'Test likes defaults': function() {
    var options = {};
    var palRequest = UpdateAPI.likes("NUS_ID", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/network/updates/key=NUS_ID/likes:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))"});
  },
  'Test likes': function() {
    var options = {start:11, count:5};
    var palRequest = UpdateAPI.likes("NUS_ID", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/network/updates/key=NUS_ID/likes:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))?start=11&count=5"});
  },
  'Test comments defaults': function() {
    var options = {};
    var palRequest = UpdateAPI.comments("NUS_ID", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/network/updates/key=NUS_ID/update-comments:(id,sequence-number,comment,timestamp,person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance,api-standard-profile-request))"});
  },
  'Test comments': function() {
    var options = {start:11, count:5};
    var palRequest = UpdateAPI.comments("NUS_ID", options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"updates",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/network/updates/key=NUS_ID/update-comments:(id,sequence-number,comment,timestamp,person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance,api-standard-profile-request))?start=11&count=5"});
  },
  'Test like true': function() {
    var palRequest = UpdateAPI.like("NUS_ID", true);
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/is-liked",
                                  body:"true",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test like "true"': function() {
    var palRequest = UpdateAPI.like("NUS_ID", "true");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/is-liked",
                                  body:"true",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test like default': function() {
    var palRequest = UpdateAPI.like("NUS_ID");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/is-liked",
                                  body:"true",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test unlike false': function() {
    var palRequest = UpdateAPI.like("NUS_ID", false);
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/is-liked",
                                  body:"true",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test unlike false': function() {
    var palRequest = UpdateAPI.like("NUS_ID", "false");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/is-liked",
                                  body:"false",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test comment': function() {
    var palRequest = UpdateAPI.comment("NUS_ID", "Say Something Profound");
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  path:"people/~/network/updates/key=NUS_ID/update-comments",
                                  body:"{\"comment\":\"Say Something Profound\"}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"}});
  },
  'Test share w/o twitter': function() {
    var palRequest = UpdateAPI.share({comment:"blah blah blah"});
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  body:"{\"visibility\":{\"code\":\"anyone\"},\"comment\":\"blah blah blah\"}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  path:"people/~/shares"});
  },
  'Test share w/ twitter false': function() {
    var palRequest = UpdateAPI.share({twitter: false, visibility:"connections", comment:"yada yada"});
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  body:"{\"visibility\":{\"code\":\"connections-only\"},\"comment\":\"yada yada\"}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  path:"people/~/shares"});
  },
  'Test share w twitter "false"': function() {
    var palRequest = UpdateAPI.share({twitter: "false",contentTitle:"Title",contentUrl:"Url", contentImage:"Image"});
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  body:"{\"visibility\":{\"code\":\"anyone\"},\"content\":{\"title\":\"Title\",\"submitted-url\":\"Url\",\"submitted-image-url\":\"Image\"}}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  path:"people/~/shares"});
  },
  'Test share w twitter "true"': function() {
    var palRequest = UpdateAPI.share({twitter: "true", comment:"foo"});
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  body:"{\"visibility\":{\"code\":\"anyone\"},\"comment\":\"foo\"}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  path:"people/~/shares?twitter-post=true"});
  },
  'Test share w twitter true': function() {
    var palRequest = UpdateAPI.share({twitter: true, comment:"testing..."});
    Assert.deepEqual(palRequest, {method:'POST', 
                                  resource:"updates",
                                  body:"{\"visibility\":{\"code\":\"anyone\"},\"comment\":\"testing...\"}",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  path:"people/~/shares?twitter-post=true"});
  },
}
