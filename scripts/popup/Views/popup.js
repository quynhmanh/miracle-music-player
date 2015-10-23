define(['underscore', 
		'backbone',
		'text!/templates/popup_template.html',
], function(_, Backbone, Html){
	var PopupView = Backbone.View.extend({
		popupTemplate: _.template(Html),
		el: '#main-container',
		render: function(){
			this.$el.html(this.popupTemplate());
		},
		initialize: function(){
		}
	});
	return PopupView;
});