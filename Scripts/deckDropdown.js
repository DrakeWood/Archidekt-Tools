// ==UserScript==
// @name         Clone and Move Dropdown with Trigger Click
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Clone .accountDropdown_deckList__xlqcq to a new menu button in .globalToolbar_desktopOptions____6Sw, and click a trigger before cloning
// @match        https://archidekt.com/*
// @author       DrakeWood
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let hasClickedOnce = false; // To track if the dropdown button has been clicked once

    // Function to create the new button and clone the dropdown menu
    function createMenuButton() {
        // Step 1: Find the toolbar element where the new button will be added
        let toolbar = document.querySelector('.globalToolbar_desktopOptions____6Sw');
        if (toolbar && !document.querySelector('.custom-menu-button')) {
            // Create a new button
            let newButton = document.createElement('button');
            newButton.textContent = 'New Dropdown';
            newButton.classList.add('custom-menu-button');

            // Append the new button to the toolbar
            toolbar.appendChild(newButton);

            // Add click event to the new button
            newButton.addEventListener('click', () => {
                if (!hasClickedOnce) {
                    hasClickedOnce = true;
                    triggerAccountDropdownAndCloneMenu(newButton);
                } else {
                    toggleClonedMenu(newButton); // Toggle the cloned menu on subsequent clicks
                }
            });

            // Add styles for the new button
            addStyles();
        }
    }

    // Function to simulate focus and click on the dropdown trigger and clone the dropdown menu
    async function triggerAccountDropdownAndCloneMenu(button) {
        // Step 1: Find and click the .archidektDropdown_trigger__Wdtom button
        let dropdownTrigger = document.querySelector('.accountDropdown_dropdownTrigger__s7J5O');
        let originalMenu = document.querySelector('.accountDropdown_dropdownMenu__33gJI');

        if (dropdownTrigger && originalMenu) {
            dropdownTrigger.focus(); // Focus the dropdown trigger
            originalMenu.style.display = 'none'; // Hide the original menu
            dropdownTrigger.click(); // Simulate a click

            // Wait for the menu to load
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 2 seconds to allow the menu to load

            let dropdownMenu = document.querySelector('.accountDropdown_deckList__xlqcq');
            if (dropdownMenu) {
                let clonedMenu = dropdownMenu.cloneNode(true); // Clone the dropdown
                clonedMenu.classList.add('cloned-menu'); // Add a class for further control

                // Append the cloned menu to the button
                button.appendChild(clonedMenu);

                // Show the cloned menu
                clonedMenu.style.display = 'block';

                // Unhide the original menu after cloning
                dropdownTrigger.focus(); // Focus the dropdown trigger
                dropdownTrigger.click(); // Simulate a click
                originalMenu.style.display = '';
            }
        }
    }

    // Function to toggle the cloned menu display
    function toggleClonedMenu(button) {
        let clonedMenu = button.querySelector('.cloned-menu');
        if (clonedMenu) {
            if (clonedMenu.style.display === 'none') {
                clonedMenu.style.display = 'block'; // Show menu
            } else {
                clonedMenu.style.display = 'none'; // Hide menu
            }
        }
    }

    // Function to add custom CSS for the new button and dropdown
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-menu-button {
                background-color: #007bff;
                color: white;
                padding: 10px;
                border: none;
                cursor: pointer;
                position: relative;
            }
            .custom-menu-button:hover {
                background-color: #0056b3;
            }
            .cloned-menu {
                display: none;
                position: absolute;
                background-color: white;
                border: 1px solid #ccc;
                padding: 10px;
                width: 200px;
                z-index: 1000;
                top: 100%; /* Position it below the button */
                left: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // MutationObserver to handle dynamic content loading
    const observer = new MutationObserver(() => {
        createMenuButton();
    });

    // Observe changes in the body or specific container if content is loaded dynamically
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial attempt to create the menu button on page load
    window.addEventListener('load', () => {
        createMenuButton();
    });

})();
