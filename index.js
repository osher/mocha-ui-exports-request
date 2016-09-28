var extend  = require('util')._extend;
var request = require('request');

Object.defineProperty(exports, 'request'
, { get: function() { return requestTester }
  , set: function(v) { request = v || require('request') } //TRICKY: for tests, to inject http request mock
  , enumerable  : true
  , configurable: false
  }
);

function requestTester(options){ 
    return {
      responds:  
      function(expect){ 
          var ctx = {}
            , res
            , suite =  {
            beforeAll: 
            function(done) {
                if ('function' == typeof options) options = options();
                
                request(options, function(oErr,oRes, body) {
                    ctx.res = res = oRes;
                    ctx.err = oErr;
                    ctx.body = body;
                    if (res) ctx.headers = res.headers;
                    expect.err ? done() : done(oErr)
                })
            }
          };

          if (expect.err)
            suite['should end with error with message like ' + expect.err ] = 
              expect.err instanceof RegExp
                ? function() {
                      Should(ctx.err).be.ok;
                      ctx.err.message.should.match(expect.err)
                  }
                : function() {
                      Should(ctx.err).be.ok;
                      ctx.err.message.should.include(expect.err)
                  }
                ;

          if (expect.status)
              suite["should return status " + expect.status] = function() {
                  res.should.have.property('status', expect.status);
              };

          if (expect.headers)
              Object.keys(expect.headers).forEach(function(header) {
                  var expected = expect.headers[header];
                  suite["should emit http-header: '" + header + "' as " + expected ] = 
                    expected instanceof RegExp
                      ? function() {
                            res.headers.should.have.property(header);
                            res.headers[header].should.match(expected)
                        }
                      : function() {
                            res.headers.should.have.property(header);
                            res.headers[header].should.eql(expected)
                        }
                      ;
              });
          
          if (  expect.responseHeaders
             && 'object' == typeof expect.responseHeaders
             && Object.keys(expect.responseHeaders).length
             )
              suite["response headers"] = toSubsuite(expect.responseHeaders, 'headers');

          if (!expect.body) expect.body = [];
          if (!Array.isArray(expect.body)) expect.body = [ expect.body ];

          if (expect.json) 
              expect.body.push( JSON.stringify(expects.json) );

          expect.body.forEach(function(body) { 
              if (body instanceof RegExp)
                  suite["body should match : " + body] = 
                      function() {
                          res.should.have.property('body');
                          res.body.should.match(body)
                      };
              else if ('object' == typeof body 
                   && body
                   && Object.keys(body).length
                    ) 
                  suite["response body"] = toSubsuite(body, 'body');
              else //body is string
                  suite["body should be : " + body.substr(0,20) + (body.length > 20 ? "..." : "" )] = 
                      function() {
                          res.should.have.property('body', body )
                      };
          });

          if (  expect.responseBody
             && 'object' == typeof expect.responseBody
             && Object.keys(expect.responseBody).length
             )
              suite["response body"] =
                extend(
                  suite["response body"] || {}
                , toSubsuite(expect.responseBody, 'body')
                );
          
          if (expect.and) 
              suite.and = toSubsuite(expect.and, 'res')
                
          
          return suite;
          
          /** 
            converts recursively all handlers that expect a SUT as a single param
            to a synchronous mocha handler, passing the original handler the SUT it needs
           */
          function toSubsuite(raw, sutName) {
              return Object.keys(raw).reduce( function(wrapped,title) {
                  var fTest = raw[title]
                  switch(typeof fTest) {
                    case 'function': //function of the sut part
                      wrapped[title] = function() { 
                          //TRICKY: cannot optimize by assign ctx[sutName] into a var: it is
                          // not available on declare time
                          fTest(ctx[sutName])
                      };
                      break;
                    case 'object': //nested subsuite for some reason
                      wrapped[title] = toSubsuite(fTest, sutName);
                      break;
                    default: //null, string, pending, whatever
                      wrapped[title] = fTest;
                  }
                  return wrapped
              }, {})
          }
      } 
    } 
}