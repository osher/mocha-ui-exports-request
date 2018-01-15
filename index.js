var extend  = require('util')._extend;
var request = require('request');

Object.defineProperty(module.exports = requestTester, 'request'
, { get:          function() { return requestTester }
  , set:          function(v) { request = v || require('request') } //TRICKY: for tests, to inject http request mock
  , enumerable  : true
  , configurable: false
  }
);

requestTester.skip = function skip(options) {
    if ('string' == typeof options) options = { url: options };
    const suite = requestTester( extend(options, {skip: true} ));
    return suite
    return isUiBdd() ? suite.bddCtx() : suite
}

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
          
          if (options.skip) suite.skip = true;

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

          if (expect.statusCode || expect.status)
              suite["should return status " + expect.status] = function() {
                  res.statusCode.should.eql( expect.statusCode || expect.status );
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
                          (!!res.body).should.be.True('response object does not have `.body` attribute');
                          res.body.should.match(body)
                      };
              else if ('object' == typeof body 
                   && body
                   && Object.keys(body).length
                    ) 
                  suite["response body"] = toSubsuite(body, 'body');
              else if ('string' == typeof body)
                  suite["body should be : " + body.substr(0,20) + (body.length > 20 ? "..." : "" )] = 
                      function() {
                          (!!res.body).should.be.True('response object does not have `.body` attribute');
                          res.body.should.eql( body )
                      };
              else
                  throw extend(
                      new Error(
                      [ 'invalid body passed to responds({body})'
                      , 'body may be: '
                      , ' - an exact expected string'
                      , ' - a regex to match against response body text'
                      , ' - a suite Object that maps title -> test|suite'
                      , ' - an array of regexes and one body suites'
                      ]
                    )
                  , { body: body }
                  );
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
              suite.and = toSubsuite(expect.and, 'res');
                
          Object.defineProperty(suite, 'bddCtx', {
            value:        function() {
                toStdBdd(suite, global);
                return ctx
            },
            enumerable:   false,
            writable:     false,
            configurable: true
          });

          if (isUiBdd())
              return suite.bddCtx();
          
          return suite;
          
          /** 
            converts recursively all handlers that expect a SUT as a single param
            to a synchronous mocha handler, passing the original handler the SUT it needs
            or a handler that expects a SUT and a callback for check against async source
           */
          function toSubsuite(raw, sutName) {
              return Object.keys(raw).reduce( function(wrapped,title) {
                  var fTest = raw[title]
                  switch(typeof fTest) {
                    case 'function': //function of the sut part
                      wrapped[title] = 
                        fTest.length == 2
                          ? function(done) { fTest(ctx[sutName], done) }
                          : function()     { fTest(ctx[sutName]      ) };
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

          function toStdBdd(suite, ctx) {
              var skip = suite.skip;
              Object.keys(suite).forEach(function(title) {
                  switch( typeof suite[title] ) {
                    //actual handlers
                    case 'function': 
                      switch(title) {
                        case 'beforeAll': 
                        case 'setup':       return skip ? null : ctx.before(suite[title]);
                        case 'beforeEach':  return skip ? null : ctx.beforeEach(suite[title]);
                        case 'afterEach':   return skip ? null : ctx.afterEach(suite[title]);
                        case 'afterAll': 
                        case 'teardown':    return skip ? null : ctx.after(suite[title]);
                        case 'timeout':     return; //for now - we don't have it, but not to forget
                      }
                      return (skip ? ctx.it.skip : ctx.it)(title, suite[title]);

                    //pending tests
                    case 'string':
                      if ('skip' == title) return;
                    case 'undefined': 
                    case 'boolean':
                      return ctx.it(title); 
                        
                    //subsuites
                    case 'object': 
                      (skip ? ctx.describe.skip : ctx.describe)(title, function() { toStdBdd( suite[title], global) } )
                  }
              })
          }
      }
    }
}

function isUiBdd() {
    var uiIx    = process.argv.indexOf('--ui');
    return uiIx == -1 
      ? true 
      : process.argv[ uiIx + 1 ] == "bdd";
}