(function () {
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var title = document.querySelector('[data-search-title]');
  var movies = window.searchMovies || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function card(movie) {
    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">' +
        '<div class="card-image">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="badge badge-category">' + escapeHtml(movie.category) + '</span>' +
          '<span class="badge badge-duration">' + escapeHtml(movie.year) + '</span>' +
          '<span class="play-hover">▶</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>' +
          '<p class="card-desc">' + escapeHtml(movie.summary) + '</p>' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(movie.views) + ' 观看</span>' +
            '<span class="rating">★ ' + escapeHtml(movie.rating) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  function run(query) {
    var q = normalize(query);
    var matched = movies.filter(function (movie) {
      var text = normalize(movie.title + ' ' + movie.summary + ' ' + movie.category + ' ' + movie.type + ' ' + movie.year + ' ' + movie.tags.join(' '));
      return q && text.indexOf(q) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = q ? '搜索结果：' + query : '搜索影片';
    }

    if (!results) {
      return;
    }

    if (matched.length) {
      results.innerHTML = matched.map(card).join('');
      if (empty) {
        empty.hidden = true;
      }
    } else {
      results.innerHTML = '';
      if (empty) {
        empty.hidden = false;
      }
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  if (input) {
    input.value = initial;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      run(input ? input.value : '');
      var url = new URL(window.location.href);
      url.searchParams.set('q', input ? input.value : '');
      window.history.replaceState({}, '', url.toString());
    });
  }

  run(initial);
})();
