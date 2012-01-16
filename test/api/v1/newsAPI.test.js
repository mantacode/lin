var Assert = require('assert'),
    NewsAPI = require('../../../lib/api/v1/newsAPI');

module.exports = {
  'Test top news': function() {
    var palRequest = NewsAPI.topNews();
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"news",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/topics/id=TOP_NEWS_TODAY:(id,title,description,because-of,topic-stories:(topic-articles:(is-read,relevance-data:(global-share-count,in-topic-share-count),article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))))?max-shared-by-people-degree=1&max-shared-by-people=1&max-articles=0&max-stories=100"});
  },
  'Test top news options': function() {
    var options = {start:11,count:5, maxSharedByPeopleDegree:2,maxArticles:2,maxStories:50};
    var palRequest = NewsAPI.topNews(options);
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"news",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/topics/id=TOP_NEWS_TODAY:(id,title,description,because-of,topic-stories:(topic-articles:(is-read,relevance-data:(global-share-count,in-topic-share-count),article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))))?count=5&start=11&max-shared-by-people-degree=2&max-shared-by-people=1&max-articles=2&max-stories=50"});
  },
  'Test shared news': function() {
    var palRequest = NewsAPI.sharedNews();
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"news",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/topics/id=FIRST_DEGREE_NEWS_TODAY:(id,title,description,because-of,topic-stories:(topic-articles:(is-read,relevance-data:(global-share-count,in-topic-share-count),article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance))))?max-shared-by-people-degree=1&max-shared-by-people=1&max-articles=0&max-stories=100"});
  },
  'Test followed topics': function() {
    var palRequest = NewsAPI.followedTopics();
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"news",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/topics:(id,title,description,because-of)?type=FOLW"});
  },
  'Test article': function() {
    var palRequest = NewsAPI.article("articleID",{fields:":(is-read,when-saved,relevance-data,article-content,shared-in-network-count,trending-in-entities,shared-by-people)"});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"news",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/articles/articleID:(is-read,when-saved,relevance-data,article-content,shared-in-network-count,trending-in-entities,shared-by-people)"
                                  });
  },
}