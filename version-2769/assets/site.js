(function () {
    var hero = document.querySelector("[data-hero='true']");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide='true']"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var menuButton = document.querySelector("[data-menu-toggle='true']");
    var mobileNav = document.querySelector("[data-mobile-nav='true']");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var layer = document.querySelector("[data-search-layer='true']");
    var input = document.querySelector("[data-global-search='true']");
    var resultBox = document.querySelector("[data-global-results='true']");
    var openButtons = Array.prototype.slice.call(document.querySelectorAll("[data-open-search='true']"));
    var inlineInput = document.querySelector("[data-open-search-input='true']");
    var closeButton = document.querySelector("[data-close-search='true']");

    var openSearch = function (value) {
        if (!layer) {
            return;
        }
        layer.classList.add("is-open");
        layer.setAttribute("aria-hidden", "false");
        if (input) {
            input.value = value || input.value || "";
            input.focus();
            renderResults(input.value);
        }
    };

    var closeSearch = function () {
        if (!layer) {
            return;
        }
        layer.classList.remove("is-open");
        layer.setAttribute("aria-hidden", "true");
    };

    var renderResults = function (keyword) {
        if (!resultBox || !window.SiteMovies) {
            return;
        }
        var value = (keyword || "").trim().toLowerCase();
        resultBox.innerHTML = "";
        if (!value) {
            resultBox.innerHTML = "<p class=\"movie-meta\">输入关键词开始搜索</p>";
            return;
        }
        var results = window.SiteMovies.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
            return haystack.indexOf(value) !== -1;
        }).slice(0, 36);
        if (!results.length) {
            resultBox.innerHTML = "<p class=\"movie-meta\">未找到匹配影片</p>";
            return;
        }
        resultBox.innerHTML = results.map(function (movie) {
            return [
                "<a class=\"search-result-item\" href=\"" + movie.url + "\">",
                "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\">",
                "<span>",
                "<h3>" + escapeHtml(movie.title) + "</h3>",
                "<p>" + escapeHtml(movie.region + " · " + movie.type + " · " + movie.year) + "</p>",
                "</span>",
                "</a>"
            ].join("");
        }).join("");
    };

    var escapeHtml = function (value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    };

    openButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            openSearch(inlineInput ? inlineInput.value : "");
        });
    });
    if (inlineInput) {
        inlineInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                openSearch(inlineInput.value);
            }
        });
    }
    if (input) {
        input.addEventListener("input", function () {
            renderResults(input.value);
        });
    }
    if (closeButton) {
        closeButton.addEventListener("click", closeSearch);
    }
    if (layer) {
        layer.addEventListener("click", function (event) {
            if (event.target === layer) {
                closeSearch();
            }
        });
    }

    var cardList = document.querySelector("[data-card-list='true']");
    var cardFilter = document.querySelector("[data-card-filter='true']");
    var regionFilter = document.querySelector("[data-card-region='true']");
    var typeFilter = document.querySelector("[data-card-type='true']");
    if (cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
        var applyFilter = function () {
            var keyword = (cardFilter && cardFilter.value ? cardFilter.value : "").trim().toLowerCase();
            var region = regionFilter && regionFilter.value ? regionFilter.value : "";
            var type = typeFilter && typeFilter.value ? typeFilter.value : "";
            cards.forEach(function (card) {
                var haystack = [card.getAttribute("data-title"), card.getAttribute("data-region"), card.getAttribute("data-year"), card.getAttribute("data-genre"), card.getAttribute("data-type")].join(" ").toLowerCase();
                var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var passRegion = !region || (card.getAttribute("data-region") || "").indexOf(region) !== -1;
                var passType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
                card.style.display = passKeyword && passRegion && passType ? "" : "none";
            });
        };
        [cardFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(function (frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector(".play-layer");
        var streamUrl = frame.getAttribute("data-stream");
        var prepared = false;
        var hlsInstance = null;

        var prepare = function () {
            if (prepared || !video || !streamUrl) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        };

        var start = function () {
            prepare();
            if (button) {
                button.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!prepared) {
                    start();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
