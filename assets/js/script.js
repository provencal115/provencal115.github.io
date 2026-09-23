(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var main = document.getElementById("main");
  var footer = document.querySelector(".site-footer");
  var header = document.querySelector(".site-header");
  var desktopQuery = "(min-width: 1200px)";

  var THEME_COLORS = {
    light: "#f4f1eb",
    dark: "#10110f"
  };

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function reflectTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeColor) themeColor.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.light);
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* The theme still applies for this visit. */
    }
  }

  reflectTheme(currentTheme());
  window.requestAnimationFrame(function () {
    root.classList.add("theme-ready");
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      reflectTheme(next);
      storeTheme(next);
    });
  }

  var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  if (schemeQuery && schemeQuery.addEventListener) {
    schemeQuery.addEventListener("change", function (event) {
      var stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (error) {
        stored = "locked";
      }
      if (stored === "light" || stored === "dark") return;
      reflectTheme(event.matches ? "dark" : "light");
    });
  }

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") !== "true";
      setNav(open);
      if (open) {
        var firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    var desktopNav = window.matchMedia(desktopQuery);
    if (desktopNav.addEventListener) {
      desktopNav.addEventListener("change", function (event) {
        if (event.matches) setNav(false);
      });
    }
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Set();
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        var currentId = null;
        sections.forEach(function (section) {
          if (visible.has(section.id)) currentId = section.id;
        });
        navLinks.forEach(function (link) {
          if (currentId && link.getAttribute("href") === "#" + currentId) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!revealItems.length || reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  var presentationVideo = document.getElementById("presentation-video");
  var presentationButton = document.getElementById("watch-presentation");
  var presentationPlay = document.querySelector(".presentation-play");
  var presentationFrame = document.querySelector(".presentation-frame");

  function playPresentation() {
    if (!presentationVideo) return;
    var playAttempt = presentationVideo.play();
    if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
  }

  if (presentationVideo && presentationFrame) {
    presentationVideo.addEventListener("play", function () {
      presentationFrame.classList.add("is-started");
    });
  }

  if (presentationPlay) presentationPlay.addEventListener("click", playPresentation);

  if (presentationVideo && presentationButton) {
    presentationButton.addEventListener("click", function () {
      presentationVideo.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center"
      });
      playPresentation();
    });
  }
})();
