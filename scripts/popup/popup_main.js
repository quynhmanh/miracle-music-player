require.config({
	paths: {
		jquery: "../jquery-2.1.4.min",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		text: "../text"
	}
});

require(['../common/song', 'views/popup'], function(Song, PopupView){
	var popupView = new PopupView();
});