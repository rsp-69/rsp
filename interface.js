// --- Configuration ---
// Define the location of the color palette data
const PALETTES_FILE = 'pallets.json';
// Define the ID of the HTML element where the palette buttons will be injected
const BUTTONS_CONTAINER_ID = 'palette-selector';

/**
 * Applies the selected color palette to the entire document
 * by setting CSS Custom Properties (CSS Variables).
 *
 * @param {object} palette - The palette object containing color hex codes.
 */
function applyPalette(palette) {
    // We use CSS variables defined on the root element (document.documentElement)
    // The CSS in resume.html must use these variable names.
    document.documentElement.style.setProperty('--color-primary', palette.primary);
    document.documentElement.style.setProperty('--color-secondary', palette.secondary);
    document.documentElement.style.setProperty('--color-text', palette.text);
    document.documentElement.style.setProperty('--color-background', palette.background);

    // Optional: Update a visible indicator
    console.log(`Applied palette: ${palette.name}`);
}

/**
 * Creates and inserts the color palette buttons into the document.
 * @param {Array<object>} palettes - Array of palette objects fetched from JSON.
 */
function createPaletteButtons(palettes) {
    const container = document.getElementById(BUTTONS_CONTAINER_ID);

    if (!container) {
        console.error(`Container element with ID "${BUTTONS_CONTAINER_ID}" not found.`);
        return;
    }

    // Clear any existing content
    container.innerHTML = '';

    palettes.forEach(palette => {
        const button = document.createElement('button');
        button.textContent = palette.name;
        button.className = 'px-4 py-2 m-1 text-sm font-medium rounded-lg transition-colors duration-200 shadow-md';
        
        // Use inline styles for dynamic hover effect to show the primary color
        button.style.backgroundColor = 'white';
        button.style.color = palette.primary;
        button.style.borderColor = palette.primary;
        button.style.borderWidth = '2px';
        
        // Add click event listener to apply the palette
        button.addEventListener('click', () => {
            applyPalette(palette);
        });

        container.appendChild(button);
    });

    // Automatically apply the first palette on load
    if (palettes.length > 0) {
        applyPalette(palettes[0]);
    }
}

/**
 * Main function to fetch the JSON data and initialize the interface.
 */
async function initializeInterface() {
    try {
        // Retry logic with exponential backoff for robustness
        const maxRetries = 3;
        let response;
        for (let i = 0; i < maxRetries; i++) {
            response = await fetch(PALETTES_FILE);
            if (response.ok) break;
            // Wait for 2^i * 100 ms before retrying
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch ${PALETTES_FILE} after ${maxRetries} attempts: ${response.status} ${response.statusText}`);
        }

        const palettes = await response.json();
        createPaletteButtons(palettes);

    } catch (error) {
        console.error('Error loading or processing palettes:', error);
        
        // Display a fallback message to the user if the palette selector failed to load
        const container = document.getElementById(BUTTONS_CONTAINER_ID);
        if(container) {
            container.innerHTML = `<p class="text-red-600 text-sm">Error loading color palettes. Check console for details.</p>`;
        }
    }
}

// Start the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeInterface);
