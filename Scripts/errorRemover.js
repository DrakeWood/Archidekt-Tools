// ==UserScript==
// @name         Archidekt Error and Duplicate Remover
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a button to fix duplicate cards with errors manually.
// @author       DrakeWood
// @license      GPL-3.0
// @icon         https://archidekt.com/favicon.ico
// @homepage     https://github.com/DrakeWood/Archidekt-Tools
// @supportURL   https://github.com/DrakeWood/Archidekt-Tools/issues
// @updateURL    https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/errorRemover.js
// @downloadURL  https://github.com/DrakeWood/Archidekt-Tools/raw/refs/heads/master/Scripts/errorRemover.js
// @match        https://archidekt.com/*
// ==/UserScript==

(function () {
    'use strict';

    // Utility function to wait for a condition to become true
    function waitForCondition(conditionFn, interval = 100, timeout = 3000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkCondition = () => {
                if (conditionFn()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    //reject(new Error('Timeout waiting for condition'));
                    resolve(); // higher qty card, this lets the error class update. Need to just reduce to 1 before checking.
                } else {
                    setTimeout(checkCondition, interval);
                }
            };

            checkCondition();
        });
    }

    // Function to click the decrease button for the first error card found
    async function handleError() {
        while (true) {
            const errorCard = document.querySelector('.cardOverlays_error__ADDA7');

            if (errorCard) {
                const decreaseButton = errorCard.closest('.deckCardWrapper_container__PGeKO')
                    .querySelector('.imageCard_decreaseButton__Bv3c0');

                if (decreaseButton) {
                    decreaseButton.click();
                    console.log('Clicked the decrease button for a problem card.');

                    try {
                        await waitForCondition(() => !document.contains(errorCard), 100, 5000);
                        console.log('Problem card removed. Moving to the next.');
                    } catch (err) {
                        console.error('Failed to detect problem card removal:', err);
                        break;
                    }
                } else {
                    console.log('No decrease button found.');
                    break;
                }
            } else {
                console.log('No problem card found. Stopping.');
                break;
            }
        }
    }

    // Function to add the "Fix Errors" button if "Errors" button exists
    function addFixButton() {
        const headerRow = document.querySelector('.deckHeader_row__72rDx');
        if (!headerRow) {
            console.log('Header row not found.');
            return;
        }

        const errorsButton = headerRow.querySelector('.legality_illegalMarker__kNJZv');
        if (errorsButton && errorsButton.textContent.trim().startsWith('Errors')) {
            const fixButton = document.createElement('button');
            fixButton.textContent = 'Fix Errors';
            fixButton.style.marginLeft = '10px';
            fixButton.className = 'fixErrorsButton';

            fixButton.addEventListener('click', () => {
                console.log('Fix Errors button clicked.');
                handleError();
            });

            errorsButton.parentElement.appendChild(fixButton);
            console.log('Fix Errors button added.');
        } else {
            console.log('"Errors" button not found or not applicable.');
        }
    }

    // Function to inject custom styles
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fixErrorsButton {
                padding: 0;
                border: none;
                background: transparent;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #f21b3f;
                cursor: pointer; /* Make it look clickable */
            }

            .fixErrorsButton:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
        console.log('Custom styles added.');
    }

    // Add styles and then the "Fix Errors" button
    window.addEventListener('load', () => {
        addCustomStyles();
        addFixButton();
    });
})();
