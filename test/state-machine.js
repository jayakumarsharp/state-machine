describe('StateMachine', function() {
	var machine = {
			a: function(bool) { return bool },
			b: function() { },
			c: function() { },
			d: function(bool) { return bool }
		},
		transitions = [
			['initial', ['a'], 'a'],
			['initial', ['b', 'c'], 'c'],
			['a', ['b'], 'b'],
			['b', ['a'], 'a'],
			['a', ['c'], 'c'],
			['a', ['a'], 'a'],
			['c', ['a', 'b'], 'b'],
			['c', ['c', 'b'], 'b']
		],
		stateMachine


	beforeEach(function() {
		stateMachine = new StateMachine(machine, transitions)
	})
	afterEach(function() {
		stateMachine.off()
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
		it('should be able to accept arguments', function() {
			chai.assert(machine.a(true))
			chai.assert(stateMachine.a(true))
			chai.assert(!stateMachine.a(false))
			chai.assert(stateMachine.call('a', true))
			chai.assert(!stateMachine.call('a', false))
		})
		it('should not call a function that is not in the current state', function() {
			chai.assert.equal(stateMachine.d(), null)
		})
	})
	describe('#state', function() {
		it('should from the from-state to the to-state after calling the transition method', function() {
			chai.assert.equal(stateMachine.state(), 'initial')
			stateMachine.call('a')
			chai.assert.equal(stateMachine.state(), 'a')
		})
	})
	describe('#on', function() {
		it('should add an event handler', function() {
			function event() { }
			stateMachine.on('event', event)
			chai.assert(stateMachine.off('event', event))
		})
	})
	describe('#off', function() {
		it('should return true if it removed a registered event', function() {
			function event() {}
			stateMachine.on('event', event)
			chai.assert(stateMachine.off('event', event))
		})
		it('should return false if it did not remove a registered event', function() {
			function event() {}
			stateMachine.on('event', event)
			chai.assert(!stateMachine.off('event', function() {}))
		})
		it('should return false if it did not remove a registered event when passing no arguments', function() {
			chai.assert(!stateMachine.off())
		})
	})
	describe('#trigger', function() {
		it('should trigger a registered event', function() {
			var called = false
			stateMachine.on('event', function() {
				called = true
			})
			stateMachine.trigger('event')
			chai.assert(called)
		})
		it('should not trigger an event that has been removed', function() {
			var called = false
			stateMachine.on('event', function() {
				called = true
			})
			stateMachine.off('event')
			stateMachine.trigger('event')
			chai.assert(!called)
		})
	})
})