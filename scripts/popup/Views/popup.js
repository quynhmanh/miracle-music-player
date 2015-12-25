define(['underscore', 
		'backbone',
		'text!/templates/popup_template.html',
		'jquery',
		'moment',
		'player',
		'songModel',
		'database'
], function(_, Backbone, Html, jQuery, Moment, Player, Song, Database){
	var PopupView = Backbone.View.extend({
		popupTemplate: _.template(Html),
		
		events: {
			"click .fui-play" : "onResume",
			"click .fui-pause" : "onPause",
			"change #search-query-3": "searchQuery",
			"click .musicSearch": "selectSong",
			"click .addToPlaylist": "addToPlaylist",
			"click .musicPlaylist": "playPlaylist",
			"click .fui-cross": "deletePlaylist",
			"click .glyphicon-forward" : "nextSong",
			"click .glyphicon-backward" : "prevSong"
		},
		
		initialize: function(){
			var self = this;
			var background = chrome.extension.getBackgroundPage();
			// background.console.log(background.player);
			this.bg = chrome.extension.getBackgroundPage();
			this.db = new Database();
			window.db = this.db;
			window.bg = this.bg;	
			// console.log(this.bg.player);
			interval = setInterval(function(){
				self.renderTime();
			}, 1000);
			this.render();
			this.renderTime();
			this.addToPlaylistBackground();
			this.showPlaylist();
			this.updateDatabase();
		},
		
		el: '#main-container',
		
		render: function(){
			var self = this;
			this.$el.html(this.popupTemplate());	
			$('#slider', this.el).slider({min: 0, max: 100, value: 0, range: "min",
				change: function( event, ui ) {
					if (event.altKey === false && self.bg.player.audio && self.bg.player.audio.duration){
						self.bg.player.audio.currentTime = self.bg.player.audio.duration * ui.value / 100;
						// console.log(self.bg.player.audio.duration * ui.value / 100);
					}
				}							 
			});
			$('#search-area').hide();
			$('#playlist-area').hide();
			$('.fui-search').click(function(){
				$('#playlist-area').hide();
				$('#search-area').toggle();
			});
			$('.fui-clip').click(function(){
				$('#search-area').hide();
				$('#playlist-area').toggle();
				self.showPlaylist();
			});
		},
		
		renderTime: function(){
			// console.log(this.bg.player);
			var duration = 0;
			var time = 0;
			var title = "Miracle Music Player"; 
			var artist = "Without music, life would be a mistake";
			var player = this.bg.player;
			
			if (player.audio && player.audio.ended)
				player.audio.timeCurrent = 0;
			
			if (player.audio && player.audio.duration !== NaN)
				duration = player.audio.duration;
			
			if (player.audio)
				time = player.audio.currentTime;
			
			if (player.get('currentSong')){
				title = player.get('currentSong').get('Title');
				artist = player.get('currentSong').get('Artist');
			}
			
			if (player.get('ns') === true){
				this.showPlaylist();
				player.set('ns', false);
			}

			if (player.audio && player.audio.ended)
				$('#slider', this.el).slider({ value: 0 });

			if (duration !== 0)
				$('#slider', this.el).slider({ value: (time - 3) * 100 / duration });
			
			
			$('#time', this.el).html( Moment().startOf('day').seconds(time).format('mm:ss') );

			if (isNaN(duration)) duration = 0;
				$('.duration', this.el).html( Moment().startOf('day').seconds(duration).format('mm:ss') );

			$('#song-title', this.el).html(title);
			$('#song-title', this.el).addClass('faa-horizontal animated faa-slow');
			$('#song-artist', this.el).html(artist);
			$('#song-artist', this.el).addClass('faa-horizontal animated faa-slow');
			if (player.get('state')) this.btnPause();
			else this.btnPlay();
			
		},
		
		selectSong: function(e){
			console.log(e);
			var nth = e.currentTarget.getAttribute('data-nth');
			var data = this.searchList[nth];
			console.log(data);
			var bg = chrome.extension.getBackgroundPage();
			bg.player.pauseCurrentSong();
			var listSong = {i:0, list: data};
			var list = [];
			list.push(data);
			console.log(list);
			bg.player.playlist(0, list);
			bg.player.set('singleSong', true);
			this.btnPause();
		},

		playPlaylist: function(e){
			var self = this;
			var Id = e.currentTarget.getAttribute('data-nth');
			var db = new Database();
			var bg = chrome.extension.getBackgroundPage();
			bg.player.set('singleSong', false);
			bg.player.pauseCurrentSong();

			db.request.onsuccess = function(){
				var list = [];
				var request = db.request.result.transaction("customers").objectStore("customers").get(Id);
				var request2 = db.request.result.transaction("customers").objectStore("customers").openCursor();
				var i = -1;
				var callback = function(){
					console.log(i);
					console.log(list);
					bg.player.playlist(i - 1, list);
					console.log(bg.player.get('singleSong'));
					self.showPlaylist();
				}

				request2.onsuccess = function(event){
					var cursor = event.target.result;
					if (cursor){
						console.log(cursor.value);
						list.push(cursor.value);
						if (cursor.value['Id'] == Id)
							i = list.length;
						cursor.continue();
					}
					else 
						callback();
				}
			}
		},

		addToPlaylistBackground: function(){
			var bg = chrome.extension.getBackgroundPage();
			var db = new Database();
			db.request.onsuccess = function(){
				var list = [];
				// var request = db.request.result.transaction("customers").objectStore("customers").get(Id);
				var request2 = db.request.result.transaction("customers").objectStore("customers").openCursor();
				var callback = function(){
					// console.log("addToPlaylistBackground");
					bg.player.playlist(0, list, false);
				}

				request2.onsuccess = function(event){
					var cursor = event.target.result;
					if (cursor){
						// console.log(cursor.value);
						list.push(cursor.value);
						cursor.continue();
					}
					else 
						callback();
				}
			}
		},

		addToPlaylist: function(e){
			// console.log(e.currentTarget);
			$(e.currentTarget).hide();
			var nth = e.currentTarget.getAttribute('data-nth');
			var data = this.searchList[nth];
			var num = this.db.get('num');
			data['num'] = num + 1;
			this.db.add(data);
			this.showPlaylist();
			this.addToPlaylistBackground();
		},

		deletePlaylist: function(e) {
			var self = this;
			var Id = e.currentTarget.getAttribute('data-nth');
			var db = new Database();
			console.log(Id);
			db.request.onsuccess = function(){
				var request = db.request.result.transaction("customers", "readwrite").objectStore("customers").delete(Id);
				self.addToPlaylistBackground();
			}
			this.showPlaylist();
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
		
		searchQuery: function(){
			var query = $('#search-query-3', this.el).val();
			this.searchMusic(query);
		},
		
		btnPlay: function(){
			var button = $('#btn-play', this.el);
			if (button.hasClass('fui-pause'))
				button.removeClass('fui-pause').addClass('fui-play');
		},
		
		btnPause: function(){
			var button = $('#btn-play', this.el);
			if (button.hasClass('fui-play'))
				button.removeClass('fui-play').addClass('fui-pause');
		},
		
		onPause: function(){
			var bg = chrome.extension.getBackgroundPage();
			if (bg.player.get('state'))
				this.btnPlay();
			bg.player.pauseCurrentSong();
		},
		
		onResume: function(){
			var bg = chrome.extension.getBackgroundPage();
			if (bg.player.get('currentSong'))
				this.btnPause();
			if (!bg.player.get('currentSong')) return;
			bg.player.playCurrentSong();
		},

		inPlaylist: function(song){
			var bg = chrome.extension.getBackgroundPage();
			var list = bg.player.get('list');
			for (var i = 0; i < list.length; ++i)
				if (list[i]['Id'] === song['Id'] || list[i]['Title'] === song['Title'] )
					return true;
			return false;
		},

		isPlaying: function(song){
			var bg = chrome.extension.getBackgroundPage();
			var list = bg.player.get('list');
			var id = bg.player.get('id');
			if (bg.player.get('singleSong'))
				return false;
			if (!list || list.length === 0)
				return false;
			// var s = list[i];
			// console.log(list);
			if (id === song['Id'])
				return true;
			return false;
		},
		
		searchMusic: function(s){
			var self = this;
			// SC.initialize({
			//   	client_id: '543ea2d2b1d330cf33e36d7f5831ef91'
			// });

			// // find all sounds of buskers licensed under 'creative commons share alike'
			// SC.get('/tracks', {
			//   	q: s
			// }).then(function(data) {
			//   	console.log(data);
			//   	self.searchList = data;
			// 		var searchList =  $('#search-list');
			// 		searchList.empty();
			// 		if (data.length === 0){
			// 			searchList.append("<li>Try again</li>");
			// 			searchList.append("<li>Tips: Searching with both name and artist of the song</li>");
			// 		}
			// 		console.log(data.length);
			// 		for (var i = 0; i < data.length; ++i){
			// 			if (i > 6) break;
			// 			// var left = data[i]['title'].indexOf('/');
			// 			// var right = data[i]['title'].indexOf('+');
			// 			// // console.log(data[i]['title']);	
			// 			// if (left === -1) left = 0; else left++;
			// 			// if (right === -1) right = data[i]['title'].length - 1; else right--;
			// 			// // console.log(data[i]['title']);						
			// 			// data[i]['title'] = this.shorter(this.toPascalCase(data[i]['title'].substr(left, right - left + 1)
			// 			// 				.replace(/[\u4e00-\u9fff\u3400-\u4dff\uf900-\ufaff]/g, '')), 40 - data[i]['Artist'].length);
			// 			// console.log(data[i]['title']);

			// 			var id = data[i]['title'].indexOf('-');
			// 			var title = data[i]['title'].substr(0, id);
			// 			var artist = data[i]['title'].substr(id+1, 999);
			// 			if (id === -1){
			// 				title = data[i]['title'];
			// 				artist = "Unknow";
			// 			}
			// 			console.log(title + " " + artist);
			// 			searchList.append("<li class='track'>" + (self.inPlaylist(data[i]) ? "" : "<a class='fui-plus addToPlaylist' href='#' data-nth='" + i + "'/>") +
			// 							  "</a><a href='#' class='fui-triangle-right-large musicSearch' data-nth='" + i + "' href='#'></a>" 
			// 							  + title + 
			// 							  "<img src='" + data[i]['artwork_url'] + "'</img>" +
			// 							  "<p>" + artist + "</p>" +
			// 							  "</li>");
			// 		}
					
			// 		$('.track', this.el).hover(
			// 			function(){
			// 				$($(this)[0].children[0]).show();
			// 				$($(this)[0].children[1]).show();
			// 				$('img', this).show();
			// 				$('p', this).show();
			// 			}, 
			// 			function(){
			// 				$($(this)[0].children[0]).hide();
			// 				$($(this)[0].children[1]).hide();
			// 				$('img', this).show();
			// 				$('p', this).show();
			// 			}
			// 		);
			// });
			var API = 'http://mp3.zing.vn/suggest/search?';
			// var keyAPI = 'f55a079f-cff2-4969-a9dc-aa4b6e5029f5';
			$.ajax({
				context: this,
				url: API,
				data: 'term=' + encodeURIComponent(s),
				dataType: 'json',
				success: function(data){
					var list = [];
					self.searchList = [];
					console.log(data['song']['list']);
					self.searchList = [];
					var searchList =  $('#search-list');
					searchList.empty();
					console.log(data);
					if (data['song']['list'].length === 0){
						searchList.append("<li>Try again!</li>");
						searchList.append("<li>Tips: Searching with both name and artist of the song</li>");
					}
					data = data['song']['list'];
					for (var i = 0; i < data.length; ++i){
						if (i > 6) break;
						
						$.ajax({
							context: self,
							url: 'http://mp3.zing.vn/bai-hat/a/' + data[i]['object_id'] + '.html',
							success: function(data) {
								var regex = /xmlURL=(.+?)\&amp\;textad/g;
								var xml = data.match(regex)[0];
								xml = xml.replace('&amp;textad', '').replace('xmlURL=', '');
								$.ajax({
									context: self,
									url: xml,
									dataType: 'text',
									success: function(data) {
										var regex = /<!\[CDATA\[.*?\]\]>/g;
										var title = data.match(regex)[0].replace('<![CDATA[', '').replace(']]>', '');
										var name = data.match(regex)[1].replace('<![CDATA[', '').replace(']]>', '');
										var link = data.match(regex)[3].replace('<![CDATA[', '').replace(']]>', '');
										var Id = data.match(regex)[7].replace('<![CDATA[', '').replace(']]>', '');
										var ava = data.match(regex)[8].replace('<![CDATA[', '').replace(']]>', '');
										var song = {Title: title, Artist: name, UrlJunDownload: link, Id: Id, Avatar: ava}; 
										console.log(song);
										list.push(song);
										self.searchList.push(song);
										song['Title'] = song['Title'].replace(/[\u4e00-\u9fff\u3400-\u4dff\uf900-\ufaff/]/g, '');
										// song['Title'] = song['Title'].substr(0, song['Title'].indexOf('+'));
										// console.log(song['Title'] + "/" + song['Artist']);
										searchList.append("<li class='track'>" + (self.inPlaylist(song) ? "" : "<a class='fui-plus addToPlaylist' href='#' data-nth='" + (list.length - 1) + "'/>") +
										  "</a><a href='#' class='fui-triangle-right-large musicSearch' data-nth='" + (list.length - 1) + "' href='#'></a>" 
										  + self.shorter(song['Title'], 27) + 
										  "<img src='" + ava + "'</img>" +
										  "<p>" + name + "</p>" +
										  "</li>");
										$('.track', this.el).hover(
											function(){
												$($(this)[0].children[0]).show();
												$($(this)[0].children[1]).show();
												$('img', this).show();
												$('p', this).show();
											}, 
											function(){
												$($(this)[0].children[0]).hide();
												$($(this)[0].children[1]).hide();
												$('img', this).show();
												$('p', this).show();
											}
										);
										$('#search-box > ul > li', this.el).hover(
											function(){
												$('img', this).css('opacity', 0);

											},
											function(){
												$('img', this).css('opacity', 1);
											}
										);
									}
								});
							}
						});

					}
					
					
				}
			});
			
		},
		
		//class='musicSearch' data-nth='" + i + "'>
		
		shorter: function(s, l){
			if (s.length < l) return s;
			 else return s.substr(0, l) + '...';
		},

		show: function(data) {

			for (var i = 0; i < data.length; ++i)
				for (var j = i + 1; j < data.length; ++j)
					if (data[i]['num'] > data[j]['num']){
						var tmp = data[i];
						data[i] = data[j];
						data[j] = tmp;
					}

			var self = this;
			for (var i = 0; i < data.length; ++i){
				var song = data[i];

			if (!self.isPlaying(song))
							$('#playlist-area').append("<div class='item-wrapper'><li class='track item-container'>" + "<a class='fui-cross song' href='#' data-nth='" + song['Id'] + "'></a><a href='#' class='fui-triangle-right-large musicPlaylist' data-nth='" + song['Id'] + "' href='#'></a>" + (self.shorter(song['Title'], 25)) + 
											  "<img src='" + song['Avatar'] + "'</img>" +
											  "<p>" + song['Artist'] + "</p>" +
											  "</li><div class='drag-handle ui-draggable-handle'></div></div>");
						else
							$('#playlist-area').append("<div class='item-wrapper'><li class='track playing item-container'>" +
												"<a class='fui-cross song' href='#' data-nth='" + song['Id'] + "'></a>" +
											  song['Title'] + 
											  "<img src='" + song['Avatar'] + "'</img>" +
											  "<p class=''>" + song['Artist'] + "</p>" +
											  "</li><div class='drag-handle ui-draggable-handle'></div></div>");
						$('.track', this.el).hover(
							function(){
								$($(this)[0].children[0]).show();
								$($(this)[0].children[1]).show();
								$('p', this).show();
								$('img', this).show();
							}, 
							function(){
								$($(this)[0].children[0]).hide();
								$($(this)[0].children[1]).hide();
								$('p', this).show();
								$('img', this).show();
							}
						)

						$('#playlist-area > div > li', this.el).hover(
							function(){
								$('img', this).css('opacity', 0);
							},
							function(){
								$('img', this).css('opacity', 1);
							}
						);
					}
		},

		showPlaylist: function(){
			var self = this;
			$('#playlist-area').empty();
			var db = new Database();
			var data = [];
			db.request.onsuccess = function(){
				var objectStore = db.request.result.transaction("customers").objectStore("customers");
				objectStore.openCursor().onsuccess = function(event) {
					var cursor = event.target.result;
					if (cursor){
						// console.log(cursor.value);
						var song = cursor.value;
						data.push(cursor.value);
						// if (!self.isPlaying(song))
						// 	$('#playlist-area').append("<div class='item-wrapper'><li class='track item-container'>" + "<a class='fui-cross' href='#' data-nth='" + cursor.value['Id'] + "'></a><a href='#' class='fui-triangle-right-large musicPlaylist' data-nth='" + cursor.value['Id'] + "' href='#'></a>" + (self.shorter(cursor.value['Title'], 25)) + 
						// 					  "<img src='" + cursor.value['Avatar'] + "'</img>" +
						// 					  "<p>" + cursor.value['Artist'] + "</p>" +
						// 					  "</li><div class='drag-handle ui-draggable-handle'></div></div>");
						// else
						// 	$('#playlist-area').append("<div class='item-wrapper'><li class='track playing item-container'>" +
						// 						"<a class='fui-cross' href='#' data-nth='" + cursor.value['Id'] + "'></a>" +
						// 					  cursor.value['Title'] + 
						// 					  "<img src='" + cursor.value['Avatar'] + "'</img>" +
						// 					  "<p class=''>" + cursor.value['Artist'] + "</p>" +
						// 					  "</li><div class='drag-handle ui-draggable-handle'></div></div>");
						// $('.track', this.el).hover(
						// 	function(){
						// 		$($(this)[0].children[0]).show();
						// 		$($(this)[0].children[1]).show();
						// 		$('p', this).show();
						// 		$('img', this).show();
						// 	}, 
						// 	function(){
						// 		$($(this)[0].children[0]).hide();
						// 		$($(this)[0].children[1]).hide();
						// 		$('p', this).show();
						// 		$('img', this).show();
						// 	}
						// )

						// $('#playlist-area > div > li', this.el).hover(
						// 	function(){
						// 		$('img', this).css('opacity', 0);
						// 	},
						// 	function(){
						// 		$('img', this).css('opacity', 1);
						// 	}
						// );

						cursor.continue();
					} else {
						self.show(data);
						self.sortable();
					}
				}	

			}
		},

		nextSong: function(){
			var player = this.bg.player;
			player.nextSong();
		},

		prevSong: function(){
			var player = this.bg.player;
			player.prevSong();
		},

		update: function(request, Id, i, songs, last) {
			var self = this;
			request.onsuccess = function() {
				// console.log(request.result);
				var song = request.result;
				song['num'] = i;
				var request2 = self.db.add(song, i);
				// console.log(song);
				songs.push(song);
				if (i === last){
					console.log(songs);
					self.bg.player.set('list', songs);
				}
			}
		},

		updateDatabase: function(){
			// var db = new Database();
			// db.remove();
			var self = this;
			var data = $('.song');
			var songs = [];
			// console.log(data);

			for (var i = 0; i < data.length; ++i){
				var Id = data[i].getAttribute('data-nth');

				var request = self.db.request.result.transaction("customers", "readwrite").objectStore("customers").get(Id);
				self.update(request, Id, i, songs, data.length - 1);
					
			}
			self.db.set('num', data.length - 1);
			// console.log(songs);
			// this.bg.player.set('list', songs);

		},

		sortable: function(){

			var self = this;

		   var items = 4;

		   var setPadding = function(atHeight) {
                rule.cssText = 'border-top-width: '+atHeight+'px'; 
            };

		   function fixHelper( e, ui ) {

		      	var $ctr = $(this);

		      	ui.helper
		        	.addClass('mx-state-moving ui-corner-all')
		         	.outerWidth($ctr.outerWidth())
		         	.find('.mx-content-hover')
		            .removeClass('mx-content-hover')
		            .hide(300)
		        	.end();
		   }

		   function changes(e, ui) {
		   		$(ui.placeholder).hide().show(300);
		   }

		   function toggleHover( e ) {
		      	if ( e.type == 'mouseenter' )
		        	$(this).addClass( 'mx-content-hover hover' );
		      	else
		         	$(this).removeClass( 'mx-content-hover hover' );

		   }

		   sdCfg = {

		        cursor: 'move',
		        zIndex: 200,
		        opacity: 0.9,
		        handle: '.drag-handle',
		        scroll: false,
		        containment: 'window',
		        appendTo: document.body,
		        helper: 'clone',
		        start: fixHelper

		   };

		$('.sort-container')
		        .sortable({
		         	axis: 'y',
		            containment: 'parent',
		            handle: '.item-container',
		            // tolerance: 'pointer',
		            // helper: 'clone',
		            start: fixHelper,
		            cancel: "a",
		            // cursor: "move",
		            stop: function(ev, ui) {
		                var next = ui.item.next();
		                next.css({'-moz-transition':'none', '-webkit-transition':'none', 'transition':'none'});
		                setTimeout(next.css.bind(next, {'-moz-transition':'border-top-width 0.1s ease-in', '-webkit-transition':'border-top-width 0.1s ease-in', 'transition':'border-top-width 0.1s ease-in'}));

		                self.updateDatabase();
		            },
		            // change: changes,
		            // scrollSensitivity: 10,
		            update: function ( e, ui ) {

		     	        if ( ui.item.find('.drag-handle').length == 0 ) {

		                    $('.drag-container .item-container').html('Item ' + (++items));

		                    ui.item
		                        .find('.item-container')
		                        	.before( $('<div class="drag-handle">') )
		                        	.parent()
		                        .draggable(sdCfg)
		                        .hover( toggleHover )
		                        .find('.drag-handle')
		                           	.hoverIntent( toggleHover );

		                    $(this).sortable('option', 'containment', 'parent');
		                  	}

		               }
		   			}).find('.item-wrapper')
		        .draggable(sdCfg)
		        .hover( toggleHover )
		        .find('.drag-handle');
				}
	});
	return PopupView;
});