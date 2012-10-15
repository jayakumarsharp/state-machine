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
					var value = functions[method].apply(self, arguments)
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
							self.trigger(state)
						}
					}
					return value
				}
			})(method, methods, transition)
		}
		this.objects[transition[TO_STATE]] = this.objects[transition[TO_STATE]] || {}
	}

	for(var func in functions) {
		this[func] = (function (func) {
			return function() {
				return this.call.apply(self, [func].concat(Array.prototype.slice.call(arguments)))
			}
		})(func)
	}

	this.state = function() {
		return state
	}
}

StateMachine.prototype = {
	call: function(methodName /*, args */) {
		//console.log('calling', methodName, 'args', Array.prototype.slice.call(arguments, 1))
		var method = this.objects[this.state()][methodName]
		return method && method.apply(this, Array.prototype.slice.call(arguments, 1))
	},
	on: function(event, handler) {
		this.handlers = this.handlers || {}
		this.handlers[event] = this.handlers[event] || []
		this.handlers[event].push(handler)
	},
	trigger: function(event /*, args */) {
		this.handlers = this.handlers || {}
		for(var i in this.handlers[event]) {
			this.handlers[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	},
	off: function(event, handler) {
		//remove all
		if(event == null) {
			var hasRemoved = false
			for(var eventName in this.handlers) {
				if(this.handlers[eventName].length > 0) {
					this.handlers[eventName].length = 0
					hasRemoved = true
				}
			}
			return hasRemoved
		}
		this.handlers = this.handlers || {}
		// remove all for event
		if(handler == null) {
			if(this.handlers[event] != null) {
				this.handlers[event].length = 0
				return true
			}
			else {
				return false
			}
		}
		// remove handler for event
		var hasRemoved = false
		for(var i in this.handlers[event]) {
			if(handler == this.handlers[event][i]) {
				this.handlers[event].splice(i, 1)
				hasRemoved = true
			}
		}
		return hasRemoved
	}
}