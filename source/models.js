
hilary.register('nicephore::observer::models', { init: function () {
    "use strict";

    var keyInfoProto,
    	keyInfo,
    	callbackProto,
    	callback;

	keyInfoProto = {
		key: undefined,
		modifiers: [],
		eventType: undefined,
        matchAnyModifier: false
	};

	keyInfo = function(data) {
		var self =  Object.create(keyInfoProto);

		if (data.key)
			self.key = data.key;

		if(data.modifiers)
			self.modifiers = data.modifiers;

		if(data.eventType)
			self.eventType = data.eventType;

		return self;
	};

	callbackProto = {
		key: undefined,
		keyInfo: Object.create(keyInfoProto),
		func: function (event, eventKeyInfo) { console.log(eventKeyInfo, event); },
		eventType: undefined
	};

	callback = function (data) {
		var self = Object.create(callbackProto);

		if (data.key)
			self.key = data.key;

		if(data.keyInfo)
			self.keyInfo = data.keyInfo;

		if(data.callback)
			self.func = data.callback;		

		if(data.eventType)
			self.eventType = data.eventType;

		return self;
	};

	return {
		keyInfo: keyInfo,
		callback: callback
	};

}});