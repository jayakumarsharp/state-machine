StateMachine = function(functions, transitions, startState) {
	var _this = this,
		state = startState || 'initial',
		stack = {},
		functionsOfStateMap = {}

	this.state = function() {
		return state
	}
	function getFunctionsOfState() {
		if(functionsOfStateMap[state] == null) {
			var functions = []
			for(var i=0; i<transitions.length; i++) {
				if(state == transitions[i].state) {
					functions = functions.concat(transitions[i].functions)
				}
			}
			functionsOfStateMap[state] = functions
		}
		return functionsOfStateMap[state]
	}
	Array.prototype.isSubsetOf = function(arr) {
		for(var i=0; i<this.length; i++) {
			if(arr.indexOf(this[i]) < 0) {
				return false
			}
		}
		return true
	}
	for(func in functions) {
		(function(func) {
			_this[func] = function() {
				if(getFunctionsOfState().indexOf(func)>-1) {
					functions[func].apply(_this, arguments)
					stack[state] = stack[state] || []
					if(stack[state].indexOf(func) < 0) {
						stack[state].push(func)
					}
					for(var i=0; i<transitions.length; i++) {
						if(transitions[i].state == state && transitions[i].functions.isSubsetOf(stack[state])) {
							state = transitions[i].nextState
							_this.trigger(state)
							i = transitions.length
						}
					}
				}
				else {
					console.log('function', func, 'not defined in a transition of', state)
				}
			}
		})(func)
	}
}
StateMachine.prototype = {
	on: function(event, handler) {
		this.handlers = this.handlers || {}
		this.handlers[event] = this.handlers[event] || []
		this.handlers[event].push(handler)
	},
	trigger: function(event) {
		this.handlers = this.handlers || {}
		for(var i in this.handlers[event]) {
			this.handlers[event][i].apply(this)
		}
	},
	off: function(event, handler) {
		this.handlers = this.handlers || {}
		// remove all
		if(handler == null && this.handlers[event].length > 0) {
			this.handlers[event] = []
			return true
		}
		else {
			return false
		}
		// remove specified
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
