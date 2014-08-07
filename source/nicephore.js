hilary.use([window, window.FileReader, window.console, window.JSON], function(ctx, window, FileReader, console, JSON) {
	"use strict";
    
    var makeNicophore = function () {
        var maps = hilary.resolve('nicephore::observer::maps').init(),
            utils = hilary.resolve('nicephore::observer::utils').init(maps),
            models = hilary.resolve('nicephore::observer::models').init(console, FileReader),
            helpers = hilary.resolve('nicephore::observer::helpers').init(maps, utils, models),
            observer = hilary.resolve('nicephore::observer').init(maps, utils, models, helpers, console, JSON);
        
        return observer;
    };

    window.nicephore = makeNicophore;
    
    return window.nicephore;
});