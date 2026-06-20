(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMobileNav() {
    var button = document.querySelector('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    selectAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  function setHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setFilters() {
    var panels = selectAll('[data-filter-scope]');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var tabs = selectAll('[data-filter-tab]', panel);
      var cards = selectAll('[data-filter-card]', panel);
      var empty = panel.querySelector('[data-empty-state]');
      var activeFilter = 'all';

      function apply() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var typeMatch = activeFilter === 'all' || haystack.indexOf(activeFilter) !== -1;
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var shouldShow = typeMatch && queryMatch;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          activeFilter = normalize(tab.getAttribute('data-filter-tab')) || 'all';
          tabs.forEach(function (item) {
            item.classList.toggle('active', item === tab);
          });
          apply();
        });
      });

      apply();
    });
  }

  function attachHls(video, source) {
    if (!video || !source) {
      return Promise.reject(new Error('empty source'));
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return Promise.resolve();
    }
    video.src = source;
    return Promise.resolve();
  }

  function setPlayers() {
    var players = selectAll('[data-player]');
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-player-button]');
      var overlay = box.querySelector('.player-overlay');
      var message = box.parentElement ? box.parentElement.querySelector('[data-player-message]') : null;
      var source = video ? video.getAttribute('data-src') : '';
      var ready = false;

      function start() {
        if (!video || !source) {
          return;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var setup = ready ? Promise.resolve() : attachHls(video, source);
        ready = true;
        setup.then(function () {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              if (message) {
                message.textContent = '点击视频控件即可继续播放';
              }
            });
          }
        }).catch(function () {
          if (message) {
            message.textContent = '当前浏览器暂时无法打开该播放源';
          }
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!ready) {
            start();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setMobileNav();
    setHero();
    setFilters();
    setPlayers();
  });
})();
