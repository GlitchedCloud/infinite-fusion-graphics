const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const SPRITE_DIR = '.'; // Current directory
// Regex to identify variants: (1-4 digits).(1-4 digits)[a-z]
const VARIANT_REGEX = /^(\d{1,4}\.\d{1,4})[a-z]$/i; 
// ---------------------

/**
 * Validates if a filename matches the variant pattern.
 * @param {string} filename The filename without the extension (e.g., "150.25a")
 * @returns {boolean} True if it is a variant, false otherwise.
 */
function isVariant(filename) {
    return VARIANT_REGEX.test(filename);
}

async function runCleanup() {
    console.log('\n===============================================');
    console.log('Pokemon Fusion Sprite Variant Cleanup Utility');
    console.log('===============================================');

    try {
        await fs.access(SPRITE_DIR);
    } catch (e) {
        console.error(`Error: Directory "${SPRITE_DIR}" not found!`);
        return;
    }

    const startTime = Date.now();
    let variantCount = 0;
    
    console.log(`Scanning and cleaning directory: ${SPRITE_DIR}`);
    console.log('-----------------------------------------------');
    
    try {
        // 1. Asynchronously read all file names.
        const files = await fs.readdir(SPRITE_DIR);
        const deletionPromises = [];

        for (const file of files) {
            // Filter only .png files
            if (path.extname(file).toLowerCase() !== '.png') {
                continue;
            }

            const filenameNoExt = path.parse(file).name;
            
            if (isVariant(filenameNoExt)) {
                variantCount++;
                const fullPath = path.join(SPRITE_DIR, file);
                
                // 2. Add an asynchronous deletion task to the array.
                // We don't need to track success/fail counts, so we just catch errors silently
                // to prevent Promise.all from failing if one file is locked.
                deletionPromises.push(
                    fs.unlink(fullPath).catch(() => {
                        // Suppress error output for maximum speed and simplicity
                    })
                );
            }
        }
        
        // 3. Wait for all concurrent deletion operations to complete.
        await Promise.all(deletionPromises);

    } catch (err) {
        console.error(`An error occurred during file processing: ${err.message}`);
        return;
    }

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\nCleanup Complete!`);
    console.log(`Variant files identified and deleted (or attempted): ${variantCount}`);
    console.log(`Elapsed Time: ${elapsedTime} seconds`);
    console.log('===============================================');
}

runCleanup();