var helper = require('../')
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
              { status: 200 
              }
            }
          , "wrong status code should fail" : 
            { throw   : /to have property 'status' of/
            , response: 
              { status: 500
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
                  }).length.should.be.ok;
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
            { 'should be cool' : 
              function(res) { 
                  Should(res.cool).be.ok
              }
            }
          }
        , { 'response that satisfies should pass' : 
            { response: 
              { status:   200
              , headers:  {}
              , body:     "very cool"
              , cool:     true
              }
            }
          , 'response that does not satisfy should fail' : 
            { throw: true
            , response: 
              { status:   200
              , headers:  {}
              , body:     "very cool"
              , uncool:   false
              }
            }
          }
        )
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
                    if (!!check.throw)
                        runSuite.should.throw( true == check.throw ? undefined : check.throw );
                    else
                        runSuite();
                    done();
                }
              );
              
              function runSuite() {
                  runSuiteObj(suite)
              }
              
              function runSuiteObj(suite) {
                  Object.keys(suite)
                        .filter(function(title) { return title != 'beforeAll' })
                        .forEach(function(title) {
                            'function' == typeof suite[title] 
                              ? suite[title]()
                              : runSuiteObj(suite[title])
                        })
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
            if (!suite[title]) console.log("eh?", title, suite) || process.exit();

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
    
    inSuite[ (typeof reqCase) + " as " + (reqCase.title || JSON.stringify(reqCase))] = 
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