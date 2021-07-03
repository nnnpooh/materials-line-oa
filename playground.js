const text = 'REG:012345';
let re = /^(REG:\d+)/;
let num = /[^(REG:)]\d*/;
console.log(re.exec(text));
console.log(num.exec(text));

// const text = 'CODE:asd343fdsdf';
// let re = /^(CODE:[a-zA-Z0-9]+)/;
// let num = /[^(CODE:)][a-zA-Z0-9]*/;
// console.log(re.exec(text));
// console.log(num.exec(text));
