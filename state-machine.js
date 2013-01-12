
Array.prototype.push = function(obj) { this[this.length] = obj }

var StateMachine = function(functions, transitions, initial) {
	var initial = initial || 'initial'

	this._sm_slice = Array.prototype.slice
	this._sm_running = 0
	this._sm_stack = []
	this._sm_transitions = {}

	// organize transitions to this.transitions
	this._sm_createTransitions(transitions)

	// add functions to the object
	this._sm_createFunctions(functions)

	this.state = initial
}

StateMachine.prototype = {
	on: function(event, handler) {
		this._sm_handlers = this._sm_handlers || {}
		this._sm_handlers[event] = this._sm_handlers[event] || []
		this._sm_handlers[event].push(handler)
	},
	trigger: function(event /*, args */) {
		this._sm_handlers = this._sm_handlers || {}
		for(var i in this._sm_handlers[event]) {
			this._sm_handlers[event][i].apply(this, this._sm_slice.call(arguments, 1))
		}
	},
	off: function(event, handler) {
		//remove all
		if(event == null) {
			var hasRemoved = false
			for(var eventName in this._sm_handlers) {
				if(this._sm_handlers[eventName].length > 0) {
					this._sm_handlers[eventName].length = 0
					hasRemoved = true
				}
			}
			return hasRemoved
		}
		this._sm_handlers = this._sm_handlers || {}
		// remove all for event
		if(handler == null) {
			if(this._sm_handlers[event] != null) {
				this._sm_handlers[event].length = 0
				return true
			}
			else {
				return false
			}
		}
		// remove handler for event
		var hasRemoved = false
		for(var i in this._sm_handlers[event]) {
			if(handler == this._sm_handlers[event][i]) {
				this._sm_handlers[event].splice(i, 1)
				hasRemoved = true
			}
		}
		return hasRemoved
	},


	// private
	_sm_createTransitions: function(transitions) {
		var t
		for(var i=0; i<transitions.length; i++) {
			t = transitions[i]
			this._sm_createTransition(t[0], t[1], t[2])
		}
	},
	_sm_createTransition: function(fromState, methods, toState) {
		this._sm_transitions[fromState] = this._sm_transitions[fromState] || []
		this._sm_transitions[fromState].push({
			steps: methods,
			toState: toState
		})
	},
	_sm_createFunctions: function(functions) {
		for(var funcName in functions) {
			this[funcName] = this._sm_createFunction(funcName, functions[funcName])
		}
	},
	_sm_createFunction: function(funcName, func) {
		return function() {
			this._sm_running++
			func.apply(this, this._sm_slice.call(arguments))
			this._sm_running--
			var transition = this._sm_getTransition(funcName) 
			if(transition != null) {
				this.state = transition.toState
				this.trigger(this.state)
			}
		}
	},
	_sm_getTransition: function(funcName) {
		var transition = null
		if(!this._sm_running) {
			var stack = this._sm_stack,
				transitions = this._sm_transitions[this.state], 
				length = transitions && transitions.length || 0

			if(length) {
				this._sm_stack.push(funcName)
			}
			for(var i=0; i<length; i++) {
				transition = transitions[i]
				var canTransition = transition.steps.every(function(step) {
					return stack.indexOf(step) > -1
				})

				if(canTransition) {
					this._sm_stack.length = 0
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