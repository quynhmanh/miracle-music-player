define(['underscore', 
		'backbone',
		'text!/templates/popup_template.html',
		'jquery',
		'moment',
		'player',
		'songModel'
], function(_, Backbone, Html, $, Moment, Player, Song){
	var PopupView = Backbone.View.extend({
		popupTemplate: _.template(Html),
		
		el: '#main-container',
		
		render: function(){
			this.$el.html(this.popupTemplate());
			$('#slider', this.el).slider({
				min: 0, max: 100, value: 0, range: "min"
			});
		},
		
		renderTime: function(){
			var self = this;
			$('#time', this.el).html(
				Moment().startOf('day').seconds(this.model.get('time')).format('mm:ss')
			);
			$('#slider', this.el).slider({
				value: self.model.get('time') * 100 / this.duration
			});
		},
		
		events: {
			"click .fui-play" : "playCurrentSong",
			"click .fui-pause" : "pauseCurrentSong",
			"change #search-query-3": "searchQuery"
		},
		
		toPascalCase: function(str) {
			var arr = str.trim().split(/\s|_/);
			
			for(var i=0,l=arr.length; i<l; i++) {
				if (i == 0)
					arr[i] = arr[i].substr(0, 1).toUpperCase() + arr[i].substr(1);
				else 
					arr[i] = arr[i].substr(0,1).toLowerCase() + arr[i].substr(1);
			}
			return arr.join(" ");
		},
		
		searchMusic: function(s){
			var self = this;
			$.ajax({
				context: this,
				url: 'http://j.ginggong.com/jOut.ashx?h=mp3.zing.vn&code=f55a079f-cff2-4969-a9dc-aa4b6e5029f5',
				data: 'k=' + encodeURIComponent(s),
				dataType: 'json',
				success: function(data){
					var searchList =  $('#search-list');
					searchList.empty();
					for (var i = 0; i < data.length; ++i){
						if (i > 8) break;
						var left = data[i]['Title'].indexOf('/');
						var right = data[i]['Title'].indexOf('+');
						if (left == -1) left = 0; else left++;
						if (right == -1) right = data[i]['Title'].length - 1; else right--;
						data[i]['Title'] = data[i]['Title'].substr(left, right - left + 1);
						data[i]['Title'].replace(/[\u4e00-\u9fff\u3400-\u4dff\uf900-\ufaff]/g, '');
						data[i]['Title'] = this.toPascalCase(data[i]['Title']);
						searchList.append("<a href='#'><li>" +
										    data[i]['Title'] + 
										  	"<img src='" + data[i]['Avatar'] + "'</img>" +
										  	"<span>" + data[i]['Artist'] + "</span>" +
										  "</li></a>");
					}
				}
			});
		},
		
		searchQuery: function(){
			var query = $('#search-query-3', this.el).val();
			this.searchMusic(query);
		},
		
		initialize: function(){
			this.render();
			this.model.on('change', this.renderTime, this);
		},
		
		playCurrentSong: function(){
			var self = this;
			var bg = chrome.extension.getBackgroundPage();
			
			console.log(bg.player);
			if (!bg.player.get('currentSong').get('buffer')) return;
			
			bg.player.playCurrentSong(this.model.get('time'));
			this.duration = bg.player.get('duration');
			console.log(this.duration);
			var currentTime = this.model.get('time');
			window.interval = setInterval(function(){
				++currentTime;
				console.log(currentTime);
				self.model.set('time', currentTime);
			}, 1000);
			
			$('#btn-play', this.el).removeClass('fui-play').addClass('fui-pause');
		},
		
		pauseCurrentSong: function(){
			var bg = chrome.extension.getBackgroundPage();
			bg.player.pauseCurrentSong();
			clearInterval(interval);
			$('#btn-play', this.el).removeClass('fui-pause').addClass('fui-play');
		}
	});
	return PopupView;
});