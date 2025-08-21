const fs = require('fs');
const path = require('path');

const uiComponentsDir = path.join(__dirname, 'src', 'components', 'ui');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all variations of the utils import with the correct one
  content = content.replace(
    /from ['"]\.\.\/\.\.\/lib\/utils['"]/g,
    'from "@/lib/utils"'
  );
  content = content.replace(
    /from ['"]\.\/lib\/utils['"]/g,
    'from "@/lib/utils"'
  );
  content = content.replace(
    /from ['"]@\/lib\/paths['"]/g,
    'from "@/lib/utils"'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed imports in ${path.basename(filePath)}`);
}

// Process all .tsx files in the ui components directory
fs.readdirSync(uiComponentsDir)
  .filter(file => file.endsWith('.tsx'))
  .forEach(file => {
    const filePath = path.join(uiComponentsDir, file);
    fixImports(filePath);
  });

console.log('All imports have been fixed!');
