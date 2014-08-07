hilary.use([window, describe, console], function(ctx, window, console) {

    var maps = hilary.resolve('nicephore::observer::maps').init(),
        utils = hilary.resolve('nicephore::observer::utils').init(maps),
        models = hilary.resolve('nicephore::observer::models').init(console),
        helpers = hilary.resolve('nicephore::observer::helpers').init(maps, utils, models),
        observer = hilary.resolve('nicephore::observer').init(maps, utils, models, helpers, console),
        
        maps2 = hilary.resolve('nicephore::observer::maps').init(),
        utils2 = hilary.resolve('nicephore::observer::utils').init(maps2),
        models2 = hilary.resolve('nicephore::observer::models').init(console),
        helpers2 = hilary.resolve('nicephore::observer::helpers').init(maps2, utils2, models2),
        observer2 = hilary.resolve('nicephore::observer').init(maps2, utils2, models2, helpers2, console);  

    
    
    describe("nicephore", function() {
        
        var getMockEvent,
            getRandomString;
        
        
        getMockEvent = function (eventData) {
            eventData = eventData || {
                type: 'keydown',
                bubbles : true,
                cancelable : true,
                char : "B",
                key : "b",
                ctrlKey: true,
                keyCode : 66 // i.e. 66 /*b*/
            };
            
            return eventData;
        };
        
        getRandomString = function ()
        {
            var text = "";
            var possible = "abcdefghijklmnopqrstuvwxyz";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        };
        
        beforeEach(function() {
            // clear the callbackMap
            maps.callbackMap = {};
        });
        
        describe('observe, when given a key-pattern to observe (i.e. ctrl+b)', function() {
            it('should register callback in maps.callbackMap', function() {
                // when
                observer.observe('command+b', 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                expect(maps.callbackMap['b::keydown']).toBeDefined();
            });
            
            it('should register callback in maps.callbackMap with the best event to handle the given key combination', function() {
                // when
                observer.observe('command+b', 'keypress', function (event, keyInfo) { return 'foo'; });
                
                // then
                expect(maps.callbackMap['b::keydown']).toBeDefined();
            });            
        }); // /describe
        
        describe('observe, when given a key-pattern with multiple modifiers to observe (i.e. ctrl+command+b)', function() { 
            it('should register a single callback in maps.callbackMap', function() {
                var callback;
                
                // when
                observer.observe('ctrl+command+b', 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                callback = maps.callbackMap['b::keydown'][0];
                expect(callback).toBeDefined();
                expect(maps.callbackMap['b::keydown'].length).toBe(1);
                expect(callback.keyInfo.modifiers).toContain("meta");
                expect(callback.keyInfo.modifiers).toContain("ctrl");
            });            
        }); // /describe
        
        describe('observe, when given multiple key-patterns to observe (i.e. ctrl+b, command+b)', function() { 
            it('should register multiple callbacks in maps.callbackMap', function() {
                // when
                observer.observe(['command+b', 'ctrl+b'], 'keydown', function (event, keyInfo) { return 'foo'; });
                
                // then
                callback = maps.callbackMap['b::keydown'];
                expect(maps.callbackMap['b::keydown'].length).toBe(2);
            });        
        }); // /describe
        
        describe('observeDomEvent, when attached to a specific DOM element', function() {
            xit('should execute each callback that matches the key-pattern', function(done) {
                // given
                var spy,
                    mockEvent = getMockEvent({
                        type: 'keydown',
                        bubbles : true,
                        cancelable : true,
                        keyCode : 13 // enter
                    });;
                
                $(body).append('<div class="domevent"><input type="text" /></div>');
                
                observer.observeDomEvent($('.domevent')[0], 'keydown');
                observer.observe(['enter'], 'keydown', function (event, keyInfo) { });
                spy = spyOn(maps.callbackMap['enter::keydown'][0], 'func').and.callThrough();
                
                // when
                observer.trigger(mockEvent);
                
                // then
                expect(spy).toHaveBeenCalled();
            });
        }); // /describe        
        
        describe('events that match observed keys', function() { 
            it('should execute the callback function', function(done) {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    spy,
                    mockEvent = getMockEvent({
                        type: 'keydown',
                        bubbles : true,
                        cancelable : true,
                        keyCode : 13 // enter
                    });;
                
                observer.observe(['enter'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                spy = spyOn(maps.callbackMap['enter::keydown'][0], 'func').and.callThrough();
                
                // when
                observer.trigger(mockEvent);
                setTimeout(function() { done(); }, 100);
                
                // then
                expect(spy).toHaveBeenCalled();
                expect(notYetDefined).toBe(random);
            });        
        }); // /describe        
        
        describe('events that match observed key-patterns', function() { 
            it('should execute the callback function', function(done) {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    spy;
                
                observer.observe(['ctrl+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                spy = spyOn(maps.callbackMap['b::keydown'][0], 'func').and.callThrough();
                
                // when
                observer.trigger(getMockEvent());
                setTimeout(function() { done(); }, 100);
                
                // then
                expect(spy).toHaveBeenCalled();
                expect(notYetDefined).toBe(random);
            });        
        }); // /describe
        
        describe('events that EXACTLY match observed key-patterns', function() { 
            it('should execute a callback, only when the meta keys match the key combination', function() {
                // given
                var mockEvent = getMockEvent(),
                    spy;
                
                observer.observe(['ctrl+shift+b'], 'keydown', function (event, keyInfo) { return 'foo'; });
                spy = spyOn(maps.callbackMap['b::keydown'][0], 'func');
                
                // when
                observer.trigger(mockEvent);
                
                // then
                expect(spy).not.toHaveBeenCalled();
            });        
        }); // /describe
        
        describe('events that match observed key-patterns with the matchAnyModifier set to true', function(done) { 
            it('should execute a callback, when any modifier key matches the key-pattern (i.e. ctrl+command+b will match on ctrl+b and command+b)', function() {
                // given
                var spy,
                    mockEvent1 = getMockEvent(),
                    mockEvent2 = getMockEvent({
                        type: 'keydown',
                        bubbles : true,
                        cancelable : true,
                        char : "B",
                        key : "b",
                        shiftKey: true,
                        keyCode : 66 // i.e. 66 /*b*/
                    });
                
                observer.observe(['ctrl+shift+b'], 'keydown', true, function (event, keyInfo) { return 'foo'; });
                spy = spyOn(maps.callbackMap['b::keydown'][0], 'func');
                
                // when
                expect(maps.callbackMap['b::keydown'][0].func.calls.count()).toBe(0);
                observer.trigger(mockEvent1);
                observer.trigger(mockEvent2);
                
                //setTimeout(function() { done(); }, 100);
                
                // then
                expect(maps.callbackMap['b::keydown'][0].func.calls.count()).toBe(2);
            });        
        }); // /describe      

        describe('events that match a key-pattern that is observed with multiple handlers', function() {
            it('should execute each callback that matches the key-pattern', function(done) {
                // given
                var random = getRandomString(),
                    notYetDefined,
                    notYetDefined2,
                    spy,
                    spy2,
                    mockEvent = getMockEvent(),
                    mockEvent2 = getMockEvent({
                        type: 'keydown',
                        bubbles : true,
                        cancelable : true,
                        char : "B",
                        key : "b",
                        metaKey: true,
                        keyCode : 66 // i.e. 66 /*b*/
                    });
                
                observer.observe(['ctrl+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined = random;
                });
                
                observer.observe(['command+b'], 'keydown', function (event, keyInfo) { 
                    notYetDefined2 = random;
                });
                
                spy = spyOn(maps.callbackMap['b::keydown'][0], 'func').and.callThrough();
                spy2 = spyOn(maps.callbackMap['b::keydown'][1], 'func').and.callThrough();
                
                // when
                observer.trigger(mockEvent);
                observer.trigger(mockEvent2);
                setTimeout(function() { done(); }, 100);
                
                
                // then
                expect(spy).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
                expect(notYetDefined).toBe(random);
                expect(notYetDefined2).toBe(random);
            }); // /it            
        }); // /describe
        
    });	// /nicephore
}); // /hilary