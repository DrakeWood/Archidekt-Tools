// ==UserScript==
// @name         Archidekt Deck Menu Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Clone the deck list from the profile dropdown into its own menu. Expand the height and width as well.
// @author       DrakeWood
// @license      GPL-3.0
// @icon         https://archidekt.com/favicon.ico
// @homepage     https://github.com/DrakeWood/Archidekt-Tools
// @supportURL   https://github.com/DrakeWood/Archidekt-Tools/issues
// @updateURL    https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/deckDropdown.js
// @downloadURL  https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/deckDropdown.js
// @match        https://archidekt.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let hasClickedOnce = false;

    // Initialize the button and menu styling
    function init() {
        createMenuButton();
        addStyles();
    }

    // Create the new dropdown button
    function createMenuButton() {
        const toolbar = document.querySelector('.globalToolbar_desktopOptions____6Sw');
        if (toolbar && !document.querySelector('.custom-menu-button')) {
            const newButton = document.createElement('button');
            newButton.textContent = 'My Decks';
            newButton.classList.add('custom-menu-button');
            toolbar.appendChild(newButton);

            newButton.addEventListener('click', () => {
                hasClickedOnce ? toggleClonedMenu(newButton) : triggerAccountDropdownAndCloneMenu(newButton);
                hasClickedOnce = true; // Set to true after the first click
            });
        }
    }

    // Trigger the dropdown and clone the menu
    async function triggerAccountDropdownAndCloneMenu(button) {
        const dropdownTrigger = document.querySelector('.accountDropdown_dropdownTrigger__s7J5O');
        const originalMenu = document.querySelector('.accountDropdown_dropdownMenu__33gJI');

        if (dropdownTrigger && originalMenu) {
            dropdownTrigger.focus();
            originalMenu.style.display = 'none';
            dropdownTrigger.click();
            await new Promise(resolve => setTimeout(resolve, 500));

            const dropdownMenu = document.querySelector('.accountDropdown_deckList__xlqcq');
            if (dropdownMenu) {
                const clonedMenu = dropdownMenu.cloneNode(true);
                clonedMenu.classList.add('cloned-menu');
                button.appendChild(clonedMenu);
                clonedMenu.style.display = 'block';
                dropdownTrigger.click(); // Hide original menu again
                originalMenu.style.display = '';
            }
        }
    }

    // Toggle visibility of the cloned menu
    function toggleClonedMenu(button) {
        const clonedMenu = button.querySelector('.cloned-menu');
        clonedMenu.style.display = clonedMenu.style.display === 'none' ? 'block' : 'none';
    }

    // Add custom CSS styles
    function addStyles() {
        GM_addStyle(`
            .custom-menu-button {
                background-color: #007bff;
                color: white;
                padding: 10px;
                border: none;
                cursor: pointer;
                position: relative;
            }
            .custom-menu-button:hover {
                background-color: transparent;
            }
            .cloned-menu {
                display: none;
                position: absolute;
                background-color: var(--alt-background) !important;
                color: #e3e3e3 !important;
                width: 300px !important;
                max-height: 900px !important;
                border: 1px solid #ccc;
                z-index: 1000;
                top: 100%;
                left: 0;
            }
            .cloned-menu:hover {
            width: 300px !important;
            background-color: var(--alt-background) !important;
            color: #e3e3e3 !important;
        }
            .accountDropdown_deckList__xlqcq {
                max-height: 515px;
            }
            .accountDropdown_dropdownMenu__33gJI {
                width: 300px;
                left: -150px;
            }
        `);
    }

    // MutationObserver for dynamic content
    const observer = new MutationObserver(() => {
        createMenuButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initialize on page load
    window.addEventListener('load', init);
})();
