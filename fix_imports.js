const fs = require('fs');
const path = require('path');

const dir = './app/[username]/_components/resume/editing/tabs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('<SortButtons') && !content.includes('import { SortButtons }')) {
    content = content.replace(/'use client';/, `'use client';\n\nimport { SortButtons } from '../SortButtons';`);
    fs.writeFileSync(filepath, content);
    console.log(`Fixed import in ${file}`);
  }
}
