define(['backbone'], function(Backbone){
	var Song = Backbone.Model.extend({
		defaults: {
			name: '',
			artist: '',
			url: '',
			image: ''
		}
	});
	return Song;
});