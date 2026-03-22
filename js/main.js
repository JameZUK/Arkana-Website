/* Arkana Website — Main JavaScript */
(function () {
    'use strict';

    // ===== Preloader =====
    function initPreloader() {
        var preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Skip on revisit
        if (sessionStorage.getItem('arkana-visited')) {
            preloader.remove();
            return;
        }

        // Skip if reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            preloader.remove();
            sessionStorage.setItem('arkana-visited', '1');
            return;
        }

        sessionStorage.setItem('arkana-visited', '1');

        setTimeout(function () {
            preloader.classList.add('done');
            setTimeout(function () { preloader.remove(); }, 500);
        }, 1500);
    }

    // ===== Navigation =====
    function initNav() {
        var header = document.getElementById('nav-header');
        var hamburger = document.getElementById('nav-hamburger');
        var links = document.getElementById('nav-links');

        // Scroll → solid background
        var scrollThreshold = window.innerHeight * 0.15;
        function onScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Hamburger toggle
        if (hamburger && links) {
            hamburger.addEventListener('click', function () {
                var open = links.classList.toggle('open');
                hamburger.classList.toggle('open', open);
                hamburger.setAttribute('aria-expanded', String(open));
            });

            // Close on link click
            links.querySelectorAll('.nav-link').forEach(function (link) {
                link.addEventListener('click', function () {
                    links.classList.remove('open');
                    hamburger.classList.remove('open');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Active section tracking
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    navLinks.forEach(function (link) {
                        var href = link.getAttribute('href');
                        if (href === '#' + id) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(function (s) { observer.observe(s); });
    }

    // ===== Hero Typing =====
    function initHeroTyping() {
        // Skip for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Show everything immediately
            document.querySelectorAll('.terminal-line').forEach(function (line) {
                line.classList.add('visible');
                var text = line.getAttribute('data-text') || line.textContent;
                if (line.dataset.type) {
                    var span = document.createElement('span');
                    span.className = 'typed-text';
                    span.textContent = text;
                    // Preserve the original text content
                    var originalText = line.textContent;
                    line.textContent = '';
                    line.appendChild(span);
                }
            });
            var tagline = document.querySelector('.hero-tagline');
            var ctas = document.querySelector('.hero-ctas');
            if (tagline) tagline.classList.add('visible');
            if (ctas) ctas.classList.add('visible');
            return;
        }

        var lines = document.querySelectorAll('.terminal-line[data-type]');
        var lineIndex = 0;
        var preloaderDelay = sessionStorage.getItem('arkana-typing-done') ? 200 : 1800;

        function typeLine(line, callback) {
            var text = line.textContent;
            var speed = parseInt(line.dataset.speed) || 20;
            line.textContent = '';
            line.classList.add('visible', 'typing');

            var span = document.createElement('span');
            span.className = 'typed-text';
            line.appendChild(span);

            var charIndex = 0;

            function typeChar() {
                if (charIndex < text.length) {
                    span.textContent += text[charIndex];
                    charIndex++;
                    requestAnimationFrame(function () {
                        setTimeout(typeChar, speed);
                    });
                } else {
                    line.classList.remove('typing');
                    if (callback) setTimeout(callback, 200);
                }
            }

            typeChar();
        }

        function nextLine() {
            if (lineIndex < lines.length) {
                var line = lines[lineIndex];
                lineIndex++;
                typeLine(line, nextLine);
            } else {
                // Show tagline and CTAs
                var tagline = document.querySelector('.hero-tagline');
                var ctas = document.querySelector('.hero-ctas');
                if (tagline) tagline.classList.add('visible');
                if (ctas) setTimeout(function () { ctas.classList.add('visible'); }, 200);
                sessionStorage.setItem('arkana-typing-done', '1');
            }
        }

        setTimeout(nextLine, preloaderDelay);
    }

    // ===== Scroll Reveals =====
    function initReveal() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        reveals.forEach(function (el) { observer.observe(el); });
    }

    // ===== Stat Counters =====
    function initStatCounters() {
        var counters = document.querySelectorAll('.stat-number[data-target]');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            counters.forEach(function (el) {
                el.textContent = el.dataset.target;
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { observer.observe(el); });
    }

    function animateCounter(el) {
        var target = parseInt(el.dataset.target);
        var duration = 1500;
        var startTime = null;

        function easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var value = Math.floor(easeOut(progress) * target);
            el.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(step);
    }

    // ===== Gallery =====
    function initGallery() {
        var track = document.getElementById('gallery-track');
        var leftBtn = document.querySelector('.gallery-arrow--left');
        var rightBtn = document.querySelector('.gallery-arrow--right');

        if (!track) return;

        var scrollAmount = 340;

        if (leftBtn) {
            leftBtn.addEventListener('click', function () {
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', function () {
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    // ===== Copy Quick Start =====
    function initCopyButton() {
        var btn = document.getElementById('copy-quickstart');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var commands = [
                'git clone https://github.com/JameZUK/Arkana.git',
                'cd Arkana && ./run.sh --build',
                'claude mcp add --scope project arkana -- ./run.sh --stdio',
                'claude'
            ].join('\n');

            navigator.clipboard.writeText(commands).then(function () {
                var label = btn.querySelector('.copy-label');
                btn.classList.add('copied');
                if (label) label.textContent = 'COPIED';
                setTimeout(function () {
                    btn.classList.remove('copied');
                    if (label) label.textContent = 'COPY';
                }, 2000);
            }).catch(function () {
                // Fallback: select text
                var code = document.getElementById('quickstart-code');
                if (code) {
                    var range = document.createRange();
                    range.selectNodeContents(code);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        });
    }

    // ===== Lightbox (demo video + screenshots) =====
    function initLightbox() {
        var lightbox = document.getElementById('demo-lightbox');
        var lbVideo = document.getElementById('demo-lightbox-video');
        var lbInner = lightbox ? lightbox.querySelector('.demo-lightbox-inner') : null;
        var closeBtn = lightbox ? lightbox.querySelector('.demo-lightbox-close') : null;
        var lbImg = null; // created on demand

        if (!lightbox || !lbInner) return;

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lbVideo) { lbVideo.pause(); lbVideo.style.display = 'none'; }
            if (lbImg) lbImg.style.display = 'none';
        }

        function openVideo() {
            if (lbImg) lbImg.style.display = 'none';
            if (lbVideo) {
                lbVideo.style.display = 'block';
                lbVideo.currentTime = 0;
                lbVideo.play();
            }
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function openImage(src, alt) {
            if (lbVideo) lbVideo.style.display = 'none';
            if (!lbImg) {
                lbImg = document.createElement('img');
                lbImg.alt = '';
                lbInner.appendChild(lbImg);
            }
            lbImg.src = src;
            lbImg.alt = alt || '';
            lbImg.style.display = 'block';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        // Demo video frame
        var demoFrame = document.getElementById('demo-frame');
        if (demoFrame) {
            demoFrame.addEventListener('click', function (e) {
                e.preventDefault();
                openVideo();
            });
            demoFrame.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openVideo();
                }
            });
        }

        // All screenshot frames — feature panels + gallery
        document.querySelectorAll('.crt-frame-mini').forEach(function (frame) {
            var img = frame.querySelector('img');
            if (!img) return;
            frame.setAttribute('role', 'button');
            frame.setAttribute('tabindex', '0');
            frame.addEventListener('click', function () {
                openImage(img.src, img.alt);
            });
            frame.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openImage(img.src, img.alt);
                }
            });
        });

        // Close handlers
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    // ===== Init =====
    document.addEventListener('DOMContentLoaded', function () {
        initPreloader();
        initNav();
        initHeroTyping();
        initReveal();
        initStatCounters();
        initGallery();
        initCopyButton();
        initLightbox();
    });
})();
