(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  var searchInput = document.getElementById('searchInput');
  var urlQuery = new URLSearchParams(window.location.search).get('q');

  if (searchInput && urlQuery) {
    searchInput.value = urlQuery;
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilter() {
      var keyword = normalizeText(input.value);
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-search') || card.textContent);
        card.hidden = keyword !== '' && text.indexOf(keyword) === -1;
      });
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  var video = document.querySelector('.movie-video[data-stream]');
  var gate = document.querySelector('[data-play-gate]');
  var hlsInstance = null;

  function bindStream() {
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!stream || video.getAttribute('data-bound') === 'yes') {
      return;
    }

    video.setAttribute('data-bound', 'yes');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function startVideo() {
    if (!video) {
      return;
    }

    bindStream();

    if (gate) {
      gate.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (gate && video) {
    gate.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('play', bindStream, { once: true });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
})();
