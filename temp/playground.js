import { format } from 'date-fns';
// const text = 'REG:012345';
// let re = /^(REG:\d+)/;
// let num = /[^(REG:)]\d*/;
// console.log(re.exec(text));
// console.log(num.exec(text));

// const text = 'CODE:asd343fdsdf';
// let re = /^(CODE:[a-zA-Z0-9]+)/;
// let num = /[^(CODE:)][a-zA-Z0-9]*/;
// console.log(re.exec(text));
// console.log(num.exec(text));

// const text = 'RECORD';
// let re = /^(RECORD\s*)/;
// console.log(re.exec(text));

const text = '>> ';
let re = /^(>>)/;
console.log(re.exec(text));

// const a = [
//   {
//     code: 'abcd',
//     classid: '250103',
//     yearstr: '2564',
//     semester: '1',
//     timestart: '2021-07-03T04:05:06',
//     timeend: '2021-07-04T04:05:06',
//     graded: null,
//   },
//   {
//     code: 'abcd2',
//     classid: null,
//     yearstr: null,
//     semester: null,
//     timestart: '2021-07-03T01:11:11',
//     timeend: '2021-07-04T01:11:11',
//     graded: null,
//   },
// ];

// const code = 'abcd';
// b = a.find((el) => el.code == code);
// console.log(b);
// console.log('a' + 'b');

// const text = '2021-07-03T04:05:06';
// const a = new Date();
// console.log(typeof a);

// console.log(a.toDateString());

// const b = a.toLocaleDateString();
// console.log(new Date().toLocaleString());

// console.log(format(a, 'yyyy-MM-dd hh:mm:ss'));

// const data = [
//   {
//     line_id: 'Ufab2bdfa10b7f4f78da9fcd7a2a3ad26',
//     timerecord: '2021-07-05T12:27:39',
//     classid: '250103',
//     yearstr: '2564',
//     semester: '1',
//     section: '001',
//     timestart: '2021-07-05T05:00:00',
//   },
//   {
//     line_id: 'Ufab2bdfa10b7f4f78da9fcd7a2a3ad26',
//     timerecord: '2021-07-05T12:27:39',
//     classid: '250103',
//     yearstr: '2564',
//     semester: '1',
//     section: '001',
//     timestart: '2021-07-05T05:00:00',
//   },
// ];

// const dataBlank = [];

// const dataMap = data.map((el) => {
//   return `Class: ${el.classid}-${el.section}: Check-In @ ${new Date(
//     el.timerecord
//   ).toLocaleString()}`;
// });

// const dataJoin = dataMap.join('\n');
// console.log(dataMap);
// console.log(dataJoin);
