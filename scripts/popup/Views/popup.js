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
		
		events: {
			"click .fui-play" : "playCurrentSong",
			"click .fui-pause" : "pauseCurrentSong",
			"change #search-query-3": "searchQuery",
			"click .musicSearch": "chooseSong"
		},
		
		initialize: function(){
			this.bg = chrome.extension.getBackgroundPage();
			this.render();
			this.bg.player.on('change', this.renderTime, this);
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			window.context = new window.AudioContext();
			this.renderTime();
		},
		
		el: '#main-container',
		
		render: function(){
			this.$el.html(this.popupTemplate());
			
			$('#slider', this.el).slider({
				min: 0, max: 100, value: 0, range: "min"
			});
			
			if (this.bg.player.get('state')){
				$('#btn-play').removeClass('fui-play').addClass('fui-pause');
			}
		},
		
		renderTime: function(){
			var time = this.bg.player.get('time');
			var duration = this.bg.player.get('duration');
			var song = this.bg.player.get('currentSong');
			
			if (time > duration){
				this.pauseCurrentSong();
				this.bg.player.set('time', 0);
			}
			
			$('#time', this.el).html(
				Moment().startOf('day').seconds(time).format('mm:ss')
			);
			
			$('#slider', this.el).slider({
				value: time * 100 / duration
			});
			
			if (song)
				$('#song-title', this.el).html(song.get('Title') + ' - ' + song.get('Artist'));
		},
		
		chooseSong: function(e){
			var self = this;
			var nth = e.currentTarget.getAttribute('data-nth');
			var data = this.searchList[nth];
			var song = new Song(data);
			var bg = chrome.extension.getBackgroundPage();
			bg.player.set('time', 0);
			self.pauseCurrentSong();
			song.on('change :buffer', function(){
				bg.player.set('duration', song.get('buffer').duration);
				self.playCurrentSong();
			});
			bg.player.set('currentSong', song);
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
			var API = 'http://j.ginggong.com/jOut.ashx?h=mp3.zing.vn&code=';
			var keyAPI = 'f55a079f-cff2-4969-a9dc-aa4b6e5029f5';
			var self = this;
			$.ajax({
				context: this,
				url: API + keyAPI,
				data: 'k=' + encodeURIComponent(s),
				dataType: 'json',
				success: function(data){
					self.searchList = data;
					var searchList =  $('#search-list');
					searchList.empty();
					if (data.length === 0){
						searchList.append("<li>Try again</li>");
						searchList.append("<li>Tips: Searching with both name and artist of the song</li>");
					}
					for (var i = 0; i < data.length; ++i){
						if (i > 8) break;
						
						var left = data[i]['Title'].indexOf('/');
						var right = data[i]['Title'].indexOf('+');
						if (left == -1) left = 0; else left++;
						if (right == -1) right = data[i]['Title'].length - 1; else right--;
						
						data[i]['Title'] = this.toPascalCase(data[i]['Title'].substr(left, right - left + 1)
										.replace(/[\u4e00-\u9fff\u3400-\u4dff\uf900-\ufaff]/g, ''));
						
						searchList.append("<a href='#' class='musicSearch' data-nth='" + i + "'><li>" + data[i]['Title'] + 
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
		
		playCurrentSong: function(){
			var self = this;	
			
			if (!this.bg.player.get('currentSong').get('buffer')) return;
			this.bg.player.playCurrentSong();
			$('#btn-play', this.el).removeClass('fui-play').addClass('fui-pause');
		},
		
		pauseCurrentSong: function(){
			if (!this.bg.player.get('currentSong') || !this.bg.player.get('source')) return;
			this.bg.player.pauseCurrentSong();
			$('#btn-play', this.el).removeClass('fui-pause').addClass('fui-play');
		}
	});
	return PopupView;
});