(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', mobilePanel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var copies = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-copy]'));
    var title = hero.querySelector('[data-hero-title]');
    var description = hero.querySelector('[data-hero-description]');
    var watchLink = hero.querySelector('[data-hero-watch-link]');
    var categoryLink = hero.querySelector('[data-hero-category-link]');
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      if (copies[index]) {
        var copy = copies[index];
        var copyTitle = copy.querySelector('h2');
        var copyDescription = copy.querySelector('p');
        var copyWatch = copy.querySelector('[data-copy-watch]');
        var copyCategory = copy.querySelector('[data-copy-category]');

        if (title && copyTitle) {
          title.textContent = copyTitle.textContent;
        }
        if (description && copyDescription) {
          description.textContent = copyDescription.textContent;
        }
        if (watchLink && copyWatch) {
          watchLink.href = copyWatch.href;
        }
        if (categoryLink && copyCategory) {
          categoryLink.href = copyCategory.href;
          categoryLink.textContent = copyCategory.textContent;
        }
      }
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-card-search]');
    var type = scope.querySelector('[data-card-type]');
    var year = scope.querySelector('[data-card-year]');
    var reset = scope.querySelector('[data-clear-filter]');
    var grid = document.querySelector(scope.getAttribute('data-filter-scope'));
    var empty = document.querySelector(scope.getAttribute('data-empty-target'));

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = normalize(search && search.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-summary'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
  });

  document.querySelectorAll('[data-video-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');
    var cover = player.querySelector('[data-player-cover]');
    var errorBox = player.querySelector('[data-player-error]');
    var source = player.getAttribute('data-video');
    var active = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.textContent = '播放暂不可用，请稍后重试';
        errorBox.classList.add('is-visible');
      }
    }

    function startPlayback() {
      player.classList.add('is-started');
      if (cover) {
        cover.setAttribute('aria-hidden', 'true');
      }

      if (!active) {
        active = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('error', showError);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
