var http    = require('http');
var request = require('../../../../');
var Should  = require('should');

describe('foo', function() {
    var svr;
    before(function(done) {
        svr = http.createServer(function(q,r) { r.end('ok') } ).listen(4321, done);
    });
    after(function(done) {
        svr.close(done)
    });
  
    describe('bar', function(){
        
        var suite = request('http://localhost:4321')
        .responds({status: 200});
        
        describe('returned suite', function() { 
            it('should have method `.bddCtx`', function() {
                Should(suite).have.property('bddCtx');
                Should(suite.bddCtx).be.type('function');
            });
        })
    })

    describe('bazz', function(){
        
        var ctx = request('http://localhost:4321')
        .responds({status: 200}).bddCtx();
        
        describe('returned ctx', function() { 
            it('should have err', function() {
                ctx.should.have.property('err');
            });
            it('should have res', function() {
                Should(ctx.res).be.an.Object;
            });
            it('should have body', function() {
                Should(ctx.body).eql('ok');
            })
        })
    })
})