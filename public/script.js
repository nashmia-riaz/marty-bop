(function() {
  var isPlaying = false; var totalTime = 0; var timePassed = 0;
  var BOPTime = 0;
  AnimateLamp();

  function fetchDetails(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          if(response.is_playing && response.currently_playing_type != 'ad'){

            if($('.muzieknootjes').css('display') == 'none'){
                $('.muzieknootjes').fadeIn();
            }

            $('img#martyFace').css({
              'animation-duration':BOPTime+'s',
              'animation-play-state':'running'
            });

            isPlaying = true;

            if(response.item != null){
              song = response.item.name;
              artist = response.item.artists[0].name;
              albumArt = response.item.album.images[0].url;
              console.log('Playing song '+song+' by '+artist);

              $('#songArtist').html(artist);
              $('#songTitle').html(song);
            }

            //if new song is playing
            if((currentSong != song || currentArtist != artist)
              || (currentSong == "" && currentArtist == "")){

                var trackID = response.item.id;
              $.ajax({
                  url: 'https://api.spotify.com/v1/audio-features/'+trackID,
                  headers: {
                    'Authorization': 'Bearer ' + access_token
                  },
                  success: function(response2) {
                    BOPTime = 60/(response2.tempo*2);
                    console.log('BOP time fetched as '+BOPTime);
                    $('img#martyFace').css({
                      'animation-duration':BOPTime+'s',
                      'animation-play-state':'running'
                    });
                  }
                });

                currentSong = song;
                currentArtist = artist;
              }
          }
          //if response says not playing song
          else{
            isPlaying = false;
            $('img#martyFace').css({
              'animation-play-state':'paused'
            });
            if($('.muzieknootjes').css('display') != 'none'){
              $('.muzieknootjes').fadeOut();
            }
          }
        }
    });
  }

  function RefreshToken(){
    $.ajax({
      url: '/refresh_token',
      data: {
        'refresh_token': refresh_token
      }
    }).done(function(data) {
      access_token = data.access_token;
    });
  }

  function AnimateLamp(){
    console.log('animating lamp');
    var lampPost = $("#Lamp");
    
    setInterval(() => LampOf(lampPost), 5000);
    setInterval(() => LampOn(lampPost), 5100);
    setInterval(() => LampOf(lampPost), 6000);
    setInterval(() => LampOn(lampPost), 6200);
    
  }

  function LampOn(lamp){
    console.log('lamp on', lamp.src);
    lamp.attr("src", "Lamp on.png");
  }

  function LampOf(lamp){
    console.log('lamp off', lamp.src);
    lamp.attr("src", "Lamp off.png");
  }

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var currentSong="";
  var currentArtist = "";

  var song=""; var artist = ""; var albumArt = "";

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {

      $('#login').hide();
      $('.logout').show();

      fetchDetails();
      setInterval(fetchDetails, 10000);
      setInterval(RefreshToken, 3600000);
    } else {
      $('#login').show();
      $('.logout').hide();
    }
  }
})();
