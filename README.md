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
    { state: 'initial', functions: ['b'], nextState: 'b' },
    { state: 'initial', functions: ['a', 'c'], nextState: 'ac' },
    { state: 'ac', functions: ['a'], nextState: 'a'}
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
*`functions`: an object of functions that the finite state machine has
*`transitions`: the set (`Array`) defining how to move from state to state.  It must be `[ {state: 'stateName', functions: ['a', 'b'], nextState: 'nextStateName'} , ... ]`
*`initialState`: optional.  if not specified, the initial state will be `'initial'`
```
state()
```
returns the current state of the machine

```
on(event, handler)
```
registers an event handler for the specified event

```
off(event[, handler])
```
removes event handler from specified event.  If handler is null, it removes all handlers from that event

```
trigger(event)
```
triggers all handlers registered to that event

## Behavior
* Upon changing state, it will trigger an event by the name of the state
