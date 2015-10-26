define(['jquery', 'backbone'], function($, Backbone){
	
	var Player = Backbone.Model.extend({
		defaults: {
			slider: null,
			currentSong: null
		}
	});
	
	return Player;
});