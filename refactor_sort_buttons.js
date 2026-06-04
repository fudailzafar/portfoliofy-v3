const fs = require('fs');
const path = require('path');

const dir = './app/[username]/_components/resume/editing/tabs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let modifiedFiles = 0;

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  const regex = /\{canMoveUp\s*&&\s*\(\s*<TooltipProvider[\s\S]*?onClick=\{\(\)\s*=>\s*handleMoveUp\(([^,]+),\s*prevItem\)\}[\s\S]*?\{canMoveDown\s*&&\s*\(\s*<TooltipProvider[\s\S]*?Move down\s*<\/TooltipContent>\s*<\/Tooltip>\s*<\/TooltipProvider>\s*\)\}/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match, varName) => {
      return `<SortButtons\n                        canMoveUp={canMoveUp}\n                        canMoveDown={canMoveDown}\n                        onMoveUp={() => handleMoveUp(${varName}, prevItem)}\n                        onMoveDown={() => handleMoveUp(${varName}, nextItem)}\n                      />`;
    });
    
    if (!content.includes('SortButtons')) {
      content = content.replace(/import \{ Label \}/, `import { SortButtons } from '../SortButtons';\nimport { Label }`);
    }
    
    fs.writeFileSync(filepath, content);
    modifiedFiles++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Done! Modified ${modifiedFiles} files.`);
