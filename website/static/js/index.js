/* eslint-disable*/
"use strict";

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
}

function bodyOrHtml() {
    if ("scrollingElement" in document) {
        return document.scrollingElement;
    }
    // Fallback for legacy browsers
    return document.documentElement;
}

function clearBodyClass() {
    document.body.classList.remove("is-top");
    document.body.classList.remove("is-over-main");
    document.body.classList.remove("is-bottom-of-main");
}

/**
 * TODO: IT IS HARD CODE VALUE
 */
var HeaderHeight = 52;

function scrollHandler() {
    var currentTopPosition = bodyOrHtml().scrollTop;
    if (0 <= currentTopPosition && currentTopPosition <= HeaderHeight) {
        clearBodyClass();
        document.body.classList.add("is-top");
    } else if (HeaderHeight < currentTopPosition && currentTopPosition <= 320) {
        clearBodyClass();
        document.body.classList.add("is-over-main");
    } else {
        clearBodyClass();
        document.body.classList.add("is-bottom-of-main");
    }
}

function onLoad() {
    scrollHandler();

    var yarnButton = document.querySelector(".showYarnButton");
    var npmButton = document.querySelector(".showNpmButton");
    var getStartedSection = document.querySelector(".getStartedSection");

    npmButton.addEventListener("click", function(event) {
        event.preventDefault();
        npmButton.classList.add("active");
        yarnButton.classList.remove("active");
        getStartedSection.classList.add("getStartedSection--npm");
    });
    yarnButton.addEventListener("click", function(event) {
        event.preventDefault();
        yarnButton.classList.add("active");
        npmButton.classList.remove("active");
        getStartedSection.classList.remove("getStartedSection--npm");
    });
}

document.addEventListener("DOMContentLoaded", scrollHandler);
document.addEventListener("load", scrollHandler);
window.addEventListener("scroll", debounce(scrollHandler, 16));
