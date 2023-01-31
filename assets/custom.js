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

    $('.quantity__atc').click(function(e){
      e.preventDefault();
      $('.product-form__submit').click();
    });


    /* Quick View Start */

    $('.quick_view').click(function(e){
      e.preventDefault();
      const handle = $(this).data('product-handle');
      fetch(`/products/${handle}?section_id=quickview`)
      .then(response => response.text())
      .then(data => {
        var section = new DOMParser().parseFromString(data, 'text/html').querySelector('.shopify-section');
        $('.quick__view-modal').empty();
        $('.quick__view-modal').append(section);
        $('.quick__view-modal').addClass('open');
      });
    });

    $(document).on('click', '.quick__view-close', function(e){
      e.preventDefault();
      const quickModal = $(this).closest('.quick__view-modal');
      quickModal.removeClass('open');
    });

    $(document).on('change', '.product__quick-view .product-form__input input', function(e){
      e.preventDefault();
      var variantData = JSON.parse(this.closest('variant-radios').querySelector('[type="application/json"]').textContent);
      const fieldsets = Array.from(this.closest('variant-radios').querySelectorAll('fieldset'));
      options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
      var currentVariant = variantData.find((variant) => {
        return !variant.options.map((option, index) => {
          return options[index] === option;
        }).includes(false);
      });

      $('.variant-image').addClass('hidden');
      $(`.variant-image[data-variant-id="${currentVariant.id}"]`).removeClass('hidden');

      $('.quick__view-id').val(currentVariant.id);

      $('.quick_add').prop( "disabled",!currentVariant.available);
    });

    $(document).on('click', '.quick_add', function(e){
      e.preventDefault();
      var form = this.closest('form');
      var cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(form);
      if (cart) {
        formData.append('sections', cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        cart.setActiveElement(document.activeElement);
      }
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          } else if (!cart) {
            window.location = window.routes.cart_url;
            return;
          }

          cart.renderContents(response);
          $('.quick__view-modal').removeClass('open');
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty');
        });
    });

    /* Quick View End */
});