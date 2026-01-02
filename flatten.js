const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/questionBank.json', 'utf8'));

function flatten(arr) {
  let out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out = out.concat(flatten(item));
    else out.push(item);
  }
  return out;
}

const flat = flatten(data);
fs.writeFileSync('src/data/questionBank.json', JSON.stringify(flat, null, 2));
console.log('Flattened!');
