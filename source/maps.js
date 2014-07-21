/*jslint plusplus: true */
/**
* Keyboard mappings for event handling
*/
hilary.register('nicephore::observer::maps', { init: function () {
    "use strict";
    
    var i,
        map,
        keycodeMap,
        shiftMap,
        reverseMap,
        getReverseMap,
        aliases,
        callbackMap = {};
    
    map = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };
    
    keycodeMap = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111 : '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };
    
    shiftMap = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        ':': ';',
        '\"': '\'',
        '<': ',',
        '>': '.',
        '?': '/',
        '|': '\\'
    };

    aliases = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (i = 1; i < 20; ++i) {
        map[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        map[i + 96] = i;
    }

    getReverseMap = function () {
        if (!reverseMap) {
            var key;
            reverseMap = {};
            
            for (key in map) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (map.hasOwnProperty(key)) {
                    reverseMap[map[key]] = key;
                }
            } // /for

        } // /if
        
        return reverseMap;
    };
    
    return {
        /**
        * mapping of special keycodes to their corresponding keys
        *
        * everything in this dictionary cannot use keypress events
        * so it has to be here to map to the correct keycodes for
        * keyup/keydown events
        *
        * @type {Object}
        */
        map: map,
        
        /**
        * mapping for special characters so they can support
        *
        * this dictionary is only used incase you want to bind a
        * keyup or keydown event to one of these keys
        *
        * @type {Object}
        */
        keycodeMap: keycodeMap,
        
        /**
        * this is a mapping of keys that require shift on a US keypad
        * back to the non shift equivelents
        *
        * this is so you can use keyup events with these keys
        *
        * note that this will only work reliably on US keyboards
        *
        * @type {Object}
        */
        shiftMap: shiftMap,
        
        /**
        * variable to store the flipped version of _MAP from above
        * needed to check if we should use keypress or not when no action
        * is specified
        *
        * @type {Object|undefined}
        */
        reverseMap: reverseMap,
        
        /**
        * this is a list of special strings you can use to map
        * to modifier keys when you specify your keyboard shortcuts
        *
        * @type {Object}
        */
        aliases: aliases,

        /**
         * reverses the map lookup so that we can look for specific keys
         * to see what can and can't use keypress
         *
         * @return {Object}
         */
        getReverseMap: getReverseMap,
        
        callbackMap: callbackMap
    };
}});