// ========================== poiyfill ==========================
import "./_polyfills";
import { loadParams } from "../params";
import { initScroll } from "./scroll";
import { initSearchDesktop } from "./search-desktop";
import { initSearchMobile } from "./search-mobile";
import { initTheme } from "./theme";
import { getDom, requiredById } from "./dom";
// ===============================================================

const param = loadParams();

document.addEventListener("DOMContentLoaded", function () {
  // ===================== navbar collapse ======================
  const navCollapseBtn = document.querySelector<HTMLElement>(".navbar__burger");
  navCollapseBtn
    ? navCollapseBtn.addEventListener("click", function (e) {
      var navCollapse = document.querySelector<HTMLElement>(
        ".navbarm__collapse",
      );

      if (navCollapse) {
        var dataOpen = navCollapse.getAttribute("data-open");

        if (dataOpen === "true") {
          navCollapse.setAttribute("data-open", "false");
          navCollapse.style.maxHeight = "0";
          navCollapseBtn.classList.remove("is-active");
        } else {
          navCollapse.setAttribute("data-open", "true");
          navCollapse.style.maxHeight = navCollapse.scrollHeight + "px";
          navCollapseBtn.classList.add("is-active");
        }
      }
    })
    : null;
  // ============================================================

  // ======================== markdown table ====================
  var tables = document.querySelectorAll(".single__contents > table");
  for (let i = 0; i < tables.length; i++) {
    var table = tables[i];
    var wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    table.parentElement?.replaceChild(wrapper, table);
    wrapper.appendChild(table);
  }
  // ============================================================

  // ========================== foot notes ======================
  const { navbar } = getDom();
  var footNoteRefs = document.querySelectorAll<HTMLElement>(".footnote-ref");

  footNoteRefs
    ? footNoteRefs.forEach(function (elem, idx) {
      elem.onmouseenter = function () {
        if (navbar.classList.contains("scrolling")) {
          navbar.classList.remove("scrolling");
        }
      };

      elem.onmouseleave = function () {
        if (!navbar.classList.contains("scrolling")) {
          setTimeout(function () {
            navbar.classList.add("scrolling");
          }, 100);
        }
      };

      elem.onclick = function () {
        if (!navbar.classList.contains("scrolling")) {
          navbar.classList.remove("navbar--show");
          navbar.classList.remove("navbar--hide");
          navbar.classList.add("navbar--hide");
        }
      };
    })
    : null;

  var footNoteBackRefs = document.querySelectorAll<HTMLElement>(
    ".footnote-backref",
  );
  footNoteBackRefs
    ? footNoteBackRefs.forEach(function (elem, idx) {
      elem.onmouseenter = function () {
        if (navbar.classList.contains("scrolling")) {
          navbar.classList.remove("scrolling");
        }
      };

      elem.onmouseleave = function () {
        if (!navbar.classList.contains("scrolling")) {
          setTimeout(function () {
            navbar.classList.add("scrolling");
          }, 100);
        }
      };

      elem.onclick = function () {
        if (!navbar.classList.contains("scrolling")) {
          navbar.classList.remove("navbar--show");
          navbar.classList.remove("navbar--hide");
          navbar.classList.add("navbar--hide");
        }
      };
    })
    : null;
  // ============================================================

  // ============================ tab ============================
  document.querySelectorAll(".tab")
    ? document.querySelectorAll(".tab").forEach(function (elem, idx) {
      var containerId = elem.getAttribute("id");
      var containerElem = elem;
      var tabLinks = elem.querySelectorAll<HTMLElement>(".tab__link");
      var tabContents = elem.querySelectorAll(".tab__content");
      var ids = [];

      tabLinks && tabLinks.length > 0
        ? tabLinks.forEach(function (link, index, self) {
          link.onclick = function (e) {
            for (var i = 0; i < self.length; i++) {
              if (index === parseInt(i, 10)) {
                if (!self[i].classList.contains("active")) {
                  self[i].classList.add("active");
                  tabContents[i].style.display = "block";
                }
              } else {
                self[i].classList.remove("active");
                tabContents[i].style.display = "none";
              }
            }
          };
        })
        : null;
    })
    : null;
  // =============================================================

  // ========================== codetab ==========================
  document.querySelectorAll(".codetab")
    ? document.querySelectorAll(".codetab").forEach(function (elem, idx) {
      var containerId = elem.getAttribute("id");
      var containerElem = elem;
      var codetabLinks = elem.querySelectorAll(".codetab__link");
      var codetabContents = elem.querySelectorAll(".codetab__content");
      var ids = [];

      codetabLinks && codetabLinks.length > 0
        ? codetabLinks.forEach(function (link, index, self) {
          link.onclick = function (e) {
            for (var i = 0; i < self.length; i++) {
              if (index === parseInt(i, 10)) {
                if (!self[i].classList.contains("active")) {
                  self[i].classList.add("active");
                  codetabContents[i].style.display = "block";
                }
              } else {
                self[i].classList.remove("active");
                codetabContents[i].style.display = "none";
              }
            }
          };
        })
        : null;
    })
    : null;
  // =============================================================

  // ========================== expand ==========================
  var expandBtn = document.querySelectorAll<HTMLElement>(".expand__button");

  for (let i = 0; i < expandBtn.length; i++) {
    expandBtn[i].addEventListener("click", function () {
      var content = this.nextElementSibling;
      if (!content) {
        return;
      }
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        this.querySelector("svg").classList.add("expand-icon__right");
        this.querySelector("svg").classList.remove("expand-icon__down");
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        this.querySelector("svg").classList.remove("expand-icon__right");
        this.querySelector("svg").classList.add("expand-icon__down");
      }
    });
  }
  // ============================================================

  // ========================== scroll ==========================
  initScroll(param);
  // ============================================================

  // ======================= theme change =======================
  initTheme(param);
  // ============================================================

  // ========================== search ==========================
  initSearchDesktop(param);
  // ============================================================

  // ====================== mobile search =======================
  initSearchMobile();
  // ============================================================

  // =================== search-result desktop ==================
  // ============================================================
});
