// põe ?v=<hash> no styles.css e no script.js do index.html, para o cache longo do nginx
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const hash = (arquivo) => createHash('md5').update(readFileSync(arquivo)).digest('hex').slice(0, 8);
let html = readFileSync('index.html', 'utf8');
html = html.replace(/"(styles\.css|script\.js)(?:\?v=[0-9a-f]+)?"/g, (_, arquivo) => `"${arquivo}?v=${hash(arquivo)}"`);
writeFileSync('index.html', html);
console.log(html.match(/(styles\.css|script\.js)\?v=[0-9a-f]+/g).join('  '));
