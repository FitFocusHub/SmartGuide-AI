const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC_DIR = path.join(__dirname, 'browser-extension');
const DIST_DIR = path.join(__dirname, 'dist');

const JS_FILES = [
    'background/background.js',
    'chat/chat-ui.js',
    'popup/popup.js'
];

const OBFUSCATION_OPTIONS = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'mangled-shuffled',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    target: 'browser'
};

console.log('SmartGuide AI - Build & Obfuscate');
console.log('Copyright (c) 2026 FitFocusHub. All Rights Reserved.\n');

// Create dist directory
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy non-JS files
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (!entry.name.endsWith('.js')) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Copying non-JS files...');
copyDir(SRC_DIR, DIST_DIR);

// Obfuscate JS files
console.log('\nObfuscating JavaScript files...\n');

for (const file of JS_FILES) {
    const srcPath = path.join(SRC_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    
    if (!fs.existsSync(srcPath)) {
        console.log(`  SKIP: ${file} (not found)`);
        continue;
    }
    
    const code = fs.readFileSync(srcPath, 'utf8');
    
    try {
        const result = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS);
        const obfuscatedCode = result.getObfuscatedCode();
        
        // Ensure dest directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.writeFileSync(destPath, obfuscatedCode);
        console.log(`  OK: ${file} (${code.length} -> ${obfuscatedCode.length} bytes)`);
    } catch (err) {
        console.error(`  ERROR: ${file} - ${err.message}`);
        // Copy original if obfuscation fails
        fs.copyFileSync(srcPath, destPath);
    }
}

console.log('\nBuild complete! Output: dist/browser-extension/');
console.log('\nNOTICE: This software is proprietary. Do not redistribute.');
