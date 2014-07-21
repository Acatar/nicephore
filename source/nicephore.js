hilary.use([window], function(ctx, window) {
	var maps = hilary.resolve('nicephore::observer::maps').init(),
		utils = hilary.resolve('nicephore::observer::utils').init(maps),
		models = hilary.resolve('nicephore::observer::models').init(maps),
		helpers = hilary.resolve('nicephore::observer::helpers').init(maps, utils, models),
		observer = hilary.resolve('nicephore::observer').init(maps, utils, models, helpers, console);

		observer.start();

		window.nicephore = observer;
});