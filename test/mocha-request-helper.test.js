var helper = require('../')
  , request = helper.request
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
  , "#responds(expect) " : 
    { "with" : 
      { "status check" : 
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
      , "few http headers as strings" : 
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
      , "few http headers as regexp" : 
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
      , "body as a short string check" : 
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
      , "body as a long string check" : 
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
      , "body as reg-ex check" : 
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
      , "body as array of checks" :
        respondsCheck( 
          { body: 
            [ /^string/
            , /to be/
            , /checked$/
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
      , "all options used together" : 
        respondsCheck( 
          { status: 404
          , headers: 
            { 'content-type' : "text/html"
            , 'x-header'     : /.*/
            }
          , body: /string check/ 
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
              var fire = suite.beforeAll
                , arrTests = Object.keys(suite).slice(1)
                , fTest = 
                  function() {
                      arrTests.forEach(function(title) {
                          suite[ title ]();
                      });
                  }
                , opts
                ;

              helper.request = function(_, cb) { cb( check.err, check.response ) };

              fire(
                function(err) {
                    if (err) return done(err);
                    if (!!check.throw)
                        fTest.should.throw( true == check.throw ? undefined : check.throw );
                    else
                        fTest();
                    done();
                }
              )
          }
    });

    return suite;

    function bodyCheckFound(title) {
        return testFound( 
          'string' == typeof title
          ? "body should be : " + title.substr(0,20) + (title.length > 20 ? "..." : "" )
          : "body should match : " + title
        );
    }
    function testFound(title) {
        return function() {
            suite.should.have.property(title);
            if (!suite[title]) console.log("eh?", title, suite) || process.exit();

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