import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'server/routes.ts',
  'client/src/lib/strata-context.tsx',
  'client/src/components/layout/sidebar.tsx',
  'client/src/pages/admin.tsx',
  'fix-strata-access.ts'
];

const oldEmail = 'rfinnbogason@gmail.com';
const newEmail = 'jrfinnbogason@gmail.com';

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const count = (content.match(new RegExp(oldEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    content = content.replace(new RegExp(oldEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newEmail);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file}: Replaced ${count} occurrences`);
  } else {
    console.log(`⚠️  ${file}: File not found`);
  }
});

console.log('\n✨ All files updated!');
