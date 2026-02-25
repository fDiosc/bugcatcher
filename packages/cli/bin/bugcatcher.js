#!/usr/bin/env node
/* eslint-disable */

const inquirer = require('inquirer').default || require('inquirer');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('\x1b[34m%s\x1b[0m', '\nWelcome to BugCatcher! 🐛\n');

    // 1. Dependency Check
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
        console.log('\x1b[31m%s\x1b[0m', '\nCould not find package.json. Please run this inside your project root.');
        process.exit(1);
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const hasDep = (pkg.dependencies && pkg.dependencies['@bugcatcher/react']) ||
        (pkg.devDependencies && pkg.devDependencies['@bugcatcher/react']);

    if (!hasDep) {
        console.log('\x1b[33m%s\x1b[0m', '\n@bugcatcher/react is not installed.');
        console.log('Please run the following command first:\n');
        console.log('\x1b[36m%s\x1b[0m', 'npm install @bugcatcher/react\n');
        console.log('After installing, run npx bugcatcher-init again.');
        process.exit(0);
    }

    const { apiKey } = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiKey',
            message: 'Enter your BugCatcher API Key (e.g. bc_12345):',
            validate: input => input.length > 5 ? true : 'Please enter a valid API Key',
        }
    ]);

    console.log('\nScanning project...');

    // 2. Layout Discovery
    const possiblePaths = [
        path.join(process.cwd(), 'src', 'app', 'layout.tsx'),
        path.join(process.cwd(), 'app', 'layout.tsx'),
        path.join(process.cwd(), 'src', 'app', 'layout.jsx'),
    ];

    let targetPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            targetPath = p;
            break;
        }
    }

    if (!targetPath) {
        console.log('\x1b[33m%s\x1b[0m', '\nCould not automatically find a Next.js App Router layout file.');
        console.log(`Please install the package manually:\n`);
        console.log('\x1b[36m%s\x1b[0m', `1. npm install @bugcatcher/react`);
        console.log('\x1b[36m%s\x1b[0m', `2. Add <BugCatcherWidget apiKey="${apiKey}" /> to your layout.\n`);
        process.exit(0);
    }

    console.log(`Found Next.js layout at ${path.relative(process.cwd(), targetPath)}`);

    let content = fs.readFileSync(targetPath, 'utf8');

    // Check if it's already installed
    if (content.includes('BugCatcherWidget')) {
        console.log('\x1b[33m%s\x1b[0m', '\nBugCatcher is already installed in your layout! Updating API Key...');

        // Replace the existing API key
        content = content.replace(/apiKey="[^"]*"/, `apiKey="${apiKey}"`);
        fs.writeFileSync(targetPath, content);

        console.log('\x1b[32m%s\x1b[0m', `\n✅ Successfully updated your BugCatcher API Key to ${apiKey}!`);
        console.log(`Run your app and start capturing bugs magically.\n`);
        process.exit(0);
    }

    // Attempt to inject import and component 
    // (A real CLI would use AST like babel/ts-morph, but regex/string manipulation is okay for MVP simulation)

    // 1. Add import statement
    content = `import { BugCatcherWidget } from '@bugcatcher/react';\n` + content;

    // 2. Add component inside body
    content = content.replace(/(<body[^>]*>)/i, `$1\n        <BugCatcherWidget apiKey="${apiKey}" />`);

    fs.writeFileSync(targetPath, content);

    console.log('\x1b[32m%s\x1b[0m', `\n✅ Successfully injected BugCatcher into your app!`);
    console.log(`Run your app and start capturing bugs magically.\n`);
}

main().catch(console.error);
