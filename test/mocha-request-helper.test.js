var helper  = require('../')
  , async   = require('async')
  , request = helper
  ;

module.exports = 
{ "request" : 
  { "should be a factory function that names 1 argument - request options" :
    function(){
        request.should.be.type('function');
        request.length.should.eql(1);
    }
  , "when used with single argument" : 
    block(function() { 
        var suite = {};

        addInitiationCheck( 
          suite
        , 'http://some.server.net/'
        );

        addInitiationCheck( 
          suite
        , { uri: 'http://some.server.net/'
          , method: 'POST'
          , form: {a: 1 }
          }
        );
        
        addInitiationCheck( 
          suite
        , function() { return 'http://some.server.net/' }
        );

        addInitiationCheck( 
          suite
        , function() { return { uri: 'http://some.server.net/my/res', method: 'DELETE' } }
        );
        
        return suite;
    })
  , "#responds(expect, customSuite) " : 
    { "with" : 
      { "status assertion" : 
        respondsCheck( 
          { status: 200 
          }
        , { "correct status code should pass" : 
            { throw   : null
            , response: 
              { statusCode: 200 
              }
            }
          , "wrong status code should fail" : 
            { throw   : /expected 500 to equal 200/
            , response: 
              { statusCode: 500
              }
            }
          }
        )
      , "few http header assertions as strings" : 
        respondsCheck( 
          { headers: 
            { header1 : 'val1'
            , header2 : 'val2' 
            } 
          } 
        , { "correct http-header should pass" : 
            { throw   : null
            , response: 
              { headers : 
                { header1 : 'val1' 
                , header2 : 'val2' 
                } 
              }
            }
          , "http header found with wrong value should fail" : 
            { throw   : /' to equal '/
            , response:
              { headers : 
                { header1 : 'uh uh...' 
                } 
              }
            }
          , "missing http-header should fail" : 
            { throw   : /to have property/
            , response: 
              { headers : {} 
              }
            }
          }
        )
      , "few http header assertions as regexp" : 
        respondsCheck( 
          { headers: 
            { "reg-header1" : /val1/
            , "reg-header2" : /val2/ 
            } 
          } 
        , { "http-header with matching value should pass" : 
            { throw   : null
            , response: 
              { headers : 
                { "reg-header1": "this is val1 header" 
                , "reg-header2": "this is val2 header" 
                } 
              }
            }
          , "http-header with unmatching value should fail" : 
            { throw   : /expected '.+' to match/
            , response: 
              { headers : 
                { "reg-header1": "this header does not match" 
                } 
              }
            }
          , "missing http-header should fail" : 
            { throw   : /to have property/
            , response: 
              { headers : {} 
              }
            }
          , "missing second http-header should fail" : 
            { throw   : /expected .+ to have property 'reg-header2'/
            , response: 
              { headers : 
                { "reg-header1": "this is val1 header"
                } 
              }
            }
          }
        )
      , "body assertion as a short string check" : 
        respondsCheck( 
          { body: 'string check' 
          }
        , { "correctly returned provided body should pass" : 
            { response: 
              { body: 'string check'
              }
            }
          , "different body should throw" :
            { throw: true
            , response: 
              { body: 'string fail'
              }
            }
          }
        )
      , "body assertion as a long string check" : 
        respondsCheck( 
          { body: 'a very very very very very very very very long string check' 
          } 
        , { "matching returned body should pass" : 
            { response: 
              { body: 'a very very very very very very very very long string check'
              }
            }
          , "different body should throw" :
            { throw: true
            , response: 
              { body: 'string fail'
              }
            }
          }
        )
      , "body assertion as reg-ex check" : 
        respondsCheck( 
          { body: /string check/ 
          } 
        , { "matching returned body should pass" : 
            { response: 
              { body: 'some very interesting string check for regexp'
              }
            }
          , "different body should throw" :
            { throw: true
            , response: 
              { body: 'some very interesting failing check for regexp'
              }
            }
          }
        )
      , "body assertion as addhock subsuite" : 
        respondsCheck( 
          { body: 
            { 'should answer my private adhoc logic' : 
              function(body) {
                  body.should.include('correct')
              },
              'should answer my private adhoc extended logic' : 
              function(body) {
                  body.should.not.include('wrong')
              }
            }
          }
        , { "request body that satisfies all handlers should pass" : 
            { response: 
              { body: 'this is a correct body'
              }
            }
          , "request body that does not satisfy any handlers should fail" :
            { throw: true
            , response: 
              { body: 'this looks correct but is wrong'
              }
            }
          , "request body that does not satisfy all handlers should fail" :
            { throw: true
            , response: 
              { body: 'this is absolutely wrong'
              }
            }
          }
        )
      , "body assertions as array of checks" :
        respondsCheck( 
          { body: 
            [ /^string/
            , /to be/
            , /checked$/
            , { 'adhock rule 1' : function(body) { body.should.be.ok } 
              , 'adhock rule 2' : function(body) { body.should.be.ok } 
              }
            ]
          }
        , { "body matching all checks should pass" :
            { response:
              { body: 'string to be checked'
              }
            }
          , "body matching matching partially should fail" :
            { throw: true
            , response:
              { body: 'string to be validated'
              }
            }
          }
        )
      , "expected error assertion (mind that it's basically network errors, not HTTP errors)" : 
        respondsCheck(
          { err: /this error/
          }
        , { 'response errors the expected error - should pass' : 
            { err: new Error('this error')
            }
          , 'response errors a different error - should fail' : 
            { throw: true
            , err: new Error('another error')
            }
          , 'response does not error for expected error - should fail' : 
            { throw: true
            , response: {}
            }
          }
        )
      , "assertions against the entire http-headers collection" : 
        respondsCheck(
          { responseHeaders: {
              "there should be x-header-a or x-header-b" : function(headers) {
                  ['x-header-a', 'x-header-b'].filter(function(header) {
                      return headers[header]
                  }).length.should.be.ok();
              }
            }
          }
        , { "headers that satisfy responseHeaders custom check should pass" : 
            { response: 
              { headers: 
                { 'x-header-b' : 'value' 
                }
              }
            }
          , "headers that dont satisfy responseHeaders custom check should fail" : 
            { throw: true
            , response: 
              { headers: 
                { 'x-header-c' : 'value' 
                }
              }
            }
          }
        )
      , "assertions against the responseBody as responseBody" : 
        respondsCheck(
          { responseBody: 
            { 'should answer my cool logic rule 1' : function(body) {
                  body.should.include( { a: { b: { c: 'd' } } } )
              },
              'should answer my cool logic rule 2' : function(body) {
                  body.should.not.include( { a: { f: true } } )
              }              
            }
          }
        , { 'response body that satisfies the check should pass' : 
            { response: 
              { body: { a : { b : { c: 'd' } } } 
              }
            }
          , 'response body that does not satisfy the check should fail' : 
            { throw: true
            , response: 
              { body: { a : { b : { c: 'f' } } } 
              }
            }
          }
        )
      , "adhock assertions against the entire response object" : 
        respondsCheck(
          { status: 200
          , and: 
            { 'should be cool synchronously' : 
              function(res) { 
                  Should(res.cool).be.True('A SYNC CHECK FAILED')
              }
            , 'should be cool asynchronously' :
              function(res, done) {
                  process.nextTick( function() {
                      Should(res.asyncool).be.True('AN ASYNC CHECK FAILED')
                      done()
                  })
              }
            }
          }
        , { 'response that satisfies all should pass' : 
            { response: 
              { statusCode:   200
              , headers:  {}
              , body:     "very cool"
              , cool:     true
              , asyncool: true
              }
            }
          , 'response that does not satisfy synchronously should fail synchronously' : 
            { throw: /A SYNC CHECK FAILED/
            , response: 
              { statusCode:   200
              , headers:  {}
              , body:     "very cool"
              , cool:     false
              , asyncool: true
              }
            }
          , 'response that does not satisfy asynchronously should fail asynchronously' : 
            { throw: /AN ASYNC CHECK FAILED/
            , response: 
              { statusCode:   200
              , headers:  {}
              , body:     "very cool"
              , cool:     true
              , asyncool: false
              }
            }            
          }
        )
      , "nesting async mocha hooks in sub-suites should work": 
        block(function() {
            var ooo = []; //Order Of Operations
            return respondsCheck(
              { status: 200
              , and: 
                { beforeAll: function(done) {  ooo.push('beforeAll'); done() }
                , beforeEach: function(done) {  ooo.push('beforeEach'); done() }
                , 'foo': 
                  { beforeAll: function() {  ooo.push('  beforeAll') }
                  , beforeEach: function(done) {  ooo.push('  beforeEach'); done() }
                  , 'a cool test': function() { ooo.push('    cool1') }
                  , 'a 2nd cool test': function() { ooo.push('    cool2') }
                  , afterEach: function() {  ooo.push('  afterEach')  }
                  , afterAll: function(done) {  ooo.push('  afterAll'); done() }
                  }
                , 'bar': 
                  { 'should call beforeAll and afterAll': function() {
                      Should(ooo).eql(
                        //TRICKY: test here is not run by mocha, but by our mock-mocha.
                        // our mock is primitive - it does not call hooks logically, 
                        // but on the order they appear on the object
                        //The meaning of the test is to see that hooks are wrapped correctly
                        [ 'beforeAll'
                        , 'beforeEach'
                        , '  beforeAll'
                        , '  beforeEach'
                        , '    cool1'
                        , '    cool2'
                        , '  afterEach'
                        , '  afterAll'
                        ]
                      )
                    }
                  }
                }
              }
            , { 'a successful response should fire all mocha hooks without problems': 
                { response:
                  { statusCode: 200
                  , headers:    {}
                  , body:       "cool"
                  }
                }
              }
            )
        })
      , "all declarative options used together" : 
        respondsCheck( 
          { status: 404
          , headers: 
            { 'content-type' : "text/html"
            , 'x-header'     : /.*/
            }
          , body: /string check/
          , responseHeaders: 
            { "there should be x-header-a or x-header-b" : 
              function(headers) {
              }
            }
          } 
        )
      }
    }
  , '.skip(options)':
    { 'should return the same suite the original handler return, with the skip flag':
      function() {
          var opts = { url: 'http://foo.com', method: 'GET' }
          var orig = request({ url: 'http://foo.com', method: 'GET' }).responds({status: 200 })
          var skipped = request.skip({ url: 'http://foo.com', method: 'GET' }).responds({status: 200 })
          
          orig.skip = true;
          
          Should(orig).eql(skipped)
      }
    }
  }
}




