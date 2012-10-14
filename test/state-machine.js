describe('StateMachine', function() {
	var machine = {
			a: function() { },
			b: function() { },
			c: function() { }
		},
		transitions = [
			['initial', ['a'], 'a'],
			['initial', ['b', 'c'], 'c'],
			['a', ['b'], 'b'],
			['b', ['a'], 'a'],
			['a', ['c'], 'c'],
			['c', ['a', 'b'], 'b']
		],
		stateMachine


	beforeEach(function() {
		stateMachine = new StateMachine(machine, transitions)
	})
	describe('#constructor', function() {
		it('should create an object that has a method for each transition', function() {
			chai.assert.ok(stateMachine.objects.a != null)
			chai.assert.ok(stateMachine.objects.b != null)
			chai.assert.ok(stateMachine.objects.initial != null)
		})
		it('should not create extra objects', function() {
			var count = 0
			for(var o in stateMachine.objects) ++count

			var states = [],
				map = { FROM_STATE: 0, TO_STATE: 2 }
			for(var i=0; i<transitions.length; i++) {
				for(var s in map) {
					if(states.indexOf(transitions[i][map[s]])==-1) {
						states.push(transitions[i][map[s]])
					}
				}
			}

			chai.assert.equal(states.length, count)
		})
	})
	describe('#call', function() {
		it('should dispatch the specified method if it is available the current state', function() {
			var called = false, bak = machine.a
			machine.a = function() { called = true }
			stateMachine.call('a')
			chai.assert.ok(called)
			machine.a = bak
		})
		it('should transition to state regardless of method invocation order 1', function() {
			chai.assert.equal(stateMachine.state(), 'initial')
			stateMachine.call('b')
			stateMachine.call('c')
			chai.assert.equal(stateMachine.state(), 'c')
		})
		it('should transition to state regardless of method invocation order 2', function() {
			chai.assert.equal(stateMachine.state(), 'initial')
			stateMachine.call('c')
			stateMachine.call('b')
			chai.assert.equal(stateMachine.state(), 'c')			
		})
		it('should be able to invoke call by calling directly from the state machine object', function() {
			chai.assert.equal(stateMachine.state(), 'initial')
			stateMachine.a()
			chai.assert.equal(stateMachine.state(), 'a')
		})
	})
	describe('#state', function() {
		it('should from the from-state to the to-state after calling the transition method', function() {
			chai.assert.equal(stateMachine.state(), 'initial')
			stateMachine.call('a')
			chai.assert.equal(stateMachine.state(), 'a')
		})
	})
})