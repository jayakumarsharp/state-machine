(function() {
	var EventEmitter = (function() {
		var EventEmitter = null;
		if(typeof require == 'function') {
			EventEmitter = require('events').EventEmitter;
		}
		else {
			EventEmitter = function() {};
			EventEmitter.prototype = {
				addListener: function(event, handler) {
					this._sm_handlers = this._sm_handlers || {};
					this._sm_handlers[event] = this._sm_handlers[event] || [];
					this._sm_handlers[event].push(handler);
				},
				emit: function(event /*, args */) {
					this._sm_handlers = this._sm_handlers || {};
					for(var i in this._sm_handlers[event]) {
						this._sm_handlers[event][i].apply(this, this._sm_slice.call(arguments, 1));
					}
				},
				removeListener: function(event, handler) {
					if(event != null) {
						for(var i in this._sm_handlers[event]) {
							if(handler == this._sm_handlers[event][i]) {
								this._sm_handlers[event].splice(i, 1);
							}
						}
					}
				},
				removeAllListeners: function(event) {
					if(event == null) {
						this._sm_handlers = this._sm_handlers || {};
					}
					else if(this._sm_handlers[event] != null) {
						this._sm_handlers[event].length = 0;
					}
				}
			};
			EventEmitter.prototype.on = EventEmitter.prototype.addListener;
		}

		return EventEmitter;
	})();
	

	var StateMachine = (function(EventEmitter) {
		var StateMachine = function(functions, transitions, ons) {
			this._sm_slice = Array.prototype.slice;
			this._sm_running = 0;
			this._sm_stack = [];
			this._sm_transitions = {};

			// organize transitions to this.transitions
			this._sm_createTransitions(transitions);

			// add functions to the object
			this._sm_createFunctions(functions);

			for(var state in ons) {
				this.on(state, ons[state]);
			}
			
			this.state = 'initial';
		};


		StateMachine.prototype = {
			// private
			_sm_createTransitions: function(transitions) {
				var t;
				for(var i=0; i<transitions.length; i++) {
					t = transitions[i];
					this._sm_createTransition(t[0], t[1], t[2]);
				}
			},
			_sm_createTransition: function(fromState, methods, toState) {
				this._sm_transitions[fromState] = this._sm_transitions[fromState] || [];
				this._sm_transitions[fromState].push({
					steps: methods,
					toState: toState
				});
			},
			_sm_createFunctions: function(functions) {
				for(var funcName in functions) {
					this[funcName] = this._sm_createFunction(funcName, functions[funcName]);
				}
			},
			_sm_createFunction: function(funcName, func) {
				return function() {
					this._sm_running++;
					func.apply(this, this._sm_slice.call(arguments));
					this._sm_running--;
					var transition = this._sm_getTransition(funcName);
					if(transition != null) {
						this.state = transition.toState;
						this.emit(this.state);
					}
				};
			},
			_sm_getTransition: function(funcName) {
				var transition = null;
				if(!this._sm_running) {
					var stack = this._sm_stack,
						transitions = this._sm_transitions[this.state], 
						length = transitions && transitions.length || 0,
						canTransition, 
						completedStateTransition = function(step) {
							return stack.indexOf(step) > -1;
						};

					if(length) {
						this._sm_stack.push(funcName);
					}


					for(var i=0; i<length; i++) {
						transition = transitions[i];
						canTransition = transition.steps.every(completedStateTransition);

						if(canTransition) {
							this._sm_stack.length = 0;
							break;
						}
						else {
							transition = null;
						}
					}
				}
				return transition;
			}
		};

		// inherit
		for(var f in EventEmitter.prototype) {
			StateMachine.prototype[f] = EventEmitter.prototype[f];
		}

		return StateMachine;
	})(EventEmitter);

	if (typeof module == 'object' && module.exports) {
		module.exports = StateMachine;
	}
	if (this.define) {
		define(SstateMachine);
	}
}).call(this);
