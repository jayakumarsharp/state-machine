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
console.log(sm.state)	// initial
sm.c()					// calling c
console.log(sm.state)	// initial
sm.a()					// calling a
console.log(sm.state)	// ac
sm.b()					// calling b
console.log(sm.state)	// ac
sm.a()					// calling a
console.log(sm.state)	// a
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
state
```
property of the current state of the machine

```
on(event, handler)
```
registers an event handler for the specified event
* `event`: name of event
* `handler`: function registered for event

```
off([event, handler])
```
removes event handlers.  If event is null, it removes all handlers.  If handler is null, it removes all handlers from that event.
* `event`: optional. name of event
* `handler`: optional. function to be removed from event.  it must be the same function that was registered since it uses `==` to determine how to remove it.
* returns `true` if events were removed and `false` if nothing was removed

```
trigger(event, [args, ...])
```
triggers all handlers registered to that event
* `event`: name of event
* `args`: optional. arguments passed to function.  could be dangerous if there are many events registered

## Behavior
* Upon changing state, it will trigger an event by the name of the state