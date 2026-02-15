import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'server/routes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all single email checks with array check
const replacements = [
  {
    old: `if (req.firebaseUser?.email === 'jrfinnbogason@gmail.com')`,
    new: `const masterAdminEmails = ['rfinnbogason@gmail.com', 'jrfinnbogason@gmail.com'];\n    if (masterAdminEmails.includes(req.firebaseUser?.email))`
  },
  {
    old: `if (req.authenticatedUser?.email === 'jrfinnbogason@gmail.com')`,
    new: `if (masterAdminEmails.includes(req.authenticatedUser?.email))`
  },
  {
    old: `if (userEmail === 'jrfinnbogason@gmail.com')`,
    new: `if (masterAdminEmails.includes(userEmail))`
  },
  {
    old: `if (req.firebaseUser?.email !== "jrfinnbogason@gmail.com" && req.authenticatedUser?.email !== "jrfinnbogason@gmail.com" && req.user?.claims?.email !== "jrfinnbogason@gmail.com")`,
    new: `if (!masterAdminEmails.includes(req.firebaseUser?.email) && !masterAdminEmails.includes(req.authenticatedUser?.email) && !masterAdminEmails.includes(req.user?.claims?.email))`
  },
  {
    old: `if (payload.email !== 'jrfinnbogason@gmail.com')`,
    new: `if (!masterAdminEmails.includes(payload.email))`
  },
  {
    old: `const masterAdmin = users.find(u => u.email === 'jrfinnbogason@gmail.com');`,
    new: `const masterAdmin = users.find(u => masterAdminEmails.includes(u.email));`
  }
];

// Add master admin emails constant at the top of the file after imports
const masterAdminConstant = `\n// Master admin emails\nconst MASTER_ADMIN_EMAILS = ['rfinnbogason@gmail.com', 'jrfinnbogason@gmail.com'];\n`;

// Find the first function or route definition
const firstFunctionIndex = content.indexOf('function registerFirebaseMigrationRoutes');
if (firstFunctionIndex !== -1) {
  content = content.slice(0, firstFunctionIndex) + masterAdminConstant + content.slice(firstFunctionIndex);
}

// Now replace all the individual checks
for (const { old, new: replacement } of replacements) {
  content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
}

// Replace inline masterAdminEmails with MASTER_ADMIN_EMAILS
content = content.replace(/const masterAdminEmails = \['rfinnbogason@gmail\.com', 'jrfinnbogason@gmail\.com'\];?\n?\s*/g, '');
content = content.replace(/masterAdminEmails/g, 'MASTER_ADMIN_EMAILS');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated all email checks in server/routes.ts');
