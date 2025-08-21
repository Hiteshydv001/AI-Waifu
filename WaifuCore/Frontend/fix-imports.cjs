const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');
const targetImportOld = "from '../../lib/utils'";
const targetImportOld2 = "from '@/lib/utils'";
const correctImport = "from '@/lib/utils'";

console.log(`Scanning directory: ${uiDir}`);

fs.readdir(uiDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    let filesChanged = 0;
    files.forEach((file) => {
        if (file.endsWith('.tsx')) {
            const filePath = path.join(uiDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;
            
            // Check for both incorrect variations
            if (content.includes(targetImportOld)) {
                content = content.replace(new RegExp(targetImportOld, 'g'), correctImport);
                changed = true;
            } else if (content.includes(targetImportOld2)) {
                 // This handles cases that might already have the alias but are being flagged
                 // No change needed, but good to know
            } else if (!content.includes(correctImport) && content.includes("cn(")) {
                // If a file uses cn() but has no import for it, it might be corrupted.
                // This is a safety check. For now we focus on replacement.
            }

            // A special case found in `fix-imports.ps1`
            if (content.includes('import { cn } from "@/lib/utils"')) {
                 // This file is already correct or was fixed.
            } else if (content.includes('import { cn } from "../../lib/utils"')) {
                content = content.replace('import { cn } from "../../lib/utils"', 'import { cn } from "@/lib/utils"');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Fixed imports in: ${file}`);
                filesChanged++;
            }
        }
    });

    if (filesChanged > 0) {
        console.log(`\n🎉 Success! Corrected imports in ${filesChanged} files.`);
    } else {
        console.log(`\n👍 All component import paths already seem to be correct.`);
    }
});
