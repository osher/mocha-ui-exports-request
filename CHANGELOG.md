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