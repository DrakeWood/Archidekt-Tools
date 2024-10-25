// ==UserScript==
// @name         Archidekt EDHREC Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Adds toggles for hiding unowned cards and cards already in the deck, with customizable colors.
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
    const defaultSettings = {
        hideUnownedColorActive: '#00448e',
        hideUnownedColorInactive: '#007bff',
        hideInDeckColorActive: '#ad1221',
        hideInDeckColorInactive: '#dc3545',
    };

    const settings = {
        hideUnownedColorActive: GM_getValue('hideUnownedColorActive', defaultSettings.hideUnownedColorActive),
        hideUnownedColorInactive: GM_getValue('hideUnownedColorInactive', defaultSettings.hideUnownedColorInactive),
        hideInDeckColorActive: GM_getValue('hideInDeckColorActive', defaultSettings.hideInDeckColorActive),
        hideInDeckColorInactive: GM_getValue('hideInDeckColorInactive', defaultSettings.hideInDeckColorInactive),
    };

    // Function to open settings modal
    function openSettings() {
        const modalHTML = `
            <div id="settingsModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #007bff; padding: 20px; border: 2px solid #ccc; z-index: 10000;">
                <h2>Customize Button Colors</h2>
                <label for="unownedActive">Hide Unowned (Active):</label>
                <input type="text" id="unownedActive" value="${settings.hideUnownedColorActive}" placeholder="#hexcode" /><br><br>
                <label for="unownedInactive">Hide Unowned (Inactive):</label>
                <input type="text" id="unownedInactive" value="${settings.hideUnownedColorInactive}" placeholder="#hexcode" /><br><br>
                <label for="inDeckActive">Hide in Deck (Active):</label>
                <input type="text" id="inDeckActive" value="${settings.hideInDeckColorActive}" placeholder="#hexcode" /><br><br>
                <label for="inDeckInactive">Hide in Deck (Inactive):</label>
                <input type="text" id="inDeckInactive" value="${settings.hideInDeckColorInactive}" placeholder="#hexcode" /><br><br>
                <button id="saveSettings">Save</button>
                <button id="resetDefaults">Reset Defaults</button>
                <button id="closeModal">Close</button>
            </div>
            <div id="modalOverlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 9999;"></div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Save settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            settings.hideUnownedColorActive = document.getElementById('unownedActive').value;
            settings.hideUnownedColorInactive = document.getElementById('unownedInactive').value;
            settings.hideInDeckColorActive = document.getElementById('inDeckActive').value;
            settings.hideInDeckColorInactive = document.getElementById('inDeckInactive').value;

            // Save settings
            GM_setValue('hideUnownedColorActive', settings.hideUnownedColorActive);
            GM_setValue('hideUnownedColorInactive', settings.hideUnownedColorInactive);
            GM_setValue('hideInDeckColorActive', settings.hideInDeckColorActive);
            GM_setValue('hideInDeckColorInactive', settings.hideInDeckColorInactive);

            alert('Settings saved! Please refresh the page.');
            closeModal(modalContainer);
        });

        // Reset defaults
        document.getElementById('resetDefaults').addEventListener('click', () => {
            GM_setValue('hideUnownedColorActive', defaultSettings.hideUnownedColorActive);
            GM_setValue('hideUnownedColorInactive', defaultSettings.hideUnownedColorInactive);
            GM_setValue('hideInDeckColorActive', defaultSettings.hideInDeckColorActive);
            GM_setValue('hideInDeckColorInactive', defaultSettings.hideInDeckColorInactive);
            alert('Defaults reset! Please refresh the page.');
            closeModal(modalContainer);
        });

        // Close modal
        document.getElementById('closeModal').addEventListener('click', () => {
            closeModal(modalContainer);
        });
    }

    // Function to close modal
    function closeModal(modalContainer) {
        modalContainer.remove();
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
