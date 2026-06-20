(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function run() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        run();
      });
    });

    show(0);
    run();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var cards = selectAll('[data-movie-card]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input && !select) {
      return;
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function match(card, keyword, region) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' '));
      var regionValue = normalize(card.getAttribute('data-region'));
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var regionOk = !region || regionValue.indexOf(region) !== -1;
      return keywordOk && regionOk;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var region = normalize(select ? select.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card, keyword, region);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  function setupPlayer(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegURL')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    setupPlayer: setupPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
