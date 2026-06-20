(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            }, { once: true });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (slides.length < 2) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var list = panel.parentElement.querySelector('[data-filter-list]');
            if (!list) {
                return;
            }
            var input = panel.querySelector('[data-filter-input]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var empty = panel.parentElement.querySelector('[data-empty-state]');

            function apply() {
                var query = normalize(input && input.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.category,
                        card.textContent
                    ].join(' '));
                    var cardType = normalize(card.dataset.type);
                    var cardYear = normalize(card.dataset.year);
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
                    var matchYear = !selectedYear || cardYear === selectedYear;
                    var shouldShow = matchQuery && matchType && matchYear;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector('[data-role="movie-video"]');
        var trigger = document.querySelector('[data-play-trigger]');
        if (!video) {
            return;
        }
        var playlist = video.getAttribute('data-playlist');
        var prepared = false;

        function prepare() {
            if (prepared || !playlist) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playlist;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(playlist);
                hls.attachMedia(video);
                return;
            }
            video.src = playlist;
        }

        function play() {
            prepare();
            if (trigger) {
                trigger.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('hidden');
            }
        });
        video.addEventListener('loadedmetadata', function () {
            video.controls = true;
        });
    }

    onReady(function () {
        setupMenu();
        setupImages();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
