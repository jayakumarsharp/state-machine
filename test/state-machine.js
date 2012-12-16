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
	describe('#state', function() {
		it('should from the from-state to the to-state after calling the transition method', function() {
			chai.assert.equal(stateMachine.state, 'initial')
			stateMachine.a()
			chai.assert.equal(stateMachine.state, 'a')
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
		it('should trigger a state event when transitioning', function() {
			var called = false
			stateMachine.on('a', function() {
				called = true
			})
			stateMachine.a()
			chai.assert(called)
		})
		it('should be able to accept arguments', function() {
			var eventValue = null, value = 'test'
			stateMachine.on('event', function(arg) {
				eventValue = arg
			})
			stateMachine.trigger('event', value)
			chai.assert.equal(eventValue, value)
		})
	})
})