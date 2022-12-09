$(document).ready(function(){
        // POST commands to YouTube or Vimeo API
function postMessageToPlayer(player, command){
    if (player == null || command == null) return;
    player.contentWindow.postMessage(JSON.stringify(command), "*");
  }
  
  function playPauseVideo(_this, control){
    var videoType, player;
  
    // videoType = _this.getAttribute('')
    videoType = _this.closest('.video-container').find('div').data('video-type');
    player = _this.closest('.video-container').find('iframe')[0];
  
    if (videoType === "vimeo") {
      switch (control) {
        case "play":
          if (!_this.classList.contains('started')) {
            _this.classList.add('started');
            postMessageToPlayer(player, {
              "method": "setCurrentTime",
              "value" : 1
            });
          }
          postMessageToPlayer(player, {
            "method": "play",
            "value" : 1
          });
          $('.play-video').hide();
          break;
        case "pause":
          postMessageToPlayer(player, {
            "method": "pause",
            "value": 1
          });
          $('.play-video').show();
          break;
      }
    } else if (videoType === "youtube") {
      switch (control) {
        case "play":
          postMessageToPlayer(player, {
            "event": "command",
            "func": "mute"
          });
          postMessageToPlayer(player, {
            "event": "command",
            "func": "playVideo"
          });
          $('.play-video').hide();
          break;
        case "pause":
          postMessageToPlayer(player, {
            "event": "command",
            "func": "pauseVideo"
          });
          $('.play-video').show();
          break;
      }
    }
  }

    $('.accordion-tab--item').click(function(){
        const target = $(this).data('accordion-target');
        $('.accordion-tab--item').removeClass('active');
        $('.accordion-content').removeClass('active');
        $('.video-container').removeClass('active');
        $(this).addClass('active');
        $(`[data-accordion-id="${target}"]`).addClass('active');

        $('.play-video').each(function(){
            playPauseVideo($(this), "pause");
        });
    });

    $('.play-video').click(function(){
        playPauseVideo($(this), "play");
    });

    $('.before-after-slider').slick({
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
        {
          breakpoint: 749,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });
});