function respondsCheck(expect, asserts) {

    var uri = "http://url.is.not/important/-/" + Math.random()
      , r = request(uri)
      , suite
      ;

    suite = 
      { beforeAll: 
        function() {
            //TRICKY! on run-time - the suite changes to the test suite
            suite = r.responds(expect)
        }
      }

    suite["'beforeAll' setup function is found"] = 
        testFound('beforeAll');    
    
    if (expect.status)
        suite["check added for: status"] = 
          testFound("should return status " + expect.status);
    
    Object.keys( expect.headers || {} ).forEach( function(header) {
        suite["check added for: http-header '" + header + "'"] = 
          testFound("should emit http-header: '" + header + "' as " + expect.headers[header]);
    });

    if (expect.body)
        if (Array.isArray( expect.body ))
            suite["checks added for: all body checkers"] = 
              function() {
                  expect.body.map(bodyCheckFound).forEach(function(f){ f() } )
              }
        else
            suite["check added for: body"] = 
              bodyCheckFound(expect.body)

    suite["calling beforeAll fires the request with the uri provided to factory"] = 
      function(done) {
          var opts = {};
          helper.request = function(_, cb) { opts = _; cb() };

          suite.beforeAll( function() {
              opts.should.eql( uri );
              done();
          });
      }

    Object.keys(asserts || {}).forEach(function(title) {
        var check = asserts[title];
        suite['checked against response with ' + title] =
          function(done) {

              helper.request = function(_, cb) { cb( check.err, check.response, check.response ? check.response.body : undefined ) };

              suite.beforeAll(
                function(err) {
                    if (err) return done(err);
                    runSuite(function(err) {
                        if (check.throw) {
                            Should.exist(err);
                            if (check.throw instanceof RegExp)
                                Should(err.message).match(check.throw);
                        } else 
                            Should.not.exist(err, err && err.stack)
                        
                        done()                        
                    })
                }
              );
              
              function runSuite(cb) {
                  runSuiteObj(suite, cb)
              }
              
              function runSuiteObj(suite, cb) {
                  async.eachSeries(Object.keys(suite), function(title, next) {
                      var entry = suite[title];
                      if ('beforeAll' == title && entry.name == 'requestBeforeAll') return next();
                      
                      if ('function' != typeof entry)
                          return runSuiteObj(entry, next);
                      
                      if (entry.length == 1) {
                          var err;
                          var origUncaughtErrHandler = process._events.uncaughtException;
                          process._events.uncaughtException = function(x) { err = x };
                          setTimeout(function(){ 
                              process._events.uncaughtException = origUncaughtErrHandler;
                              next(err) 
                          }, 10);
                          return entry(function(x){ err = x });
                      }
                      
                      try {
                          suite[title]();
                      } catch(ex) { 
                          return next(ex) 
                      }
                      next()
                      
                  }, cb)
              }
          }
    });

    return suite;

    function bodyCheckFound(check) {
        return testFound( 
          'string' == typeof check
          ? "body should be : " + check.substr(0,20) + (check.length > 20 ? "..." : "" )
          : check instanceof RegExp
             ? "body should match : " + check
             : "response body"
        );
    }
    function testFound(title) {
        return function() {
            suite.should.have.property(title);
            if (!suite[title]) process.exit();

            if ('object' == typeof suite[title]) return;
            
            suite[title].should.be.type('function');
        }
    }
}

function addInitiationCheck(inSuite, reqCase) {
    var r 
      , respondsSuite
      , subsuite = {}
      ;
    
    return inSuite[ (typeof reqCase) + " as " + (reqCase.title || 'object' == typeof reqCase ? JSON.stringify(reqCase) : reqCase.toString() )] = 
      { "should not fail" : 
        function() {
            r = request(reqCase) 
        }
      , "the returned value" :
        { "should be a live object" : 
          function() {
              Should.exists(r);
              r.should.be.type('object');
          }
        , "should have method 'responds(1)' " :
          function() { 
              r.should.have.property('responds');
              r.responds.should.be.type('function');
              r.responds.length.should.eql(1);
          }
        }
      }
}