(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const filterYear = document.querySelector('[data-filter-year]');
    const filterType = document.querySelector('[data-filter-type]');
    const resetButton = document.querySelector('[data-filter-reset]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-filter-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        const q = normalize(filterInput ? filterInput.value : '');
        const year = normalize(filterYear ? filterYear.value : '');
        const type = normalize(filterType ? filterType.value : '');
        let visibleCount = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            const cardYear = normalize(card.dataset.year);
            const cardType = normalize(card.dataset.type);
            const matched = (!q || haystack.includes(q)) &&
                (!year || cardYear === year) &&
                (!type || cardType === type);

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    [filterInput, filterYear, filterType].forEach(function (el) {
        if (el) {
            el.addEventListener('input', applyFilter);
            el.addEventListener('change', applyFilter);
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (filterInput) {
                filterInput.value = '';
            }
            if (filterYear) {
                filterYear.value = '';
            }
            if (filterType) {
                filterType.value = '';
            }
            applyFilter();
        });
    }
})();
