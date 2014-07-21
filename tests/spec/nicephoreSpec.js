hilary.use([window, describe], function(ctx, window) {
	var maps = hilary.resolve('nicephore::observer::maps').init(),
		utils = hilary.resolve('nicephore::observer::utils').init(maps),
		models = hilary.resolve('nicephore::observer::models').init(maps),
		helpers = hilary.resolve('nicephore::observer::helpers').init(maps, utils, models),
		observer = hilary.resolve('nicephore::observer').init(maps, utils, models, helpers, console);

    observer.start();

    describe("nicephore", function() {
        
        var getMockEvent,
            getRandomString;
        
        
        getMockEvent = function (data) {
            data = data || {};
            var mockEvent = new KeyboardEvent(data.eventType || 'keydown');
            mockEvent.keyCode = data.keyCode || 66; // i.e. 66 /*b*/;
            mockEvent.ctrlKey = data.ctrlKey || true; 
            
            return mockEvent;
        };
        
        getRandomString = function ()
        {
            var text = "";
            var possible = "abcdefghijklmnopqrstuvwxyz";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }
        
        beforeEach(function() {
            // clear the callbackMap
            maps.callbackMap = {};
        });
        
        describe('nicephore.observe', function(){
            it('should register callback in maps.callbackMap', function() {
                // when
                observer.observe('command+b', 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                expect(maps.callbackMap['b::keydown']).toBeDefined();
            });
            
            it('should register callback in maps.callbackMap with the best event for the given key combination', function() {
                // when
                observer.observe('command+b', 'keypress', function (event, keyInfo) { return 'foo'; });
                
                // then
                expect(maps.callbackMap['b::keydown']).toBeDefined();
            });
            
            it('should register callback in maps.callbackMap with multiple modifiers', function() {
                var callback;
                
                // when
                observer.observe('ctrl+command+b', 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                callback = maps.callbackMap['b::keydown'][0];
                expect(callback).toBeDefined();
                expect(callback.keyInfo.modifiers).toContain("meta");
                expect(callback.keyInfo.modifiers).toContain("ctrl");
            });
            
            it('should register multiple callbacks in maps.callbackMap when multiple commands are defined', function() {
                // when
                observer.observe(['command+b', 'ctrl+b'], 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                callback = maps.callbackMap['b::keydown'];
                expect(maps.callbackMap['b::keydown'].length).toBe(2);
            });
            
            it('should execute callback when a matching event is observed', function() {
                // given
                var random = getRandomString(),
                    notYetDefined;
                
                observer.observe(['ctrl+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                // when
                observer.trigger(getMockEvent());
                
                // then
                setTimeout(function() {
                    expect(notYetDefined).toBe(random);
                }, 100);
            });
            
            it('should execute multiple callbacks when a more than one event is registered for the same kestroke', function() {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    notYetDefined2;
                
                observer.observe(['ctrl+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                observer.observe(['command+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined2 = random;
                });                
                
                // when
                observer.trigger(getMockEvent());
                
                // then
                setTimeout(function() {
                    expect(notYetDefined).toBe(random);
                    expect(notYetDefined2).toBe(random);
                }, 100);
            });
            
            it('should execute callback, only when the meta keys match the key combination', function() {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    notYetDefined2,
                    mockEvent = getMockEvent(),
                    mockEvent2 = getMockEvent();
                
                observer.observe(['ctrl+shift+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                mockEvent.shiftKey = true;
                
                // when
                observer.trigger(mockEvent);
                observer.trigger(mockEvent2);
                
                // then
                setTimeout(function() {
                    expect(notYetDefined).toBe(random);
                    expect(notYetDefined2).toBeUndefined;
                }, 100);
            });
            
            it('should execute callback, when any meta key matches the key combination, if matchAnyModifier is true in the observe call', function() {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    notYetDefined2,
                    mockEvent = getMockEvent(),
                    mockEvent2 = getMockEvent();
                
                observer.observe(['ctrl+shift+b'], 'keydown', true, function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                mockEvent.shiftKey = true;
                
                // when
                observer.trigger(mockEvent);
                observer.trigger(mockEvent2);
                
                // then
                setTimeout(function() {
                    expect(notYetDefined).toBe(random);
                    expect(notYetDefined2).toBe(random);
                }, 100);
            });            
        }); // /nicephore.observe
    });	// /nicephore
}); // /hilary