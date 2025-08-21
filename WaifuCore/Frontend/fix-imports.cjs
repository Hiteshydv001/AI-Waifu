const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const targetImports = [
    "from '@/lib/utils'",
    "from './lib/utils'",
    'from "@/lib/utils"',
    'from "./lib/utils"'
];

const aliasImportRegex = /from ['"]@\/([^'"]+)['"]/g;

console.log(`Scanning directory: ${srcDir}`);

function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let filesChanged = 0;

    files.forEach((file) => {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            filesChanged += processDirectory(fullPath);
            return;
        }

        if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            // Replace utils imports
            const utilsPath = path.relative(dir, path.join(__dirname, 'src', 'lib')).replace(/\\/g, '/');
            const utilsImport = `from "${utilsPath}/utils"`;

            for (const targetImport of targetImports) {
                if (content.includes(targetImport)) {
                    content = content.replace(new RegExp(targetImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), utilsImport);
                    changed = true;
                }
            }

            // Replace all other @/ alias imports with relative paths
            content = content.replace(aliasImportRegex, (match, importPath) => {
                const targetPath = path.join(__dirname, 'src', ...importPath.split('/'));
                const relativePath = path.relative(dir, targetPath).replace(/\\/g, '/');
                changed = true;
                return `from "${relativePath}"`;
            });

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`✅ Fixed imports in: ${fullPath}`);
                filesChanged++;
            }
        }
    });

    return filesChanged;
}

const totalFilesChanged = processDirectory(srcDir);

if (totalFilesChanged > 0) {
    console.log(`\n🎉 Success! Corrected imports in ${totalFilesChanged} files.`);
} else {
    console.log(`\n👍 All component import paths already seem to be correct.`);
}
