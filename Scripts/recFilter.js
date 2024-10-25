// ==UserScript==
// @name         Archidekt EDHREC Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Adds 2 toggles for deck recommendations with customizable colors and an on/off toggle.
//               - Hide Unowned: Removes cards not in your collection.
//               - Hide already in Deck: Removes cards already in the deck list.
// @author       DrakeWood
// @license      GPL-3.0
// @icon         https://archidekt.com/favicon.ico
// @homepage     https://github.com/DrakeWood/Archidekt-Tools
// @supportURL   https://github.com/DrakeWood/Archidekt-Tools/issues
// @updateURL    https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/recFilter.js
// @downloadURL  https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/recFilter.js
// @match        https://archidekt.com/*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    // Load user settings or defaults
    const settings = {
        hideUnownedColorActive: GM_getValue('hideUnownedColorActive', '#00448e'),
        hideUnownedColorInactive: GM_getValue('hideUnownedColorInactive', '#007bff'),
        hideInDeckColorActive: GM_getValue('hideInDeckColorActive', '#ad1221'),
        hideInDeckColorInactive: GM_getValue('hideInDeckColorInactive', '#dc3545'),
    };

    // Function to open settings prompt
    function openSettings() {
		alert('Enter hex code values for button colors. (https://htmlcolorcodes.com)');
        settings.hideUnownedColorInactive = prompt('Set Hide Unowned (Inactive) color:', settings.hideUnownedColorInactive) || settings.hideUnownedColorInactive;
        settings.hideUnownedColorActive = prompt('Set Hide Unowned (Active) color:', settings.hideUnownedColorActive) || settings.hideUnownedColorActive;
        settings.hideInDeckColorInactive = prompt('Set Hide in Deck (Inactive) color:', settings.hideInDeckColorInactive) || settings.hideInDeckColorInactive;
        settings.hideInDeckColorActive = prompt('Set Hide in Deck (Active) color:', settings.hideInDeckColorActive) || settings.hideInDeckColorActive;

        // Save settings
        GM_setValue('hideUnownedColorActive', settings.hideUnownedColorActive);
        GM_setValue('hideUnownedColorInactive', settings.hideUnownedColorInactive);
        GM_setValue('hideInDeckColorActive', settings.hideInDeckColorActive);
        GM_setValue('hideInDeckColorInactive', settings.hideInDeckColorInactive);

        alert('Settings saved! Please refresh the page.');
    }

    // Register the settings menu command in Tampermonkey
    GM_registerMenuCommand('Customize Button Colors', openSettings);

    // Create a styled button element
    function createButton(text, color) {
        const button = document.createElement('button');
        button.textContent = text;
        Object.assign(button.style, {
            margin: '10px',
            padding: '5px 10px',
            cursor: 'pointer',
            backgroundColor: color,
            color: 'white',
            border: 'none',
            borderRadius: '4px'
        });
        return button;
    }

    // Function to update card visibility based on active filters
    function updateCardVisibility(shouldHideUnowned, shouldHideInDeck) {
        document.querySelectorAll('.searchedCard_card__FCDQJ').forEach(card => {
            const title = card.querySelector('.cornerOwned_container___Lab0')?.getAttribute('title')?.trim();
            const quantity = parseInt(card.querySelector('.searchedCard_quantity__CAZ83')?.textContent.trim(), 10) || 0;
            const inDeck = quantity > 0 || card.querySelector(".searchedCard_hasOtherPrintingQuantity__GUqNR");

            const hideCard = (shouldHideUnowned && (!title || (title !== "Owns exact printing" && title !== "Owns other printing")))
                            || (shouldHideInDeck && inDeck);

            card.style.display = hideCard ? 'none' : '';
        });
    }

    // Initialize filter buttons and append to toolbar
    function createButtons() {
        const hideUnownedButton = createButton('Hide Unowned', settings.hideUnownedColorInactive);
        const hideInDeckButton = createButton('Hide already in Deck', settings.hideInDeckColorInactive);
        const formElement = document.querySelector("#global-search-panel .searchV2_tabLine__NVl5w");

        if (formElement) {
            formElement.append(hideUnownedButton, hideInDeckButton);

            hideUnownedButton.addEventListener('click', () => {
                const active = hideUnownedButton.classList.toggle('active');
                hideUnownedButton.style.backgroundColor = active ? settings.hideUnownedColorActive : settings.hideUnownedColorInactive;
                updateCardVisibility(active, hideInDeckButton.classList.contains('active'));
            });

            hideInDeckButton.addEventListener('click', () => {
                const active = hideInDeckButton.classList.toggle('active');
                hideInDeckButton.style.backgroundColor = active ? settings.hideInDeckColorActive : settings.hideInDeckColorInactive;
                updateCardVisibility(hideUnownedButton.classList.contains('active'), active);
            });
        }
    }

    // Observe dynamic content and create buttons once loaded
    new MutationObserver((_, observer) => {
        if (document.querySelector(".searchV2_lockButton__dHWB_")) {
            createButtons();
            observer.disconnect();
        }
    }).observe(document.body, { childList: true, subtree: true });
})();
