
Array.prototype.push = function(obj) { this[this.length] = obj }

var StateMachine = function(functions, transitions, initial) {
	var initial = initial || 'initial'

	this.slice = Array.prototype.slice
	this.running = 0
	this.stack = []
	this.transitions = {}

	// organize transitions to this.transitions
	this._createTransitions(transitions)

	// add functions to the object
	this._createFunctions(functions)

	this.state = initial
}

StateMachine.prototype = {
	on: function(event, handler) {
		this.handlers = this.handlers || {}
		this.handlers[event] = this.handlers[event] || []
		this.handlers[event].push(handler)
	},
	trigger: function(event /*, args */) {
		this.handlers = this.handlers || {}
		for(var i in this.handlers[event]) {
			this.handlers[event][i].apply(this, this.slice.call(arguments, 1))
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
	},


	// private
	_createTransitions: function(transitions) {
		var length = transitions.length, t
		for(var i=0; i<length; i++) {
			t = transitions[i]
			this._createTransition(t[0], t[1], t[2])
		}
	},
	_createTransition: function(fromState, methods, toState) {
		this.transitions[fromState] = this.transitions[fromState] || []
		this.transitions[fromState].push({
			steps: methods,
			toState: toState
		})
	},
	_createFunctions: function(functions) {
		for(var funcName in functions) {
			this[funcName] = this._createFunction(funcName, functions[funcName])
		}
	},
	_createFunction: function(funcName, func) {
		return function() {
			this.running++
			func.apply(this, this.slice.call(arguments))
			this.running--
			var transition = this._getTransition(funcName) 
			if(transition != null) {
				this.state = transition.toState
				this.trigger(this.state)
			}
		}
	},
	_getTransition: function(funcName) {
		var transition = null
		if(!this.running) {
			var stack = this.stack,
				transitions = this.transitions[this.state], 
				length = transitions && transitions.length || 0

			if(length) {
				this.stack.push(funcName)
			}
			for(var i=0; i<length; i++) {
				transition = transitions[i]
				var canTransition = transition.steps.every(function(step) {
					return stack.indexOf(step) > -1
				})

				if(canTransition) {
					this.stack.length = 0
					break
				}
				else {
					transition = null
				}
			}
		}
		return transition
	}
}

if (typeof module === 'object' && module.exports) module.exports = StateMachine;