const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from ['"]@\/lib\/utils['"]/g, 'from "./lib/utils"');
  content = content.replace(/from ['"]\.\.\/\.\.\/lib\/utils['"]/g, 'from "./lib/utils"');
  fs.writeFileSync(filePath, content);
}

// Get all .tsx files in the UI directory
fs.readdirSync(uiDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(uiDir, file);
    updateImports(filePath);
    console.log(`Updated ${file}`);
  }
});
