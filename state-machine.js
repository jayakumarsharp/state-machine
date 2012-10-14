var StateMachine = function(functions, transitions, initial) {
	var FROM_STATE = 0, METHODS = 1, TO_STATE = 2

	var self = this,
		initial = initial || 'initial',
		stack = [],
		state

	this.objects = {}
	this.objects[initial] = {}
	state = initial

	for(var i=0; i<transitions.length; ++i) {
		var transition = transitions[i]
		var object = this.objects[transition[FROM_STATE]] = this.objects[transition[FROM_STATE]] || { },
			methods = transition[METHODS]

		for(var j=0; j<methods.length; ++j) {
			var method = methods[j]
			object[method] = (function(method, methods, transition) {
				return function() {
					functions[method].call(self, arguments)
					if(stack.indexOf(method)==-1) {
						stack.push(method)
						//console.log('state', state, 'stack', stack, 'methods', methods, methods.every(function(e) {return stack.indexOf(e)>-1}))
						if(methods.every(function(e) { return stack.indexOf(e)>-1 })) {
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
				this.call(func, arguments)
			}
		})(func)
	}

	this.state = function() {
		return state
	}
}

StateMachine.prototype = {
	call: function(methodName /*, args */) {
		var method = this.objects[this.state()][methodName]
		return method && method.call(this, Array.prototype.slice.call(arguments, 1))
	}
}