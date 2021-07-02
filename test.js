const e = require('express');

const text = 'REG:54455566';
const a = text.substring(0, 4);
console.log(a);
console.log(text.substring(4));

let re = /^(REG:)/;

let b = re.exec(text);

console.log(b.index);
console.log(b);

let c = { yes: 1, no: 2 };
let d = { yes: 3, no: 4 };

let { yes, no } = c;

console.log(yes, no);

({ yes, no } = d);
yes = d.yes;
no = d.no;

console.log(yes, no);

let error = null;

if (error) {
  console.log('hey');
}
