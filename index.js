const https = require('https');
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const dateFNS = require('date-fns');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SERVICE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

async function test() {
  /*   const { data, error } = await supabase
    .from('users')
    .select('*, registered_students (cmu_id, email, firstname) '); */
  /*   const { data, error } = await supabase
    .from('users_details')
    .select('*')
    .eq('email', 'test@test.com'); */

  const dateNow = dateFNS.format(new Date(), 'yyyy-MM-dd hh:mm:ss');
  //console.log(dateNow);
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .lt('timestart', dateNow)
    .gt('timeend', dateNow);

  // console.log({ data, error });
  //console.log(data[0].registered_students);
}
//test();

function addTextMessageToReply(message, text) {
  message.push({
    type: 'text',
    text: text,
  });
}

function analyzeTextCommand(text) {
  let type = '';
  let command = '';

  let reg = /^(REG:\d+)/;
  let look = /^(CMUID)/;
  let regNum = /[^(REG:)]\d*/;
  let code = /^(CODE:[a-zA-Z0-9]+)/;
  let codeText = /[^(CODE:)\s*][a-zA-Z0-9]*/;
  let record = /^(RECORD\s*)/;
  let ignore = /^(>>)/;

  if (reg.exec(text)) {
    type = 'registration';
    command = regNum.exec(text)[0];
  } else if (look.exec(text)) {
    type = 'lookUpId';
  } else if (code.exec(text)) {
    type = 'checkin';
    command = codeText.exec(text)[0];
  } else if (record.exec(text)) {
    type = 'record';
  } else if (ignore.exec(text)) {
    type = 'ignore';
  } else {
    type = 'unknown';
  }

  return [type, command];
}

function readLineEvents(req, res, next) {
  const events = req.body.events;
  if (Array.isArray(events)) {
    if (events.length === 0) {
      res.status(200).send('Ok');
    } else {
      next();
    }
  } else {
    res.stats(400).send('Could not understand the data.');
  }
}

async function checkRegistration(req, res, next) {
  const lineId = req.body.events[0].source.userId;
  req.lineId = lineId;
  const { data, error } = await supabase
    .from('users_details')
    .select('*')
    .eq('line_id', lineId);

  if (!error) {
    if (data.length === 0) {
      req.isRegistered = false;
      req.registeredData = [];
    } else {
      req.isRegistered = true;
      req.registeredData = data[0];
    }
    next();
  } else {
    next(new Error('Cannot get registered user details.'));
  }
}

async function checkValidCodes(req, res, next) {
  const dateNow = dateFNS.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .lt('timestart', dateNow)
    .gt('timeend', dateNow);

  console.log(dateNow);
  console.log(data);

  req.availableCodes = data;
  if (!error) {
    if (data.length != 0) {
      req.isValidCodes = true;
      req.validCodes = data;
    } else {
      req.isValidCodes = false;
      req.validCodes = data;
    }
    next();
  } else {
    next(new Error('Cannot get codes.'));
  }
}

async function handleWebHook(req, res) {
  res.send('HTTP POST request sent to the webhook URL!');
  // If the user sends a message to your bot, send a reply message

  const event = req.body.events[0];
  const lineId = req.lineId;

  if (event.type === 'message') {
    const messageType = event.message.type;
    const messages = [];
    const inputText = event.message.text;

    const [commandType, command] = analyzeTextCommand(inputText);
    console.log({ commandType, command });

    let data, error;

    switch (commandType) {
      case 'registration':
        //console.log({ cmuId });
        //console.log({ data, error });

        if (req.isRegistered) {
          addTextMessageToReply(
            messages,
            `You already registered under \nCMUID: ${req.registeredData.cmu_id}.`
          );
        } else {
          const cmuId = command;
          ({ data, error } = await supabase
            .from('users')
            .insert([{ cmu_id: cmuId, line_id: lineId }]));

          if (!error) {
            addTextMessageToReply(
              messages,
              `คุณได้ลงทะเบียนรหัส นศ. ${cmuId} กับแอปนี้แล้ว`
            );
          } else if (
            error.message.includes('violates foreign key constraint')
          ) {
            addTextMessageToReply(
              messages,
              `ไม่มีข้อมูลลงทะเบียนของคุณในทะเบียนของมหาวิทยาลัย`
            );
          }
        }

        break;
      case 'lookUpId':
        if (req.isRegistered) {
          let d0 = req.registeredData;
          addTextMessageToReply(
            messages,
            `Your registration details:\nCMUID: ${d0.cmu_id}\nName: ${d0.firstname} ${d0.lastname}\nEmail: ${d0.email}`
          );
        } else {
          addTextMessageToReply(messages, `คุณยังไม่ได้ลงทะเบียนในแอปนี้`);
        }

        break;
      case 'checkin':
        if (req.isRegistered) {
          if (req.isValidCodes) {
            const code = command;
            const codes = req.validCodes;

            const matchCode = codes.find((el) => el.code == code);

            //console.log({ code, codes });

            //console.log(matchCode);
            if (matchCode) {
              const { data, error } = await supabase.from('checkins').insert([
                {
                  comb: lineId + ':' + matchCode.code,
                  line_id: lineId,
                  code: matchCode.code,
                  timerecord: dateFNS.format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                },
              ]);

              if (!error) {
                addTextMessageToReply(
                  messages,
                  `Check-In @ ${dateFNS.format(new Date(), 'yyyy-MM-dd hh:mm')}`
                );
              } else {
                addTextMessageToReply(messages, 'คุณ Checkin ไปแล้ว');
              }
            } else {
              addTextMessageToReply(messages, 'Code ไม่ถูกต้อง');
            }
          } else {
            addTextMessageToReply(messages, 'ไม่มีการเช็คชื่อในขณะนี้');
          }
        } else {
          addTextMessageToReply(
            messages,
            'คุณยังไม่ได้ลงทะเบียนในแอปนี้ กรุณาลงทะเบียนก่อน'
          );
        }
        break;
      case 'record':
        if (req.isRegistered) {
          const { data, error } = await supabase
            .from('checkins_details')
            .select('*')
            .eq('line_id', lineId);

          if (data.length !== 0) {
            const dataMap = data.map((el) => {
              return `Class: ${el.classid}-${el.section}: Check-In @ ${new Date(
                el.timerecord
              ).toLocaleString()}`;
            });

            addTextMessageToReply(messages, dataMap.join('\n'));
          } else {
            addTextMessageToReply(messages, 'ไม่พบข้อมูลการ Check-In');
          }
        } else {
          addTextMessageToReply(
            messages,
            'คุณยังไม่ได้ลงทะเบียนในแอปนี้ กรุณาลงทะเบียนก่อน'
          );
        }
        break;
      case 'ignore':
        addTextMessageToReply(messages, ':)');
        break;
      default:
        addTextMessageToReply(messages, 'ผมไม่เข้าใจ');
        break;
    }

    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: messages,
    });

    // Request header
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + TOKEN,
    };

    // Options to pass into the request
    const webhookOptions = {
      hostname: 'api.line.me',
      path: '/v2/bot/message/reply',
      method: 'POST',
      headers: headers,
      body: dataString,
    };

    // Define request
    const request = https.request(webhookOptions, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on('error', (err) => {
      console.error(err);
    });

    // Send data
    request.write(dataString);
    request.end();
  }
}

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.post(
  '/webhook',
  readLineEvents,
  checkRegistration,
  checkValidCodes,
  handleWebHook
);
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
