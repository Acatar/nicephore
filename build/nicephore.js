// Input 0
hilary.register("nicephore::observer::maps", {init:function() {
  var i, map, keycodeMap, shiftMap, reverseMap, getReverseMap, aliases, callbackMap = {};
  map = {8:"backspace", 9:"tab", 13:"enter", 16:"shift", 17:"ctrl", 18:"alt", 20:"capslock", 27:"esc", 32:"space", 33:"pageup", 34:"pagedown", 35:"end", 36:"home", 37:"left", 38:"up", 39:"right", 40:"down", 45:"ins", 46:"del", 91:"meta", 93:"meta", 224:"meta"};
  keycodeMap = {106:"*", 107:"+", 109:"-", 110:".", 111:"/", 186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"};
  shiftMap = {"~":"`", "!":"1", "@":"2", "#":"3", "$":"4", "%":"5", "^":"6", "&":"7", "*":"8", "(":"9", ")":"0", "_":"-", "+":"=", ":":";", '"':"'", "<":",", ">":".", "?":"/", "|":"\\"};
  aliases = {"option":"alt", "command":"meta", "return":"enter", "escape":"esc", "mod":/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"};
  for (i = 1;i < 20;++i) {
    map[111 + i] = "f" + i;
  }
  for (i = 0;i <= 9;++i) {
    map[i + 96] = i;
  }
  getReverseMap = function() {
    if (!reverseMap) {
      var key;
      reverseMap = {};
      for (key in map) {
        if (key > 95 && key < 112) {
          continue;
        }
        if (map.hasOwnProperty(key)) {
          reverseMap[map[key]] = key;
        }
      }
    }
    return reverseMap;
  };
  return{map:map, keycodeMap:keycodeMap, shiftMap:shiftMap, reverseMap:reverseMap, aliases:aliases, getReverseMap:getReverseMap, callbackMap:callbackMap};
}});
// Input 1
hilary.register("nicephore::observer::utils", {init:function(maps) {
  var preventDefault, stopPropagation, observeDomEvent, getType, isArray, isFunction, objProto = Object.prototype, objProtoToStringFunc = objProto.toString, objProtoHasOwnFunc = objProto.hasOwnProperty, class2Types = {}, class2ObjTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"];
  for (var i in class2ObjTypes) {
    var name = class2ObjTypes[i];
    class2Types["[object " + name + "]"] = name.toLowerCase();
  }
  preventDefault = function(event) {
    if (event.preventDefault) {
      event.preventDefault();
      return;
    }
    event.returnValue = false;
  };
  stopPropagation = function(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
      return;
    }
    event.cancelBubble = true;
  };
  observeDomEvent = function(obj, type, callback) {
    if (obj.addEventListener) {
      obj.addEventListener(type, callback, false);
      return;
    }
    obj.attachEvent("on" + type, callback);
  };
  getType = function(obj) {
    if (typeof obj === "undefined") {
      return "undefined";
    }
    if (obj === null) {
      return String(obj);
    }
    return typeof obj === "object" || typeof obj === "function" ? class2Types[objProtoToStringFunc.call(obj)] || "object" : typeof obj;
  };
  isArray = function(obj) {
    return getType(obj) === "array";
  };
  isFunction = function(obj) {
    return getType(obj) === "function";
  };
  return{preventDefault:preventDefault, stopPropagation:stopPropagation, observeDomEvent:observeDomEvent, isArray:isArray, isFunction:isFunction};
}});
// Input 2
hilary.register("nicephore::observer::helpers", {init:function(maps, utils, models) {
  var makeCallbackKey, registerCallback, executePasteCallback, executeOnePasteCallback, executeCallback, executeOneCallback, modifiersAreSame, getKeyInfo, getKeyInfoFromEvent, keysFromString, isModifier, getEventModifiers, pickBestEventType, characterFromEvent;
  makeCallbackKey = function(keyInfo) {
    return keyInfo.key + "::" + keyInfo.eventType;
  };
  registerCallback = function(keyInfo, callback) {
    var mappedCallback, callbackKey = makeCallbackKey(keyInfo);
    mappedCallback = maps.callbackMap[callbackKey];
    if (!mappedCallback) {
      maps.callbackMap[callbackKey] = [callback];
    } else {
      mappedCallback.push(callback);
    }
  };
  executePasteCallback = function(keyInfo, event, items) {
    var i, callbacks;
    callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];
    if (!callbacks) {
      return;
    }
    for (i in callbacks) {
      executeOnePasteCallback(keyInfo, event, callbacks[i], items);
    }
  };
  executeOnePasteCallback = function(eventKeyInfo, event, callback, items) {
    if (utils.isFunction(callback.func) && callback.func(event, eventKeyInfo, items) === false) {
      utils.preventDefault(event);
      utils.stopPropagation(event);
    }
  };
  executeCallback = function(keyInfo, event) {
    var i, callbacks, eventType;
    callbacks = maps.callbackMap[makeCallbackKey(keyInfo)];
    if (!callbacks) {
      return;
    }
    for (i in callbacks) {
      executeOneCallback(keyInfo, event, callbacks[i]);
    }
  };
  executeOneCallback = function(eventKeyInfo, event, callback) {
    if (modifiersAreSame(eventKeyInfo, callback.keyInfo) && utils.isFunction(callback.func) && callback.func(event, eventKeyInfo) === false) {
      utils.preventDefault(event);
      utils.stopPropagation(event);
    }
  };
  modifiersAreSame = function(eventKeyInfo, callbackKeyInfo) {
    var i, k, areSame = false, matchAnyModifier = callbackKeyInfo.matchAnyModifier;
    if (matchAnyModifier) {
      for (i in eventKeyInfo.modifiers) {
        if (callbackKeyInfo.modifiers.indexOf(eventKeyInfo.modifiers[i]) > -1) {
          areSame = true;
        }
      }
    } else {
      areSame = true;
      if (eventKeyInfo.modifiers.length !== callbackKeyInfo.modifiers.length) {
        return false;
      }
      for (i in eventKeyInfo.modifiers) {
        if (callbackKeyInfo.modifiers.indexOf(eventKeyInfo.modifiers[i]) > -1) {
          areSame = areSame && true;
        } else {
          areSame = false;
        }
      }
    }
    return areSame;
  };
  getKeyInfo = function(combination, eventType) {
    var key, keys, modifiers = [];
    keys = keysFromString(combination);
    for (var i in keys) {
      key = keys[i];
      if (maps.aliases[key]) {
        key = maps.aliases[key];
      }
      if (eventType && eventType !== "keypress" && maps.shiftMap[key]) {
        key = maps.shiftMap[key];
        modifiers.push("shift");
      }
      if (isModifier(key)) {
        modifiers.push(key);
      }
    }
    eventType = pickBestEventType(key, modifiers, eventType);
    return models.keyInfo({key:key, modifiers:modifiers, eventType:eventType});
  };
  getKeyInfoFromEvent = function(event) {
    if (typeof event.which !== "number") {
      event.which = event.keyCode;
    }
    var character = characterFromEvent(event);
    if (!character) {
      return;
    }
    return models.keyInfo({key:character, modifiers:getEventModifiers(event), eventType:event.type});
  };
  keysFromString = function(combination) {
    if (combination === "+") {
      return["+"];
    }
    return combination.split("+");
  };
  isModifier = function(key) {
    return key === "shift" || key === "ctrl" || key === "alt" || key === "meta";
  };
  getEventModifiers = function(event) {
    var modifiers = [];
    if (event.altKey) {
      modifiers.push("alt");
    }
    if (event.ctrlKey) {
      modifiers.push("ctrl");
    }
    if (event.metaKey) {
      modifiers.push("meta");
    }
    if (event.shiftKey) {
      modifiers.push("shift");
    }
    return modifiers;
  };
  pickBestEventType = function(key, modifiers, eventType) {
    if (!eventType) {
      eventType = maps.getReverseMap()[key] ? "keydown" : "keypress";
    }
    if (eventType === "keypress" && modifiers.length) {
      eventType = "keydown";
    }
    return eventType;
  };
  characterFromEvent = function(event) {
    if (event.type === "keypress") {
      var character = String.fromCharCode(event.which);
      if (!event.shiftKey) {
        character = character.toLowerCase();
      }
      return character;
    }
    if (maps.map[event.which]) {
      return maps.map[event.which];
    }
    if (maps.keycodeMap[event.which]) {
      return keycodeMap[event.which];
    }
    return String.fromCharCode(event.which).toLowerCase();
  };
  return{registerCallback:registerCallback, executePasteCallback:executePasteCallback, executeCallback:executeCallback, getKeyInfo:getKeyInfo, getKeyInfoFromEvent:getKeyInfoFromEvent};
}});
// Input 3
hilary.register("nicephore::observer::models", {init:function(console, FileReader) {
  var keyInfoProto, keyInfo, callbackProto, callback, pasteProto, pasteObject;
  keyInfoProto = {key:null, modifiers:[], eventType:null, matchAnyModifier:false};
  keyInfo = function(data) {
    var self = Object.create(keyInfoProto);
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
  callbackProto = {key:null, keyInfo:Object.create(keyInfoProto), func:function(event, eventKeyInfo) {
    console.log(eventKeyInfo, event);
  }, eventType:null};
  callback = function(data) {
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
  pasteProto = {kind:null, type:null, file:null, dataUrl:null, toDataUrl:function() {
    throw new Error("toDataUrl is not implemented");
  }};
  pasteObject = function(data) {
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
    self.readToDataUrl = function() {
      if (!FileReader) {
        return;
      }
      var reader = new FileReader;
      reader.onload = function(event) {
        self.dataUrl = event.target.result;
      };
      return reader.readAsDataURL(self.file);
    };
    return self;
  };
  return{keyInfo:keyInfo, callback:callback, pasteObject:pasteObject};
}});
// Input 4
hilary.register("nicephore::observer", {init:function(maps, utils, models, helpers, console, JSON) {
  var observe, observeOne, observePaste, observeDomEvent, observeKeyEvents, stopObserving, isStarted = false, keyEventHandler;
  observe = function(keys, eventType, matchAnyModifier, callback) {
    var key;
    for (key in keys) {
      var currentKey = keys[key];
      if (currentKey === "paste") {
        observePaste(callback);
      } else {
        observeOne(currentKey, eventType, matchAnyModifier, callback);
      }
    }
  };
  observeOne = function(key, eventType, matchAnyModifier, callback) {
    var keyInfo = helpers.getKeyInfo(key, eventType), callbackObj;
    keyInfo.matchAnyModifier = matchAnyModifier;
    callbackObj = models.callback({key:key, keyInfo:keyInfo, callback:callback, eventType:eventType});
    helpers.registerCallback(keyInfo, callbackObj);
  };
  observePaste = function(callback) {
    var keyInfo = helpers.getKeyInfo("paste", "void"), callbackObj;
    callbackObj = models.callback({key:"paste", keyInfo:keyInfo, callback:callback, eventType:"void"});
    helpers.registerCallback(keyInfo, callbackObj);
    if (document.onpaste !== undefined) {
      document.onpaste = function(event) {
        var i, items, output = {items:[], json:""};
        items = (event.clipboardData || event.originalEvent.clipboardData).items;
        output.json = JSON.stringify(items);
        for (i in items) {
          var item = items[i], pasteObj = new models.pasteObject({kind:item.kind, type:item.type});
          if (item.kind === "file" && item.getAsFile) {
            pasteObj.file = item.getAsFile();
            pasteObj.readToDataUrl();
          }
          output.items.push(pasteObj);
        }
        helpers.executePasteCallback(keyInfo, event, output);
      };
    }
  };
  stopObserving = function(keys, eventType) {
    throw new Error("stopObserving is not implemented");
  };
  keyEventHandler = function(event) {
    var info = helpers.getKeyInfoFromEvent(event);
    if (!info.key) {
      return;
    }
    helpers.executeCallback(info, event);
  };
  observeDomEvent = function(domObject, eventType) {
    utils.observeDomEvent(domObject, eventType, keyEventHandler);
    return this;
  };
  observeKeyEvents = function(domObject) {
    observeDomEvent(domObject, "keypress");
    observeDomEvent(domObject, "keydown");
    observeDomEvent(domObject, "keyup");
    return this;
  };
  return{start:function() {
    if (isStarted) {
      return this;
    }
    observeKeyEvents(document);
    isStarted = true;
    return this;
  }, observeDomEvent:observeDomEvent, observeKeyEvents:observeKeyEvents, observe:function(keys, eventType, matchAnyModifier, callback) {
    keys = utils.isArray(keys) ? keys : [keys];
    if (utils.isFunction(matchAnyModifier)) {
      observe(keys, eventType, false, matchAnyModifier);
    } else {
      observe(keys, eventType, matchAnyModifier, callback);
    }
    return this;
  }, stopObserving:stopObserving, trigger:function(mockEvent) {
    keyEventHandler(mockEvent);
  }};
}});
// Input 5
hilary.use([window, window.FileReader, window.console, window.JSON], function(ctx, window, FileReader, console, JSON) {
  var makeNicophore = function() {
    var maps = hilary.resolve("nicephore::observer::maps").init(), utils = hilary.resolve("nicephore::observer::utils").init(maps), models = hilary.resolve("nicephore::observer::models").init(console, FileReader), helpers = hilary.resolve("nicephore::observer::helpers").init(maps, utils, models), observer = hilary.resolve("nicephore::observer").init(maps, utils, models, helpers, console, JSON);
    return observer;
  };
  window.nicephore = makeNicophore;
  return window.nicephore;
});
