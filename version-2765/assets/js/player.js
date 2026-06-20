
(function () {
  function initPlayer(box) {
    var video = box.querySelector('video[data-hls-src]');
    var overlay = box.querySelector('[data-player-overlay]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');
    var hlsInstance = null;

    function attachSource() {
      if (!source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(initPlayer);
  });
})();
