/* =========================================================
   AURORA GRAND RESORT - MAIN FRONTEND JS (ES6)
   Premium Effects, Animations & Interactions
   ========================================================= */
'use strict';

/* ---------- DEMO SPLASH GATE (index.html only) ---------- */
const DemoGate = (() => {
    const init = () => {
        const gate = document.querySelector('.demo-gate');
        if (!gate) return; // hanya halaman yang punya elemen .demo-gate

        const close = () => {
            gate.classList.add('done');
            document.body.style.overflow = '';
        };

        const btnWebsite = gate.querySelector('[data-gate-website]');
        const btnAdmin = gate.querySelector('[data-gate-admin]');

        if (btnWebsite) {
            btnWebsite.addEventListener('click', (e) => {
                e.preventDefault();
                close();
            });
        }

        if (btnAdmin) {
            btnAdmin.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = btnAdmin.getAttribute('href');
            });
        }

        // Cegah scroll saat gate masih tampil
        document.body.style.overflow = 'hidden';
    };
    return { init };
})();

/* ---------- PAGE LOADING SCREEN ---------- */
const LoadingScreen = (() => {
    const init = () => {
        const loader = document.querySelector('.loading-screen');
        if (!loader) return;
        window.addEventListener('load', () => {
            setTimeout(() => loader.classList.add('done'), 900);
        });
        // Fallback: hide after max 3.5s even if load event is slow
        setTimeout(() => loader.classList.add('done'), 3500);
    };
    return { init };
})();

/* ---------- ANIMATED CURSOR ---------- */
const CustomCursor = (() => {
    let dot, ring, mx = 0, my = 0, rx = 0, ry = 0;

    const init = () => {
        dot = document.querySelector('.cursor-dot');
        ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        });

        const loop = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        };
        loop();

        // Hover state on interactive elements
        const interactive = 'a, button, .btn, input, textarea, select, .g-item, .tilt-card, .mega-item';
        document.querySelectorAll(interactive).forEach((el) => {
            el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
        });
    };
    return { init };
})();

/* ---------- SCROLL PROGRESS BAR ---------- */
const ScrollProgress = (() => {
    const init = () => {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;
        const update = () => {
            const scrollTop = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const percent = height > 0 ? (scrollTop / height) * 100 : 0;
            bar.style.width = percent + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    };
    return { init };
})();

/* ---------- NAVBAR ---------- */
const Navbar = (() => {
    const init = () => {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');
        if (!navbar) return;

        // Scrolled state
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('open');
                navMenu.classList.toggle('open');
                if (navOverlay) navOverlay.classList.toggle('open');
            });

            if (navOverlay) {
                navOverlay.addEventListener('click', () => {
                    navToggle.classList.remove('open');
                    navMenu.classList.remove('open');
                    navOverlay.classList.remove('open');
                });
            }

            // Mobile mega menu toggle
            document.querySelectorAll('.has-mega > .mega-trigger').forEach((trigger) => {
                trigger.addEventListener('click', (e) => {
                    if (window.innerWidth <= 1024) {
                        e.preventDefault();
                        trigger.parentElement.classList.toggle('open');
                    }
                });
            });
        }
    };
    return { init };
})();

/* ---------- THEME TOGGLE (DARK MODE) ---------- */
const ThemeManager = (() => {
    const STORAGE_KEY = 'agr-theme';

    const init = () => {
        const toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        // Load saved theme
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            if (current === 'light') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem(STORAGE_KEY, 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem(STORAGE_KEY, 'light');
            }
        });
    };
    return { init };
})();

/* ---------- SCROLL REVEAL ---------- */
const ScrollReveal = (() => {
    let observer;

    const init = () => {
        const items = document.querySelectorAll('.reveal');
        if (!items.length) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        items.forEach((item) => observer.observe(item));
    };
    return { init };
})();

