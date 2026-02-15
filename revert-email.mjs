import fs from 'fs';

const files = [
  'server/routes.ts',
  'client/src/lib/strata-context.tsx',
  'client/src/components/layout/sidebar.tsx',
  'client/src/pages/admin.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace jrfinnbogason back to rfinnbogason
    content = content.replace(/jrfinnbogason@gmail\.com/g, 'rfinnbogason@gmail.com');

    // Remove the MASTER_ADMIN_EMAILS array approach and use simple string check
    content = content.replace(/const MASTER_ADMIN_EMAILS = \['rfinnbogason@gmail\.com', 'jrfinnbogason@gmail\.com'\];?\n?/g, '');
    content = content.replace(/MASTER_ADMIN_EMAILS\.includes\(([^)]+)\)/g, "$1 === 'rfinnbogason@gmail.com'");
    content = content.replace(/!MASTER_ADMIN_EMAILS\.includes\(([^)]+)\)/g, "$1 !== 'rfinnbogason@gmail.com'");

    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${file}`);
  }
});

console.log('\n✅ Reverted to rfinnbogason@gmail.com only');
