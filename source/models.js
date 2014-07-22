
hilary.register('nicephore::observer::models', { init: function (console, FileReader) {
    "use strict";

    var keyInfoProto,
        keyInfo,
        callbackProto,
        callback,
        pasteProto,
        pasteObject;

	keyInfoProto = {
		key: null,
		modifiers: [],
		eventType: null,
        matchAnyModifier: false
	};

	keyInfo = function (data) {
		var self =  Object.create(keyInfoProto);

		if (data.key) {
			self.key = data.key;
        }

		if (data.modifiers) {
			self.modifiers = data.modifiers;
        }

		if (data.eventType) {
			self.eventType = data.eventType;
        }

		return self;
	};

	callbackProto = {
		key: null,
		keyInfo: Object.create(keyInfoProto),
		func: function (event, eventKeyInfo) { console.log(eventKeyInfo, event); },
		eventType: null
	};

	callback = function (data) {
		var self = Object.create(callbackProto);

		if (data.key) {
			self.key = data.key;
        }

		if (data.keyInfo) {
			self.keyInfo = data.keyInfo;
        }

		if (data.callback) {
			self.func = data.callback;
        }

		if (data.eventType) {
			self.eventType = data.eventType;
        }

		return self;
	};
    
    pasteProto = {
        kind: null,
        type: null,
        file: null,
        dataUrl: null,
        toDataUrl: function () { throw new Error('toDataUrl is not implemented'); }
    };
    
    pasteObject = function (data) {
        var self = Object.create(pasteProto);
        
        if (data.kind) {
            self.kind = data.kind;
        }
        
        if (data.type) {
            self.type = data.type;
        }        
        
        if (data.file) {
            self.file = data.file;
        }
        
        self.readToDataUrl = function () {
            if (!FileReader) {
                return;
            }
            
            var reader = new FileReader();
            
            reader.onload = function (event) {
                self.dataUrl = event.target.result;
            };
            
            return reader.readAsDataURL(self.file);
        };
        
        return self;
    };

	return {
		keyInfo: keyInfo,
		callback: callback,
        pasteObject: pasteObject
	};

}});