"use strict";

var items = []; // stores values from storage
var input_url = document.getElementById("url");
var form = document.querySelector("form");
var ol = document.querySelector("ol");
var clear = document.getElementById("clear");
var openURL = document.getElementById("openURL");
var addURL = document.getElementById("addURL");
var error = document.getElementById("error");
var count = document.getElementById("count");
var domain;
var li;
var getAllURL = document.getElementById("getAllURL");
var el;
var last_el;

function isValidURL(value) {
  return value.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  )
    ? true
    : false;
}
function scrollItems() {
  el = document.querySelectorAll(".item-url");
  last_el = el[el.length - 1];
  last_el.scrollIntoView();
}
function setItemsToList(url) {
  domain = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .split(/[/?#]/)[0];
  li = document.createElement("li");
  li.className = "item-url";
  li.innerHTML =
    "<span class='small small-danger'>" +
    domain +
    "</span><span class='small'>" +
    url +
    "</span>";
  ol.appendChild(li);
  count.innerHTML = items.length;
  if (items.length && items.length > 4) {
    scrollItems();
  }
}

function getItemsFromStorage() {
  if (localStorage.getItem("openUR") != null) {
    items = JSON.parse(localStorage.getItem("openUR"));
    items.forEach(function(item) {
      setItemsToList(item);
    });
  } else items = [];
}

function checkForDuplicate(value) {
  return items.indexOf(value) > -1 ? false : true;
}
function hideError() {
  error.innerHTML = "";
  error.style.visibility = "hidden";
}
function displayError(text) {
  error.innerHTML = text;
  error.style.visibility = "visible";
}
function storeValue(value) {
  items.push(value);
  localStorage.setItem("openUR", JSON.stringify(items));
  setItemsToList(value);
}
// events
getAllURL.addEventListener("click", function() {
  hideError();
  chrome.windows.getAll({ populate: true }, function(windows) {
    windows.forEach(function(window) {
      window.tabs.forEach(function(tab) {
        if (checkForDuplicate(tab.url)) {
          storeValue(tab.url);
        } else {
          displayError("Web address already in favorite list!");
        }
      });
    });
  });
});
addURL.addEventListener("click", function() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    if (checkForDuplicate(tabs[0].url)) {
      storeValue(tabs[0].url);
    } else {
      displayError("Web address already in favorite list!");
    }
  });
});
// (function(item){
//     window.open(item, '_blank');
// })(item);
openURL.addEventListener("click", function() {
  if (typeof items !== undefined && items.length > 0) {
    items.forEach(function(item) {
      chrome.tabs.create({ url: item });
    });
  } else {
    displayError("Favorite list is empty! Please add some.");
  }
});
form.addEventListener("submit", function(e) {
  e.preventDefault();
  hideError();
  if (typeof Storage === undefined)
    displayMessage("Error: Unable to store data!");
  else if (checkForDuplicate(input_url.value) == false)
    displayError("Website already added to favorite list");
  else if (isValidURL(input_url.value) == false)
    displayError("Please enter a valid webaddress!");
  else storeValue(input_url.value);
  input_url.value = "";
});
clear.addEventListener("click", function(e) {
  e.preventDefault();
  hideError();
  localStorage.clear();
  while (ol.firstChild) {
    ol.removeChild(ol.firstChild);
  }
  items = [];
  count.innerHTML = "";
});

// invoking
hideError();
getItemsFromStorage();
