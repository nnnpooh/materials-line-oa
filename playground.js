const text = 'REG:34342342';
const a = text.substring(0, 4);
console.log(a);
console.log(text.substring(4));

let re = /^(REG:\d+)/;

let re2 = /\d+/;

let b = re.exec(text);
console.log(re.exec(text));
console.log(re2.exec(text)[0]);
