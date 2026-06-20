import { H as Hls } from './hls-vendor-dru42stk.js';

function initPlayer(stage) {
    const video = stage.querySelector('video');
    const overlay = stage.querySelector('[data-player-overlay]');
    const src = video ? video.dataset.src : '';

    if (!video || !src) {
        return;
    }

    function start() {
        if (overlay) {
            overlay.classList.add('hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.play().catch(function () {});
            return;
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    try {
                        hls.destroy();
                    } catch (error) {}
                    video.src = src;
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = src;
        video.play().catch(function () {});
    }

    stage.addEventListener('click', start, { once: true });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
