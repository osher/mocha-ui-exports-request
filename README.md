mocha-ui-exports-request
=========================

Brief
------
Unit-test helper for network request assertions, 
based on Mikael's request and should.js of visionmedia, 
designed for mocha-ui-exports.

So what?
---------

Just assume you could write for your web-app mocha tests the following way:

```
var svr = require('../server') // the test target
  , request =require('mocha-request-helper') //the helper
  , nock =  require('fixtures/nock')//plugs a recorded scenario of http requests to couch
  ;

svr.listen(1234);

module.exports = 
{ "./lib/server.js" : 
  { "homepage - /" :
    { "with no parameters" :
      request("http://127.0.0.1:1234/")
      .responds(
        { status: 200
        , headers: 
          { "content-type" : "text/html"
          }
        , body: /<h1>Your notes</h1>/
        }
      )
    }
  , "ajax - /ajax/listnotes" :
    { "with no parameters - should return the 5 latest notes in fixture" :
      request("http://127.0.0.1:1234/ajax/listnotes")
      .responds(
        { status : 200
        , headers: 
          { "content-type" : "text/json"
          }
        , json:  
          { notes : 
            [ { date: new Date('2014-04-02T15:35:55.754').getTime()
              , note: "note 1" 
              }
            , { date: new Date('2014-04-02T05:22:41.832').getTime()
              , note: "note 2" 
              }
            , { date: new Date('2014-04-01T21:03:43.004').getTime()
              , note: "note 3" 
              }
            , { date: new Date('2014-04-01T13:55:48.123').getTime()
              , note: "note 4" 
              }
            , { date: new Date('2014-04-01T08:14:31.631').getTime()
              , note: "note 5" 
              }
            ] 
          }
        }
      )
    , "with 'to' - should return the next page in fixture" :
      request("http://127.0.0.1:1234/ajax/listnotes/to/2014-03-31/")
      .responds(
        { status: 200
        , headers: 
          { "content-type" : "text/json"
          }
        , json: 
          { notes : 
            [ { date: new Date('2014-03-31T09:21:55.331').getTime()
              , note: "note 6" 
              }
            , { date: new Date('2014-03-30T06:21:55.784').getTime()
              , note: "note 7" 
              }
            , { date: new Date('2014-03-29T18:13:41.575').getTime()
              , note: "note 8" 
              }
            ] 
          }
        }
      )
    , "with 'to' and 'from' - should return the cut" :
      request("http://127.0.0.1:1234/ajax/listnotes/from/2014-03-30/to/2014-03-30/")
      .responds(
        { status: 200
        , headers: 
          { "content-type" : "text/json"
          }
        , json: 
          { notes : 
            [ { date: new Date('2014-03-30T06:21:55.784').getTime()
              , note: "note 7" 
              }
            ]
          }
        }
      )
    }
  , "ajax - /ajax/postnote" :
    { "with valid form - should accept the note" :
      request(
        { uri : "http://127.0.0.1:1234/ajax/postnote"
        , form: 
          { note : "note 9"
          }
        }
      ).responds(
        { status: 200
        }
      )
    }
  , "all expected couch-db hits" :
    { "should have been called" :
       function(){
          nock.done()
       }
    }
  }
}

```

and get a spec-report like this:

```
  ./lib/server.js
    homepage - /
      with no parameters
        √ should return status 200
        √ should emit http-header: 'content-type' as text/html
        √ body should match : /<h1>Your notes</h1>/
    ajax - /ajax/listnotes
      with no parameters - should return the 5 latest notes
        √ should return status 200
        √ should emit http-header: 'content-type' as text/json
        √ body should be : '{"notes":[{"date":1396257...'
      with 'to' - should return the next page in fixture
        √ should return status 200
        √ should emit http-header: 'content-type' as text/json
        √ body should be : '{"notes":[{"date":1396257...'
      with 'to' and 'from' - should return the cut
        √ should return status 200
        √ should emit http-header: 'content-type' as text/json
        √ body should be : '{"notes":[{"date":1396257...'
    ajax - /ajax/listnotes
      with valid form - should accept the note
        √ should return status 200
    all expected couch-db hits
      √ should have been called

  14 passing (81ms)
```

How would you feel?


Install
--------
```
npm install mocha-ui-exports-request
```

ok, long name. I will accept better offers...

Test
-----
the published package does not contain the test suite.
You'll have to clone it, to `npm install` from within the cloned folder, and then:

```
npm test
```

Contribute
----------
Sure, why not. That's why it's here ;)



Future
-------
* assert for network / connection errors
* better body handling
* descriptive checkers for validating complicated bodies.  
   * currently support only string, regex, and json, 
   * considering simple ways to allow multiple assertions for the body...
     perhaps `body: [ xRegexp1, xRegexp2, fCustom1, fCustom2, ... ] or something should add a check per element in the array
* handle timeouts
