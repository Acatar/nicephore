/*jslint plusplus: true */
/**
* The observer will become the public nicephore when initialized
*/
hilary.register('nicephore::observer', { init: function (maps, utils, models, helpers, console) {
    "use strict";

    var observe,
        observeOne,
        observePaste,
        stopObserving,
        isStarted = false,
        keyEventHandler,
        keyEventHandlerCallback,
        makeCallbackKey,
        registerCallback,
        sequenceLevels,
        className = 'keypress-observed';

    observe = function (keys, eventType, matchAnyModifier, callback) {
        var key;
        
        for (key in keys) {
            observeOne(keys[key], eventType, matchAnyModifier, callback);
        }
    };

    observeOne = function (key, eventType, matchAnyModifier, callback) {
        var keyInfo = helpers.getKeyInfo(key, eventType),
            callbackObj;
        
        keyInfo.matchAnyModifier = matchAnyModifier;
        callbackObj = models.callback({ key: key, keyInfo: keyInfo, callback: callback, eventType: eventType });

        helpers.registerCallback(keyInfo, callbackObj);
    };

    observePaste = function () {
    	// TODO 

		// window.addEventListener('paste', ... or
        document.onpaste = function (event) {
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            console.log(JSON.stringify(items)); // will give you the mime types
            var blob = items[0].getAsFile();
            var reader = new FileReader();
            reader.onload = function(event){
            console.log(event.target.result)}; // data url!
            reader.readAsDataURL(blob);
        };
    };

    stopObserving = function (keys, eventType) {
    	throw Error('stopObserving is not implemented');
    };

    /**
     * handles a keydown event
     *
     * @param {Event} e
     * @returns void
     */
    keyEventHandler = function (event) {
        var info;

        // normalize e.which for key events
        // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
        if (typeof event.which !== 'number') {
            event.which = event.keyCode;
        }

        info = helpers.getKeyInfoFromEvent(event);

        // no character found then stop
        if (!info.key) {
            return;
        }

        helpers.executeCallback(info, event);
    };

    return {
    	start: function () {
        	if(isStarted)
                return this;
            
            utils.observeDomEvent(document, 'keypress', keyEventHandler);
        	utils.observeDomEvent(document, 'keydown', keyEventHandler);
        	utils.observeDomEvent(document, 'keyup', keyEventHandler);
            isStarted = true;
            
            return this;
    	},

    	/**
         * makes and event observable
         *
         * can be a single key, a combination of keys separated with +,
         * an array of keys, or a sequence of keys separated by spaces
         *
         * be sure to list the modifier keys first to make sure that the
         * correct key ends up getting bound (the last key in the pattern)
         *
         * @param {string|Array} keys
         * @param {Function} callback
         * @param {string=} eventType - 'keypress', 'keydown', or 'keyup'
         * @returns this observer
         */
        observe: function (keys, eventType, matchAnyModifier, callback) {
            keys = utils.isArray(keys) ? keys : [keys];
            
            if(utils.isFunction(matchAnyModifier)) {
                observe(keys, eventType, false, matchAnyModifier /*as callback*/);
            }
            else {
                observe(keys, eventType, matchAnyModifier, callback);
            }
            
            return this;
        },

        /**
         * unbinds an event to mousetrap
         *
         * the unbinding sets the callback function of the specified key combo
         * to an empty function and deletes the corresponding key in the
         * _directMap dict.
         *
         * TODO: actually remove this from the _callbacks dictionary instead
         * of binding an empty function
         *
         * the keycombo+eventType has to be exactly the same as
         * it was defined in the bind method
         *
         * @param {string|Array} keys
         * @param {string} eventType
         * @returns void
         */
        stopObserving: stopObserving,
        
        trigger: function (mockEvent) {
            keyEventHandler(mockEvent);
        }
    };

}});