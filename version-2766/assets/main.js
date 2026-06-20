(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      body.classList.remove('nav-open');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
      dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
    });
  }

  if (slides.length > 1) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 6500);
      });
    });

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 6500);
  }

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var scope = list.closest('[data-filter-scope]') || document;
    var searchInput = scope.querySelector('[data-search-input]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var emptyState = scope.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var show = matchesQuery && matchesType && matchesYear;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  });
})();
