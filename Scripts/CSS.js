// ==UserScript==
// @name         Custom CSS for Archidekt
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Apply custom CSS styles for Archidekt
// @author       DrakeWood
// @match        https://archidekt.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .accountDropdown_deckList__xlqcq {
            max-height: 515px;
        }
        .accountDropdown_dropdownMenu__33gJI {
            width: 300px;
            left: -150px;
        }

        .cloned-menu {
            width: 300px !important;
            max-height: 900px;
            background-color: var(--alt-background) !important;
            color: #e3e3e3 !important;
        }

        .cloned-menu:hover {
            width: 300px !important;
            background-color: var(--alt-background) !important;
            color: #e3e3e3 !important;
        }

        .custom-menu-button:hover {
            background-color: transparent;
        }
    `);
})();
