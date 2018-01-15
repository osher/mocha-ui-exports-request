## 2.1.1
 - added a friendly error when .responds({body}) is invalid
 - responds({body, responseBody, headers, and}) - 
   pass (SUT,done) when test-function declares 2 arguments, and just SUT in any other case
   (opposed to pass SUT when test-function declares 1 argument, and (SUT,done) in any other case)

## 2.1.0
 - added support in `options.skip` and `request.skip`

## 2.0.0
 - relax dependency version policy for `request`
 - mocha-ui-exports is stated a peer-dependency explicitlt
 - BRAKING CHANGES: 
   - incompatible with node 0.10 and node 0.12 (because of later versions of request)

## 1.2.2
 - rollback to request@2.47
   will bump major version for that.
 https://travis-ci.org/osher/mocha-ui-exports-request/builds/295714382
 
## 1.2.1
 - bump & relax dependency version policy for `request`
   WARNING: THIS VERSION FAILS BUILDS on node 0.10 and node 0.12
 https://travis-ci.org/osher/mocha-ui-exports-request/builds/295714382  

## 1.2.0
 - 1.1.3 should have been published as 1.2.0, because it adds unbreaking functionality and not just fixes bugs.

## 1.1.3
 - allow add-hock test handlers to name a 2nd argument for `done()`

## 1.1.2 
 - give more focussed assertion messages (prevent entire IncomingMessage object to serialize)
 
## 1.1.1
 - fix devDependency version
 
## 1.1.0
 - support `request({..}).responds({..}).bddCtx()`, implied whenever `--ui bdd`.
   the feature triggers automatically when `--ui` is `bdd` (or unset).
   With any other value - can be triggered by calling the `.bddCtx()` method

## 1.0.1
 - support request descriptor as a function that returns the request options.
   The function is called right before sending the request.
   useful for creating the request descriptor as part of an asynchronous flow.

## 1.0.0
 - release it.