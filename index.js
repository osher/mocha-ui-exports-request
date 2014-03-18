var request = require('request');

Object.defineProperty(exports, 'request'
, { get: function() { return requestTester }
  , set: function(v) { request = v || require('request') }
  , enumerable  : true
  , configurable: false
  }
);

function requestTester(options){ 
    return {
      responds:  
      function(expect){ 
          var err, res
            , suite =  {
            beforeAll: 
            function(done) {
                request(options, function(oErr,oRes) {
                    res = oRes;
                    done(err = oErr);
                })
            }
          };

          //TODO: if (expects.err)

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

          if (expect.json) 
              expect.body = JSON.stringify(expects.json);

          if (expect.body)
              if (expect.body instanceof RegExp)
                  suite["body should match : " + expect.body] = 
                      function() {
                          res.should.have.property('body');
                          res.body.should.match(expect.body)
                      };
              else //body is string
                  suite["body should be : " + expect.body.substr(0,20) + (expect.body.length > 20 ? "..." : "" )] = 
                      function() {
                          res.should.have.property('body', expect.body )
                      };

          return suite;
      } 
    } 
}