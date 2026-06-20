
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function runCardFilter(scope) {
    var root = scope || document;
    var cards = qsa('[data-search-card]', root);
    var keywordInput = qs('[data-filter-keyword]', root);
    var yearSelect = qs('[data-filter-year]', root);
    var typeSelect = qs('[data-filter-type]', root);
    var regionSelect = qs('[data-filter-region]', root);
    var counter = qs('[data-filter-count]', root);

    if (!cards.length || !keywordInput) {
      return;
    }

    function apply() {
      var keyword = normalize(keywordInput.value);
      var year = yearSelect ? normalize(yearSelect.value) : '';
      var type = typeSelect ? normalize(typeSelect.value) : '';
      var region = regionSelect ? normalize(regionSelect.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          ok = false;
        }
        if (type && normalize(card.getAttribute('data-type')) !== type) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          ok = false;
        }

        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function bindHeaderSearch() {
    qsa('[data-header-search]').forEach(function (box) {
      var input = qs('input', box);
      var button = qs('button', box);

      function submit() {
        var value = input ? input.value.trim() : '';
        var currentPath = window.location.pathname;
        var depth = currentPath.indexOf('/detail/') !== -1 || currentPath.indexOf('/category/') !== -1 ? '../' : './';

        if (!value) {
          window.location.href = depth + 'categories.html';
          return;
        }

        if (!value) {
          window.location.href = depth + 'categories.html';
          return;
        }

        window.location.href = depth + 'categories.html?q=' + encodeURIComponent(value);
      }

      if (button) {
        button.addEventListener('click', submit);
      }
      if (input) {
        input.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            submit();
          }
        });
      }
    });
  }

  function readQueryKeyword() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = qs('[data-filter-keyword]');

    if (q && input) {
      input.value = q;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileMenu();
    bindHeaderSearch();
    readQueryKeyword();
    runCardFilter(document);
  });
})();
