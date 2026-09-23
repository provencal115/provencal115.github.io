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

  var THEME_COLORS = {
    light: "#f3f1ec",
    dark: "#111210"
  };

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function reflectTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeColor) {
      themeColor.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.light);
    }
    if (themeToggle) {
      var nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      themeToggle.setAttribute("aria-label", nextLabel);
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* Storage can be blocked. The theme still applies for this visit. */
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

  var motionQuery = window.matchMedia("(prefers-color-scheme: dark)");
  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function (event) {
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

    var desktopNav = window.matchMedia("(min-width: 1120px)");
    var closeIfDesktop = function (event) {
      if (event.matches) setNav(false);
    };
    if (desktopNav.addEventListener) {
      desktopNav.addEventListener("change", closeIfDesktop);
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

  var presentation = document.getElementById("presentation");
  var presentationVideo = document.getElementById("presentation-video");
  var presentationButton = document.getElementById("watch-presentation");
  var presentationStatus = document.getElementById("presentation-status");
  var presentationPoster = presentation ? presentation.querySelector(".presentation-poster") : null;
  var presentationStage = presentation ? presentation.querySelector(".presentation-stage") : null;

  function youtubeId(url) {
    try {
      var parsed = new URL(url);
      var host = parsed.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        return parsed.pathname.split("/").filter(Boolean)[0] || "";
      }
      if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
        if (parsed.pathname === "/watch") return parsed.searchParams.get("v") || "";
        var parts = parsed.pathname.split("/").filter(Boolean);
        if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") return parts[1] || "";
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function showStatus(message) {
    if (!presentationStatus) return;
    presentationStatus.hidden = false;
    presentationStatus.textContent = message;
  }

  function mountYouTube(url, autoplay) {
    var id = youtubeId(url);
    if (!id || !presentationStage) return false;
    var embed = presentationStage.querySelector(".presentation-embed");
    if (!embed) {
      embed = document.createElement("iframe");
      embed.className = "presentation-embed";
      embed.title = "Isaac Provencal presenting an academic software project";
      embed.setAttribute("allowfullscreen", "");
      embed.setAttribute("allow", "fullscreen; picture-in-picture");
      embed.referrerPolicy = "strict-origin-when-cross-origin";
      presentationStage.appendChild(embed);
    }
    var src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?rel=0";
    if (autoplay) src += "&autoplay=1";
    embed.src = src;
    embed.hidden = false;
    if (presentationVideo) presentationVideo.hidden = true;
    if (presentationPoster) presentationPoster.hidden = true;
    return true;
  }

  function mountFile(url) {
    if (!presentationVideo) return;
    presentationVideo.src = url;
    presentationVideo.hidden = false;
    if (presentationPoster) presentationPoster.hidden = true;
  }

  function sourceExists(url) {
    return fetch(url, { method: "HEAD" }).then(function (response) {
      if (response.ok) return true;
      if (response.status !== 405 && response.status !== 501) return false;
      return fetch(url, { method: "GET", headers: { Range: "bytes=0-1" } }).then(function (ranged) {
        return ranged.ok || ranged.status === 206;
      });
    }).catch(function () {
      return false;
    });
  }

  if (presentation && presentationVideo && presentationButton) {
    var hostedUrl = (presentation.getAttribute("data-hosted-url") || "").trim();
    var localSrc = (presentation.getAttribute("data-video-src") || "").trim();
    var mode = "missing";

    if (hostedUrl && youtubeId(hostedUrl)) {
      if (mountYouTube(hostedUrl, false)) mode = "youtube";
    } else if (hostedUrl) {
      mountFile(hostedUrl);
      mode = "file";
    } else if (localSrc) {
      sourceExists(localSrc).then(function (exists) {
        if (!exists) {
          showStatus("The presentation recording is not published yet.");
          return;
        }
        mountFile(localSrc);
        mode = "file";
      });
    } else {
      showStatus("The presentation recording is not published yet.");
    }

    presentationButton.addEventListener("click", function () {
      presentation.scrollIntoView({ behavior: "smooth", block: "center" });
      if (mode === "youtube") {
        mountYouTube(hostedUrl, true);
        var frame = presentationStage.querySelector(".presentation-embed");
        if (frame) frame.focus();
        return;
      }
      if (mode === "file") {
        presentationVideo.hidden = false;
        var playAttempt = presentationVideo.play();
        if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
        presentationVideo.focus();
      }
    });
  }
})();
