//Auto collapse when clicking elsewhere than the dropdown menu.
$(function () { // Same as document.addEventListener("DOMContentLoaded"...
// Same as document.querySelector("#navbarToggle").addEventListener("blur",...
$(".navbar-toggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
        $("#collapsable-nav").collapse('hide');
    }
});

// In Firefox and Safari, the click event doesn't retain the focus
// on the clicked button. Therefore, the blur event will not fire on
// user clicking somewhere else in the page and the blur event handler
// which is set up above will not be called.
// Refer to issue #28 in the repo.
// Solution: force focus on the element that the click event fired on
$(".navbar-toggle").click(function (event) {
    $(event.target).focus();
});
});

//Dynamically loading views
(function(global) {
    var rp = {};

    var homeHtml = "views/home.html";
    var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
    var categoriesSubtitleHtml = "views/categories/subtitle.html";
    var categoriesPanelHtml = "views/categories/panel.html";
    var allMenusUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuSubtitleHtml = "views/menu/subtitle.html";
    var menuItemHtml = "views/menu/item.html";
    var aboutHtml = "views/about.html";
    var awardsHtml = "views/awards.html";

    //function for quick inserting html:
    var insertHtml = function(selector, content) {
        document.querySelector(selector).innerHTML = content;
    };

    //loading gif:
    var showLoader = function(selector) {
        insertHtml(selector, "<div class='text-center'><img src='images/loader.gif-c200'/></div>");
    }

    //function for replacing {{property name}} with property value:
    var insertProperty = function(string, propertyName, propertyValue) {
        var toReplace = "{{" + propertyName + "}}";
        string = string.replace(new RegExp(toReplace, "g"), propertyValue);
        //"g" in RegExp replaces all strings that match.
        return string;
    }

    // Remove the class 'active' from home and switch to Menu button
    var switchActive = function (destination) {
        // Remove 'active' from all buttons
        var buttons = ['#navHome', '#navMenu', '#navAbout', '#navAwards'];
        for (var i = 0; i < buttons.length; i++){
            var classes = document.querySelector(buttons[i]).className;
            classes = classes.replace(new RegExp("active", "g"), "");
            document.querySelector(buttons[i]).className = classes;
        }

        if (destination === 'categories' || destination === 'menu') {
            // Add 'active' to menu button if not already there
            classes = document.querySelector("#navMenu").className;
            if (classes.indexOf("active") == -1) {
                classes += " active";
                document.querySelector("#navMenu").className = classes;
            }
        }
        if (destination === 'about') {
            // Add 'active' to menu button if not already there
            classes = document.querySelector("#navAbout").className;
            if (classes.indexOf("active") == -1) {
                classes += " active";
                document.querySelector("#navAbout").className = classes;
            }
        }
        if (destination === 'awards') {
            // Add 'active' to menu button if not already there
            classes = document.querySelector("#navAwards").className;
            if (classes.indexOf("active") == -1) {
                classes += " active";
                document.querySelector("#navAwards").className = classes;
            }
        }
    };

    //loads /categories/ view
    rp.loadCategories = function () {
        showLoader("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl, showCategoriesHTML /*, true*/);
    }

    //loads the data in /categories/ view with server JSON data:
    var showCategoriesHTML = function (categories) {
        //load the subtitle:
        $ajaxUtils.sendGetRequest(
            categoriesSubtitleHtml,
            function (categoriesSubtitleHTML) {
                $ajaxUtils.sendGetRequest(
                    categoriesPanelHtml,
                    function (categoriesPanelHTML) {
                        var categoriesHTML = buildCategoriesHTML(categories, categoriesSubtitleHTML, categoriesPanelHTML);
                        insertHtml("#main-content", categoriesHTML);
                },
                false);
        },
        false);
        switchActive('categories');
    }
    //construsts /categories/ view's html codes with real data:
    var buildCategoriesHTML = function(categories, categoriesSubtitleHTML, categoriesPanelHTML) {
        var output = categoriesSubtitleHTML;
        output += "<section class='row'>";
        //loop over categories, which is an array of objects parsed from JSON;
        for (var i = 0; i < categories.length; i++) {
            var panel = categoriesPanelHTML;
            var name = categories[i].name;
            var short_name = categories[i].short_name;
            panel = insertProperty(panel, "name", name);
            panel = insertProperty(panel, "short_name", short_name);
            output += panel;
        }
        output += "</section>";
        return output;
    }

    //loads /menu/ view
    rp.loadMenu = function (short_name) {
        showLoader("#main-content");
        $ajaxUtils.sendGetRequest(allMenusUrl + short_name, showMenuHTML);
    }

    //loads the data in /menu/ view with server JSON data:
    var showMenuHTML = function (menu) {
        //load subtitle of menu view:
        $ajaxUtils.sendGetRequest(
            menuSubtitleHtml,
            function (menuSubtitleHTML) {
                //load item snippet
                $ajaxUtils.sendGetRequest(
                    menuItemHtml,
                    function (menuItemHTML) {
                        var menuHTML = buildMenuHTML(menu, menuSubtitleHTML, menuItemHTML);
                        insertHtml("#main-content", menuHTML);
                    },
                    false);
            },
            false);
        switchActive('menu');
    }

    //construsts /menu/ view's html codes with real data:
    var buildMenuHTML = function (menu, menuSubtitleHTML, menuItemHTML) {
        menuSubtitleHTML = insertProperty(menuSubtitleHTML, "name", menu.category.name);
        menuSubtitleHTML = insertProperty(menuSubtitleHTML, "note", menu.category.special_instructions);
        var output = menuSubtitleHTML;
        output += "<section class='row'>";

        //Loop over items:
        var items = menu.menu_items;
        var cat_short = menu.category.short_name;
        for (var i = 0; i < items.length; i++) {
            var item = menuItemHTML;
            item = insertProperty(item, "item_short", items[i].short_name);
            item = insertProperty(item, "cat_short", cat_short);
            item = insertPrice(item, "priceS", items[i].price_small);
            item = insertPortion(item, "portionS", items[i].small_portion_name);
            item = insertPrice(item, "priceL", items[i].price_large);
            item = insertPortion(item, "portionL", items[i].large_portion_name);
            item = insertProperty(item, "name", items[i].name);
            item = insertProperty(item, "description", items[i].description);
            //Add after every 2nd menu-item-tile
            if (i % 2 != 0) {
                item += '<div class="clearfix visible-lg-block visible-md-block"></div>'
            }
            output += item;
        }
        output += '</section>';
        return output;
    }

    //adds '$' to the price if there is a price:
    var insertPrice = function (item, price, value) {
        if (value) {
            value = '$' + value.toFixed(2);
            item = insertProperty(item, price, value);
            return item;
        }
        return insertProperty(item, price, '');
    }

    //appends portion name if exist:
    var insertPortion = function (item, portion, value) {
        if (value) {
            return insertProperty(item, portion, value);
        }
        return insertProperty(item, portion, '');
    }

    rp.loadAbout = function () {
        showLoader("#main-content");
        $ajaxUtils.sendGetRequest(
            aboutHtml,
            function(response){
                document.querySelector("#main-content").innerHTML = response;
            },
            false);
            switchActive('about');
        }

    rp.loadAwards = function () {
        showLoader("#main-content");
        $ajaxUtils.sendGetRequest(
            awardsHtml,
            function(response){
                insertHtml("#main-content", response);
            },
            false);
            switchActive('awards');
}

    //on page loader
    document.addEventListener("DOMContentLoaded", function(event){
        //show home view on first load
        showLoader("#main-content");
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function(response){
                insertHtml("#main-content", response);
            },
            false);
        });

        global.$rp = rp;
    })(window);