/* ---------- TEXT REVEAL ---------- */
const TextReveal = (() => {
    const init = () => {
        document.querySelectorAll('.text-reveal').forEach((el) => {
            const text = el.textContent.trim();
            el.innerHTML = text.split('').map((ch) =>
                `<span style="transition-delay:${Math.random() * 0.3}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
            ).join('');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.text-reveal').forEach((el) => observer.observe(el));
    };
    return { init };
})();

/* ---------- NUMBER COUNTER ---------- */
const Counter = (() => {
    const init = () => {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const animate = (counter) => {
            const target = parseInt(counter.dataset.target, 10) || 0;
            const duration = 2000;
            const start = performance.now();
            const suffix = counter.dataset.suffix || '';

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(eased * target).toLocaleString('id-ID') + suffix;
                if (progress < 1) requestAnimationFrame(tick);
                else counter.textContent = target.toLocaleString('id-ID') + suffix;
            };
            requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((c) => observer.observe(c));
    };
    return { init };
})();

/* ---------- TYPING EFFECT ---------- */
const TypingEffect = (() => {
    const init = () => {
        document.querySelectorAll('[data-typed]').forEach((el) => {
            const phrases = JSON.parse(el.dataset.typed);
            let phraseIndex = 0;
            let charIndex = 0;
            let deleting = false;

            const type = () => {
                const current = phrases[phraseIndex];
                if (!deleting) {
                    el.textContent = current.substring(0, charIndex + 1);
                    charIndex++;
                    if (charIndex === current.length) {
                        deleting = true;
                        setTimeout(type, 2000);
                        return;
                    }
                    setTimeout(type, 60);
                } else {
                    el.textContent = current.substring(0, charIndex - 1);
                    charIndex--;
                    if (charIndex === 0) {
                        deleting = false;
                        phraseIndex = (phraseIndex + 1) % phrases.length;
                    }
                    setTimeout(type, 30);
                }
            };
            setTimeout(type, 800);
        });
    };
    return { init };
})();

/* ---------- TESTIMONIAL SLIDER ---------- */
const TestimonialSlider = (() => {
    const init = () => {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        const track = slider.querySelector('.testimonial-track');
        const slides = slider.querySelectorAll('.testimonial-slide');
        const dotsWrap = slider.querySelector('.testimonial-dots');
        if (!slides.length) return;

        let current = 0;
        let autoPlay;

        // Create dots
        if (dotsWrap) {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 't-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            });
        }

        const goTo = (index) => {
            current = (index + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            if (dotsWrap) {
                dotsWrap.querySelectorAll('.t-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === current);
                });
            }
        };

        const next = () => goTo(current + 1);
        const prev = () => goTo(current - 1);

        slider.querySelector('.t-next')?.addEventListener('click', () => { next(); restart(); });
        slider.querySelector('.t-prev')?.addEventListener('click', () => { prev(); restart(); });

        const start = () => {
            autoPlay = setInterval(next, 6000);
        };
        const restart = () => {
            clearInterval(autoPlay);
            start();
        };

        // Swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? next() : prev();
            }
        }, { passive: true });

        start();
    };
    return { init };
})();

/* ---------- RIPPLE EFFECT ---------- */
const RippleEffect = (() => {
    const init = () => {
        document.querySelectorAll('.btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                ripple.className = 'ripple';
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 650);
            });
        });
    };
    return { init };
})();

/* ---------- MAGNETIC BUTTONS ---------- */
const MagneticButtons = (() => {
    const init = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.querySelectorAll('.magnetic').forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    };
    return { init };
})();

/* ---------- CARD TILT ---------- */
const CardTilt = (() => {
    const init = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.querySelectorAll('.tilt-card').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(1000px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    };
    return { init };
})();

/* ---------- MOUSE PARALLAX ---------- */
const MouseParallax = (() => {
    const init = () => {
        document.querySelectorAll('[data-parallax-speed]').forEach((el) => {
            const speed = parseFloat(el.dataset.parallaxSpeed) || 0.2;
            el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            window.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * speed * 40;
                const y = (e.clientY / window.innerHeight - 0.5) * speed * 40;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    };
    return { init };
})();

/* ---------- GALLERY FILTER + LIGHTBOX ---------- */
const Gallery = (() => {
    let items = [];
    let currentIndex = 0;

    const init = () => {
        const filterBtns = document.querySelectorAll('.gallery-filter .filter-btn');
        const gItems = document.querySelectorAll('.g-item');
        items = [...gItems];

        // Filter
        filterBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                filterBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                gItems.forEach((item) => {
                    const cat = item.dataset.category;
                    if (filter === 'all' || cat === filter) {
                        item.style.display = '';
                        setTimeout(() => item.classList.add('reveal', 'visible'), 10);
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const lbImg = lightbox.querySelector('img');
        const lbCaption = lightbox.querySelector('.lb-caption');

        const openLightbox = (index) => {
            currentIndex = index;
            const item = items[index];
            if (!item) return;
            const img = item.querySelector('img');
            lbImg.src = img.src;
            lbCaption.textContent = img.alt || '';
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        };

        gItems.forEach((item, i) => {
            item.addEventListener('click', () => openLightbox(i));
        });

        lightbox.querySelector('.lb-close')?.addEventListener('click', closeLightbox);
        lightbox.querySelector('.lb-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox((currentIndex - 1 + items.length) % items.length);
        });
        lightbox.querySelector('.lb-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox((currentIndex + 1) % items.length);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') openLightbox((currentIndex - 1 + items.length) % items.length);
            if (e.key === 'ArrowRight') openLightbox((currentIndex + 1) % items.length);
        });
    };
    return { init };
})();

/* ---------- FAQ ACCORDION ---------- */
const FAQ = (() => {
    const init = () => {
        document.querySelectorAll('.faq-item').forEach((item) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) return;

            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all
                document.querySelectorAll('.faq-item.open').forEach((other) => {
                    other.classList.remove('open');
                    other.querySelector('.faq-answer').style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    };
    return { init };
})();

/* ---------- PAGE TRANSITION ---------- */
const PageTransition = (() => {
    const init = () => {
        // Only enable if pref not reduced
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        document.querySelectorAll('a[data-page-link]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('http') || href.startsWith('#')) return;
                e.preventDefault();

                const transition = document.querySelector('.page-transition');
                if (transition) {
                    transition.classList.add('active');
                    setTimeout(() => { window.location.href = href; }, 450);
                } else {
                    window.location.href = href;
                }
            });
        });
    };
    return { init };
})();

/* ---------- NAVBAR ACTIVE LINK ---------- */
const ActiveNav = (() => {
    const init = () => {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach((link) => {
            const href = link.getAttribute('href');
            if (href === page) link.classList.add('active');
        });
    };
    return { init };
})();

/* ---------- INIT ALL ---------- */
document.addEventListener('DOMContentLoaded', () => {
    DemoGate.init();
    LoadingScreen.init();
    CustomCursor.init();
    ScrollProgress.init();
    Navbar.init();
    ThemeManager.init();
    ScrollReveal.init();
    TextReveal.init();
    Counter.init();
    TypingEffect.init();
    TestimonialSlider.init();
    RippleEffect.init();
    MagneticButtons.init();
    CardTilt.init();
    MouseParallax.init();
    Gallery.init();
    FAQ.init();
    PageTransition.init();
    ActiveNav.init();
});