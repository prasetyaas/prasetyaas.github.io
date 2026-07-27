/* ==================================================
   PORTOFOLIO PRASETYA - Main JavaScript
   ================================================== */

"use strict";

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initTypingEffect();
    initAnimatedCounter();
    initPricingTabs();
    initPortfolioFilter();
    initSmoothScroll();
    initScrollReveal();
    initBackToTop();
    initContactForm();
    initThemeToggle();
    initActiveNav();
});

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    themeToggle.addEventListener("click", function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// ===== MOBILE NAVIGATION =====
function initMobileNav() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", function () {
        this.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.style.overflow = navMenu.classList.contains("active")
            ? "hidden"
            : "";
    });

    // Close menu on link click
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navToggle.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
        });
    });

    // Close menu on outside click
    document.addEventListener("click", function (e) {
        if (
            !navToggle.contains(e.target) &&
            !navMenu.contains(e.target) &&
            navMenu.classList.contains("active")
        ) {
            navToggle.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const typingElement = document.getElementById("typingText");
    if (!typingElement) return;

    const words = [
        "Developer",
        "AI Enthusiast",
        "Project Manager",
        "IT Consultant"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
}

// ===== ANIMATED COUNTER =====
function initAnimatedCounter() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (!statNumbers.length) return;

    let hasAnimated = false;

    function animateCounters() {
        if (hasAnimated) return;

        const heroSection = document.querySelector(".hero");
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        if (rect.bottom < 0) {
            hasAnimated = true;

            statNumbers.forEach(function (stat) {
                const target = parseInt(stat.getAttribute("data-target"));
                if (isNaN(target)) return;

                let current = 0;
                const increment = Math.ceil(target / 60);
                const duration = 2000;
                const stepTime = Math.floor(duration / 60);

                function updateNumber() {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target + "+";
                        return;
                    }
                    stat.textContent = current;
                    setTimeout(updateNumber, stepTime);
                }

                updateNumber();
            });
        }
    }

    // Check on scroll
    window.addEventListener("scroll", animateCounters);
    // Also check initially
    animateCounters();
}

// ===== PRICING TABS =====
function initPricingTabs() {
    const tabs = document.querySelectorAll(".pricing-tab");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            // Remove active from all tabs
            tabs.forEach(function (t) {
                t.classList.remove("active");
            });

            // Add active to clicked tab
            this.classList.add("active");

            // Hide all pricing grids
            const allGrids = document.querySelectorAll(".pricing-grid");
            allGrids.forEach(function (grid) {
                grid.classList.remove("active");
            });

            // Show the target grid
            const category = this.getAttribute("data-category");
            const targetGrid = document.getElementById(
                "pricing-" + category
            );
            if (targetGrid) {
                targetGrid.classList.add("active");
            }
        });
    });
}

// ===== PORTFOLIO FILTER =====
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    if (!filterBtns.length || !portfolioItems.length) return;

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            // Remove active from all buttons
            filterBtns.forEach(function (b) {
                b.classList.remove("active");
            });

            // Add active to clicked button
            this.classList.add("active");

            const filterValue = this.getAttribute("data-filter");

            portfolioItems.forEach(function (item) {
                if (filterValue === "all") {
                    item.style.display = "block";
                    item.style.animation = "fadeInUp 0.5s ease forwards";
                } else {
                    const category = item.getAttribute("data-category");
                    if (category === filterValue) {
                        item.style.display = "block";
                        item.style.animation = "fadeInUp 0.5s ease forwards";
                    } else {
                        item.style.display = "none";
                    }
                }
            });
        });
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = document.querySelector(".navbar")
                    ? document.querySelector(".navbar").offsetHeight
                    : 70;
                const targetPosition =
                    targetElement.getBoundingClientRect().top +
                    window.pageYOffset -
                    navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                });
            }
        });
    });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        ".about-card, .service-card, .pricing-card, .portfolio-item, .testimonial-card, .section-header, .contact-form, .contact-info"
    );

    if (!revealElements.length) return;

    function checkReveal() {
        revealElements.forEach(function (el) {
            const rect = el.getBoundingClientRect();
            const windowHeight =
                window.innerHeight || document.documentElement.clientHeight;

            if (rect.top < windowHeight - 100) {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }
        });
    }

    // Set initial state
    revealElements.forEach(function (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition =
            "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    });

    // Check on scroll
    window.addEventListener("scroll", checkReveal);
    // Check initially
    setTimeout(checkReveal, 200);
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    window.addEventListener("scroll", function () {
        if (window.pageYOffset > 300) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector(".btn-submit");
        const originalText = submitBtn.innerHTML;

        // Simple validation
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
            showFormMessage("Mohon lengkapi semua field!", "error");
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage("Email tidak valid!", "error");
            return;
        }

        // Get form data
        const service = document.getElementById("service").value;
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("service", service || "Tidak disebutkan");
        formData.append("message", message);

        // Send to Formspree
        submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;

        fetch("https://formspree.io/f/xpqvkbgo", {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
            },
        })
            .then(function (response) {
                if (response.ok) {
                    submitBtn.innerHTML =
                        '<i class="fas fa-check"></i> Terkirim!';
                    submitBtn.style.background =
                        "linear-gradient(135deg, #00ff88, #00cc66)";
                    showFormMessage(
                        "Pesan berhasil dikirim! Saya akan menghubungi Anda segera.",
                        "success"
                    );
                    contactForm.reset();
                } else {
                    throw new Error("Gagal mengirim");
                }
            })
            .catch(function () {
                showFormMessage(
                    "Gagal mengirim pesan. Silakan coba lagi atau hubungi via WhatsApp.",
                    "error"
                );
            })
            .finally(function () {
                setTimeout(function () {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = "";
                    submitBtn.disabled = false;
                }, 3000);
            });
    });
}

// Helper: Validate Email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper: Show Form Message
function showFormMessage(message, type) {
    // Remove existing message
    const existingMsg = document.querySelector(".form-message");
    if (existingMsg) {
        existingMsg.remove();
    }

    const form = document.getElementById("contactForm");
    const msgDiv = document.createElement("div");
    msgDiv.className = "form-message";
    msgDiv.style.cssText =
        "padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; text-align: center;";

    if (type === "success") {
        msgDiv.style.background = "rgba(0, 255, 136, 0.1)";
        msgDiv.style.color = "#00ff88";
        msgDiv.style.border = "1px solid rgba(0, 255, 136, 0.2)";
    } else {
        msgDiv.style.background = "rgba(255, 87, 87, 0.1)";
        msgDiv.style.color = "#ff5757";
        msgDiv.style.border = "1px solid rgba(255, 87, 87, 0.2)";
    }

    msgDiv.textContent = message;
    form.appendChild(msgDiv);

    // Auto remove after 5 seconds
    setTimeout(function () {
        if (msgDiv.parentNode) {
            msgDiv.remove();
        }
    }, 5000);
}

// ===== ACTIVE NAV LINK ON SCROLL =====
function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    function updateActiveLink() {
        let current = "";
        const scrollY = window.pageYOffset + 100;

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (
                scrollY >= sectionTop &&
                scrollY < sectionTop + sectionHeight
            ) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove("active");
            const href = link.getAttribute("href");
            if (href === "#" + current) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink);
    updateActiveLink();
}

// ===== PARALLAX EFFECT ON HERO (Optional Enhancement) =====
window.addEventListener("scroll", function () {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    // Subtle parallax on hero background
    const scrollPosition = window.pageYOffset;
    if (scrollPosition < window.innerHeight) {
        hero.style.backgroundPositionY = scrollPosition * 0.5 + "px";
    }
});