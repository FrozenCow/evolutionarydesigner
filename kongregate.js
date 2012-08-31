define(function() {
	return function(g,ready) {
		if (!/^https?:\/\/www.kongregate.com\//.test(document.referrer)) { return; }
		console.log('Loading kongregate...');
		kongregateAPI.loadAPI(kongregateLoaded);
		function kongregateLoaded() {
			console.log('Loaded kongregate API...');
			g.kongregate = kongregateAPI.getAPI();
			ready();
		}
		return ready;
	};
});