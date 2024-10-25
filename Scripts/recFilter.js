// ==UserScript==
// @name         Hide Cards Based on Ownership
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Hides specific cards based on ownership titles in a card results grid.
// @author       DrakeWood
// @match        https://archidekt.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Function to create and insert the filter buttons
    function createButtons() {
        // Create a button for filtering unowned cards
        const filterUnownedButton = document.createElement('button');
        filterUnownedButton.textContent = 'Filter Unowned';
        filterUnownedButton.style.margin = '10px';
        filterUnownedButton.style.padding = '5px 10px';
        filterUnownedButton.style.cursor = 'pointer';
        filterUnownedButton.style.backgroundColor = '#007bff'; // Bootstrap blue
        filterUnownedButton.style.color = 'white';
        filterUnownedButton.style.border = 'none';
        filterUnownedButton.style.borderRadius = '4px';

        // Create a button for hiding cards in deck
        const filterInDeckButton = document.createElement('button');
        filterInDeckButton.textContent = 'Hide in Deck';
        filterInDeckButton.style.margin = '10px';
        filterInDeckButton.style.padding = '5px 10px';
        filterInDeckButton.style.cursor = 'pointer';
        filterInDeckButton.style.backgroundColor = '#dc3545'; // Bootstrap red
        filterInDeckButton.style.color = 'white';
        filterInDeckButton.style.border = 'none';
        filterInDeckButton.style.borderRadius = '4px';

        // Function to update card visibility based on both filters
        function updateCardVisibility() {
            const cards = document.querySelectorAll('.searchedCard_card__FCDQJ');
            const shouldHideUnowned = filterUnownedButton.classList.contains('active');
            const shouldHideInDeck = filterInDeckButton.classList.contains('active');

            cards.forEach(card => {
                const button = card.querySelector('.searchedCard_cardButton__auumJ');
				const cornerOwned = button.querySelector('.cornerOwned_container___Lab0');
				let title = "";
                    if (cornerOwned) {
                        title = cornerOwned.getAttribute('title')?.trim(); // Get the title attribute
                    }
                const quantityButton = card.querySelector('.searchedCard_quantity__CAZ83');
                const additionalElement = card.querySelector(".searchedCard_hasOtherPrintingQuantity__GUqNR");

                const quantity = quantityButton ? parseInt(quantityButton.textContent.trim(), 10) : 0;

                // Determine if the card should be hidden
                const hideCard = (shouldHideUnowned && (!title ||
                        (title !== "Owns exact printing" && title !== "Owns other printing"))) ||
                (shouldHideInDeck && (quantity > 0 || additionalElement));

                card.style.display = hideCard ? 'none' : ''; // Show or hide card
            });
        }

        // Function to toggle filter for unowned cards
        function toggleCardsVisibility() {
            filterUnownedButton.classList.toggle('active'); // Toggle active class
            filterUnownedButton.style.backgroundColor = filterUnownedButton.classList.contains('active') ? '#0056b3' : '#007bff'; // Change color to indicate status
            updateCardVisibility(); // Update card visibility
        }

        // Function to toggle filter for cards in deck
        function toggleDeckVisibility() {
            filterInDeckButton.classList.toggle('active'); // Toggle active class
            filterInDeckButton.style.backgroundColor = filterInDeckButton.classList.contains('active') ? '#c82333' : '#dc3545'; // Change color to indicate status
            updateCardVisibility(); // Update card visibility
        }

        // Append buttons to the desired location
        const formElement = document.querySelector("#global-search-panel > div.globalOverlayStack_content__nY2ZF.globalOverlayStack_visable__r47VO > div > div.searchV2_tabLine__NVl5w");
        if (formElement) {
            formElement.appendChild(filterUnownedButton);
            formElement.appendChild(filterInDeckButton);
        }

        // Add event listeners to the buttons
        filterUnownedButton.addEventListener('click', toggleCardsVisibility);
        filterInDeckButton.addEventListener('click', toggleDeckVisibility);
    }

    // Wait for the lock button to appear
    const observer = new MutationObserver(() => {
        const lockButton = document.querySelector("#global-search-panel > div.globalOverlayStack_content__nY2ZF.globalOverlayStack_visable__r47VO > div > button.searchV2_lockButton__dHWB_");
        if (lockButton) {
            createButtons(); // Call function to create and insert the filter buttons
            observer.disconnect(); // Stop observing after adding the buttons
        }
    });

    // Start observing the body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
