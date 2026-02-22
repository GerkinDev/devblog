import { ParamGetter } from "../params";
import { getDom, requiredById } from "./dom";

export const initScroll = (param: ParamGetter) => {
  const gttBtn = requiredById<HTMLElement>("gtt");
  gttBtn.style.display = "none";
  gttBtn.addEventListener("click", function () {
    if (window.document.documentMode) {
      document.documentElement.scrollTop = 0;
    } else {
      scrollToTop(250);
    }
  });

  function scrollToTop(scrollDuration: number) {
    var scrollStep = -window.scrollY / (scrollDuration / 15);
    var scrollInterval = setInterval(function () {
      if (window.scrollY != 0) {
        window.scrollBy(0, scrollStep);
      } else clearInterval(scrollInterval);
    }, 15);
  }
  var lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var tocElem = document.querySelector(".toc");
  var tableOfContentsElem = tocElem
    ? tocElem.querySelector("#TableOfContents")
    : null;
  var toggleTocElem = document.getElementById("toggle-toc") as
    | HTMLInputElement
    | null;
  var singleContentsElem = document.querySelector(".single__contents");
  var tocFlexbox = document.querySelector(".toc__flexbox");
  var tocFlexboxOuter = document.querySelector(".toc__flexbox--outer");
  var expandContents = document.querySelectorAll(".expand__content");
  var boxContents = document.querySelectorAll(".box");
  const { navbar } = getDom();
  var notAllowedTitleIds = null;

  var tocFolding = param("tocFolding");
  var tocLevels = param("tocLevels");

  if (tocLevels) {
    tocLevels = tocLevels.toString();
  } else {
    tocLevels = "h1, h2, h3, h4, h5, h6";
  }

  // tab
  singleContentsElem && singleContentsElem.querySelectorAll(".tab")
    ? singleContentsElem.querySelectorAll(".tab").forEach(function (elem) {
      elem.querySelectorAll(tocLevels).forEach(function (element) {
        notAllowedTitleIds = Array.isArray(notAllowedTitleIds)
          ? notAllowedTitleIds.concat(element.getAttribute("id"))
          : [element.getAttribute("id")];
      });
    })
    : null;

  // expand
  expandContents
    ? expandContents.forEach(function (elem) {
      elem.querySelectorAll(tocLevels).forEach(function (element) {
        notAllowedTitleIds = Array.isArray(notAllowedTitleIds)
          ? notAllowedTitleIds.concat(element.getAttribute("id"))
          : [element.getAttribute("id")];
      });
    })
    : null;

  // box
  boxContents
    ? boxContents.forEach(function (elem) {
      elem.querySelectorAll(tocLevels).forEach(function (element) {
        notAllowedTitleIds = Array.isArray(notAllowedTitleIds)
          ? notAllowedTitleIds.concat(element.getAttribute("id"))
          : [element.getAttribute("id")];
      });
    })
    : null;

  window.onscroll = function () {
    gttBtn.style.display = (
        document.body.scrollTop > 250 ||
        document.documentElement.scrollTop > 250
      )
      ? "block"
      : "none";

    var st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) { // scroll down
      if (st < 250) {
        gttBtn.style.display = "none";
      } else {
        gttBtn.style.display = "block";
      }

      if (st < 45) {
        return null;
      }

      if (navbar.classList.contains("scrolling")) {
        if (!navbar.classList.contains("navbar--hide")) {
          navbar.classList.add("navbar--hide");
        } else if (navbar.classList.contains("navbar--show")) {
          navbar.classList.remove("navbar--show");
        }
      }

      if (singleContentsElem) {
        if (singleContentsElem.querySelectorAll(tocLevels).length > 0) {
          singleContentsElem.querySelectorAll(tocLevels).forEach(
            function (elem) {
              if (toggleTocElem && !toggleTocElem.checked) {
                return null;
              }

              if (
                notAllowedTitleIds &&
                notAllowedTitleIds.includes(elem.getAttribute("id"))
              ) {
                return null;
              }

              if (document.documentElement.scrollTop >= elem.offsetTop) {
                if (tableOfContentsElem) {
                  var id = elem.getAttribute("id");
                  tocElem.querySelectorAll("a").forEach(function (elem) {
                    elem.classList.remove("active");
                  });
                  tocElem.querySelector('a[href="#' + id + '"]')
                    ? tocElem.querySelector('a[href="#' + id + '"]').classList
                      .add("active")
                    : null;

                  if (false === tocFolding) {
                  } else {
                    tableOfContentsElem.querySelectorAll("ul")
                      ? tableOfContentsElem.querySelectorAll("ul").forEach(
                        function (rootUl) {
                          rootUl.querySelectorAll("li").forEach(
                            function (liElem) {
                              liElem.querySelectorAll("ul").forEach(
                                function (ulElem) {
                                  ulElem.style.display = "none";
                                },
                              );
                            },
                          );
                        },
                      )
                      : null;
                  }

                  var curElem = tableOfContentsElem.querySelector(
                    "[href='#" + id + "']",
                  );
                  if (curElem && curElem.nextElementSibling) {
                    curElem.nextElementSibling.style.display = "block";
                  }
                  getParents(curElem, "ul")
                    ? getParents(curElem, "ul").forEach(function (elem) {
                      elem.style.display = "block";
                    })
                    : null;
                }
              }
            },
          );
        } else {
          if (tocFlexbox) {
            tocFlexbox.setAttribute("data-position", "");
            if (!tocFlexbox.classList.contains("hide")) {
              tocFlexbox.classList.add("hide");
            }
          }
          if (tocFlexboxOuter) {
            tocFlexboxOuter.setAttribute("data-position", "");
            if (!tocFlexboxOuter.classList.contains("hide")) {
              tocFlexboxOuter.classList.add("hide");
            }
          }
        }
      }
    } else { // scroll up
      if (st < 250) {
        gttBtn.style.display = "none";
      }

      if (navbar.classList.contains("scrolling")) {
        if (navbar.classList.contains("navbar--hide")) {
          navbar.classList.remove("navbar--hide");
        } else if (!navbar.classList.contains("navbar--show")) {
          navbar.classList.add("navbar--show");
        }
      }

      if (singleContentsElem) {
        if (singleContentsElem.querySelectorAll(tocLevels).length > 0) {
          singleContentsElem.querySelectorAll(tocLevels).forEach(
            function (elem) {
              if (toggleTocElem && !toggleTocElem.checked) {
                return null;
              }

              if (
                notAllowedTitleIds &&
                notAllowedTitleIds.includes(elem.getAttribute("id"))
              ) {
                return null;
              }

              if (document.documentElement.scrollTop >= elem.offsetTop) {
                if (tableOfContentsElem) {
                  var id = elem.getAttribute("id");
                  tocElem.querySelectorAll("a").forEach(function (elem) {
                    elem.classList.remove("active");
                  });
                  tocElem.querySelector('a[href="#' + id + '"]')
                    ? tocElem.querySelector('a[href="#' + id + '"]').classList
                      .add("active")
                    : null;

                  if (false === tocFolding) {
                  } else {
                    tableOfContentsElem.querySelectorAll("ul")
                      ? tableOfContentsElem.querySelectorAll("ul").forEach(
                        function (rootUl) {
                          rootUl.querySelectorAll("li").forEach(
                            function (liElem) {
                              liElem.querySelectorAll("ul").forEach(
                                function (ulElem) {
                                  ulElem.style.display = "none";
                                },
                              );
                            },
                          );
                        },
                      )
                      : null;
                  }

                  var curElem = tableOfContentsElem.querySelector(
                    "[href='#" + id + "']",
                  );
                  if (curElem && curElem.nextElementSibling) {
                    curElem.nextElementSibling.style.display = "block";
                  }
                  getParents(curElem, "ul")
                    ? getParents(curElem, "ul").forEach(function (elem) {
                      elem.style.display = "block";
                    })
                    : null;
                }
              }
            },
          );
        } else {
          if (tocFlexbox && !tocFlexbox.classList.contains("hide")) {
            tocFlexbox.classList.add("hide");
          }
          if (tocFlexboxOuter && !tocFlexboxOuter.classList.contains("hide")) {
            tocFlexboxOuter.classList.add("hide");
          }
        }
      }

      if (tableOfContentsElem && document.documentElement.scrollTop < 250) {
        if (false === tocFolding) {
        } else {
          tableOfContentsElem.querySelector("ul")
            ? tableOfContentsElem.querySelector("ul").querySelectorAll("li")
              .forEach(function (liElem) {
                liElem.querySelectorAll("ul").forEach(function (ulElem) {
                  ulElem.style.display = "none";
                });
              })
            : null;
        }
      }
    }
    lastScrollTop = st <= 0 ? 0 : st;
  };
};
