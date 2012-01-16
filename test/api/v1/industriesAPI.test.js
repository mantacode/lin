var Assert = require('assert'),
    IndustryAPI = require('../../../lib/api/v1/industriesAPI');

module.exports = {
  'Test industry name': function() {
    var name = IndustryAPI.industryName(125);
    Assert.deepEqual(name, "Alternative Medicine");
  },
  'Test recommended industries': function() {
    var palRequest = IndustryAPI.recommended({start:3,count:5});
    Assert.deepEqual(palRequest, {method:'GET',
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/suggestions/to-follow:(industries:(id,relation-to-viewer))?start=3count=5",
                                  resource:"industry"});
  },
  'Test followed industries': function() {
    var palRequest = IndustryAPI.followed({start:3,count:5});
    Assert.deepEqual(palRequest, {method:'GET',
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/following/industries?start=3count=5",
                                  resource:"industry"});
  },
  'Test follow industry': function() {
    var palRequest = IndustryAPI.follow(125);
    Assert.deepEqual(palRequest, {method:'POST', 
                                  path:"people/~/following/industries",
                                  body:"<?xml version=\"1.0\" encoding=\"UTF-8\"?><industry><id>125</id></industry>",
                                  headers:{"x-li-format":"xml","Content-Type":"application/xml;charset=UTF-8"},
                                  resource:"industry"});
  },
  'Test unfollow industry': function() {
    var palRequest = IndustryAPI.unfollow(125);
    Assert.deepEqual(palRequest, {method:'DELETE', 
                                  path:"people/~/following/industries/id=125",
                                  resource:"industry"});
  },
  'Test preview industry': function() {
    var palRequest = IndustryAPI.preview(125);
    Assert.deepEqual(palRequest, {method:'GET',
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/topics/industry-id=125:(id,title,description,because-of,topic-stories:(topic-articles:(is-read,relevance-data:(global-share-count,in-topic-share-count),article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))))",
                                  resource:"industry"});
  },
}