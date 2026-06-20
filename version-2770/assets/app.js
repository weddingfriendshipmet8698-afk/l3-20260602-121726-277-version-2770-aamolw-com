(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function bindGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".global-search-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='keyword']");
        if (!input || normalize(input.value) === "") {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function bindFiltering() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var textInput = panel.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-result]");
    var query = new URLSearchParams(window.location.search).get("keyword") || "";

    if (textInput && query) {
      textInput.value = query;
    }

    function matches(card) {
      var text = normalize(card.getAttribute("data-search"));
      var typed = normalize(textInput ? textInput.value : "");
      if (typed && text.indexOf(typed) === -1) {
        return false;
      }
      return selects.every(function (select) {
        var key = select.getAttribute("data-filter-select");
        var selected = normalize(select.value);
        if (!selected) {
          return true;
        }
        var cardValue = normalize(card.getAttribute("data-" + key));
        return cardValue.indexOf(selected) !== -1;
      });
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (textInput) {
      textInput.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function bindImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      }, { once: true });
    });
  }

  function launchVideo(streamUrl) {
    var video = document.querySelector(".movie-video");
    var layer = document.querySelector(".player-layer");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;

    function load() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = streamUrl;
        }
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    if (layer) {
      layer.addEventListener("click", load);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        load();
      }
    });
  }

  window.SitePlayer = {
    start: launchVideo
  };

  ready(function () {
    bindMobileNav();
    bindHero();
    bindGlobalSearch();
    bindFiltering();
    bindImages();
  });
})();
