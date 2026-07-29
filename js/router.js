/* ==================================================
   Clean URL Router for GitHub Pages
   Removes .html from URLs using History API
   ================================================== */
(function() {
    'use strict';

    // Route map: clean URL -> actual file
    const routes = {};
    
    // Automatically discover pages: all links with .html get mapped
    function buildRoutes() {
        document.querySelectorAll('a[href]').forEach(function(link) {
            var href = link.getAttribute('href');
            if (!href) return;
            // Map .html files to clean URLs
            if (href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
                var clean = href.slice(0, -5); // Remove .html
                routes[clean] = href;
                // Also map with path if applicable
                if (clean.indexOf('/') > -1) {
                    var parts = clean.split('/');
                    var last = parts[parts.length - 1];
                    if (last) {
                        routes[last] = href;
                    }
                }
            }
        });
        // Add known routes
        routes[''] = 'index.html';
        routes['index'] = 'index.html';
    }

    // Get current clean page name
    function getCurrentPage() {
        var path = window.location.pathname;
        // Remove trailing slash
        if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
        var parts = path.split('/').filter(Boolean);
        var last = parts[parts.length - 1] || 'index';
        if (last.endsWith('.html')) last = last.slice(0, -5);
        return last;
    }

    // Navigate to page with clean URL
    function navigateTo(page, pushState) {
        if (pushState === undefined) pushState = true;
        
        // Get full path
        var currentPath = window.location.pathname;
        var basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        
        // If the page has a path prefix (e.g., "admin/index"), use routes mapping
        var file = routes[page];
        if (!file) {
            // Try direct .html
            file = page + '.html';
        }
        
        var cleanUrl = basePath + page;
        
        // Fetch the page content
        fetch(file)
            .then(function(res) {
                if (!res.ok) throw new Error('Page not found: ' + file);
                return res.text();
            })
            .then(function(html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                
                // Extract new head and body
                var newHeadContent = doc.head.innerHTML;
                var newBodyContent = doc.body.innerHTML;
                var newTitle = doc.title;
                
                // Update page
                document.head.innerHTML = newHeadContent;
                document.body.innerHTML = newBodyContent;
                document.title = newTitle;
                
                if (pushState) {
                    window.history.pushState({ page: page }, newTitle, cleanUrl);
                }
                
                // Reinitialize after content load
                if (typeof reinitializeApp === 'function') {
                    reinitializeApp();
                } else if (typeof initAll === 'function') {
                    initAll();
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            })
            .catch(function(err) {
                console.warn('Router fetch failed:', err);
                // Fallback: normal navigation (will show .html but works)
                if (pushState) {
                    window.location.href = file;
                }
            });
    }

    // Handle back/forward
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            navigateTo(e.state.page, false);
        } else {
            var page = getCurrentPage();
            if (page && page !== 'index' && routes[page]) {
                navigateTo(page, false);
            }
        }
    });

    // Intercept all link clicks
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;
        
        var href = link.getAttribute('href');
        if (!href) return;
        
        // Skip external, anchors, special protocols
        if (href.startsWith('http') || href.startsWith('#') || 
            href.startsWith('javascript:') || href.startsWith('mailto:') || 
            href.startsWith('tel:') || href.startsWith('//')) return;
        if (link.target === '_blank') return;
        
        // Get clean page name
        var page = href;
        if (page.endsWith('.html')) page = page.slice(0, -5);
        
        // Check if it can be routed
        if (routes[page] || page.endsWith('.html') === false) {
            e.preventDefault();
            navigateTo(page);
        }
    });

    // Handle initial page load with clean URL
    function init() {
        buildRoutes();
        
        var currentPage = getCurrentPage();
        
        // If URL is clean (no .html and not root), load via router
        if (currentPage && currentPage !== 'index') {
            var path = window.location.pathname;
            var hasHtml = path.endsWith('.html');
            var isDirectory = path.endsWith('/') || path === '';
            
            if (!hasHtml && !isDirectory && routes[currentPage]) {
                navigateTo(currentPage, false);
                return;
            }
        }
        
        // Standard init
        if (typeof reinitializeApp === 'function') {
            reinitializeApp();
        } else if (typeof initAll === 'function') {
            initAll();
        } else if (typeof DOMContentLoaded !== 'undefined') {
            // Some sites use DOMContentLoaded listeners
        }
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ Clean URL Router active');
})();