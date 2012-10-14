var StateMachine = function(functions, transitions, initial) {
	var FROM_STATE = 0, METHODS = 1, TO_STATE = 2

	var self = this,
		initial = initial || 'initial',
		stack = [],
		state,
		stateTransitionMethods = {}

	this.objects = {}
	this.objects[initial] = {}
	state = initial

	for(var i=0; i<transitions.length; ++i) {
		var transition = transitions[i]
		var object = this.objects[transition[FROM_STATE]] = this.objects[transition[FROM_STATE]] || { },
			methods = transition[METHODS],
			stateTransitions = stateTransitionMethods[transition[FROM_STATE]] = stateTransitionMethods[transition[FROM_STATE]] || []

		stateTransitions.push(methods)
		for(var j=0; j<methods.length; ++j) {
			var method = methods[j]
			object[method] = (function(method, methods, transition) {
				return function() {
					functions[method].call(self, arguments)
					if(stack.indexOf(method)==-1) {
						stack.push(method)
						var satisfiesTransition = stateTransitionMethods[state].some(function(methods) { 
							//console.log('state', state, 'stack', stack, 'methods', methods)
							return methods.every(function(e) { 
								return stack.indexOf(e)>-1 
							}) 
						})
						if(satisfiesTransition) {
							//console.log('transitioning')
							stack.length = 0
							state = transition[TO_STATE]
						}
					}
				}
			})(method, methods, transition)
		}
		this.objects[transition[TO_STATE]] = this.objects[transition[TO_STATE]] || {}
	}

	for(var func in functions) {
		this[func] = (function (func) {
			return function() { 
				return this.call(func, arguments)
			}
		})(func)
	}

	this.state = function() {
		return state
	}
}

StateMachine.prototype = {
	call: function(methodName /*, args */) {
		//console.log('calling', methodName)
		var method = this.objects[this.state()][methodName]
		return method && method.call(this, Array.prototype.slice.call(arguments, 1))
	}
}