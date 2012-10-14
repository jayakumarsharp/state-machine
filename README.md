# state-machine

Loosely implements a finite state machine as well as an event listener.  Upon changing state, it will trigger an event by the name of the state it just entered

## Example
```
var sm = new StateMachine({
    a: function() { console.log('calling a') },
    b: function() { console.log('calling b') },
    c: function() { console.log('calling c') }
  },
  [
    [ 'initial', 	['b'], 		'b'  ],
    [ 'initial', 	['a', 'c'], 'ac' ],
    [ 'ac', 		['a'],		'a'  ]
  ]
)
console.log(sm.state())
sm.c()
console.log(sm.state())
sm.a()
console.log(sm.state())
sm.b()
console.log(sm.state())
sm.a()
console.log(sm.state())
```

One nice feature is the ability to allow multiple functions to be called before moving on to the next state, like the transition from 'initial' to 'ac'.  This is helpful when you need to make a couple asynchronous calls and have them return before moving on to the next state.

## API
```
new StateMachine(functions, transitions [, initialState])
```
Creates a new state machine
* `functions`: an object of functions that the finite state machine has
* `transitions`: the set (`Array`) defining how to move from state to state.  It must be in the format `[ 'fromState', ['function1', 'function2'], 'toState' ] , ... ]`
* `initialState`: optional.  if not specified, the initial state will be `'initial'`

```
state()
```
returns the current state of the machine

```
call(methodName, [args, ...])
```
Dynamic dispatch methods.  If the current state isn't allowed to call this function, it will silently do nothing.