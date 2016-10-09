var child = require('child_process');
var path = require('path')

module.exports = 
{ 'using standard mocha ui (bdd) with no mocha.opts' : 
  { beforeAll: 
    function(done) {
        console.log(" -- running mocha in child process -- ")
        child.spawn( 'node'
        , ['../../../node_modules/mocha/bin/mocha', 'test/*.js'] 
        , { cwd: path.resolve( 'test/fixtures/no-mocha-opts' )
          , stdio: 'inherit'
          }
        ).on('close', function(code) { done(code ? new Error('Oups:' + code) : null) } )
    },
    'should succeed': function() {}
  }
, 'using hybrid mocha ui (tdd) inside mocha.opts' : 
  { beforeAll: 
    function(done) {
        console.log(" -- running mocha in child process -- ")
        child.spawn( 'node'
        , ['../../../node_modules/mocha/bin/mocha', 'test/*.js'] 
        , { cwd: path.resolve( 'test/fixtures/no-mocha-opts' )
          , stdio: 'inherit'
          }
        ).on('close', function(code) { done(code ? new Error('Oups:' + code) : null) } )
    },
    'should succeed': function() {}
  }
}
