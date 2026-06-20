(function () {
  function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);

    if (!video || !sourceUrl) {
      return;
    }

    var shell = video.closest('.player-shell');
    var overlay = shell ? shell.querySelector('.player-overlay') : null;
    var started = false;
    var instance = null;

    function start() {
      if (started) {
        var replay = video.play();
        if (replay && replay.catch) {
          replay.catch(function () {});
        }
        return;
      }

      started = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(sourceUrl);
        instance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
