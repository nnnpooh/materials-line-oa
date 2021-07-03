const https = require('https');
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

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
  const { data, error } = await supabase
    .from('users_details')
    .select('*')
    .eq('email', 'test@test.com');

  console.log({ data, error });
  //console.log(data[0].registered_students);
}
test();

async function getUserData() {
  //let { data: users, error } = await supabase.from('users').select('*');
  //console.log({ users, error });
  /*   let { data, error2 } = await supabase
    .from('users')
    .insert([{ cmu_id: '23434234', line_id: '34234234' }]);
 */
  /*   let { data, error3 } = await supabase
    .from('users')
    .update({ cmu_id: 'updated' })
    .match({ cmu_id: '23434234' });

  console.log({ data, error3 }); */
}

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
  let codeText = /[^(CODE:)\s*][a-zA-Z0-9]/;

  if (reg.exec(text)) {
    type = 'registration';
    command = regNum.exec(text)[0];
  } else if (look.exec(text)) {
    type = 'lookUpId';
  } else if (code.exec(text)) {
    type = 'checkin';
    command = codeText.exec(text)[0];
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
  }
}

async function handleWebHook(req, res) {
  res.send('HTTP POST request sent to the webhook URL!');
  // If the user sends a message to your bot, send a reply message

  const event = req.body.events[0];

  if (event.type === 'message') {
    const messageType = event.message.type;
    const messages = [];
    const lineId = event.source.userId;
    const inputText = event.message.text;

    const [commandType, command] = analyzeTextCommand(inputText);

    //console.log({ commandType, command });
    let data = '';
    let error = '';

    switch (commandType) {
      case 'registration':
        const cmuId = command;
        ({ data, error } = await supabase
          .from('users')
          .insert([{ cmu_id: cmuId, line_id: lineId }]));

        //console.log({ cmuId });
        //console.log({ data, error });
        if (!error) {
          addTextMessageToReply(
            messages,
            `Register CMU-ID ${cmuId} to this LINE account.`
          );
        } else {
          if (error.message.includes('violates foreign key constraint')) {
            addTextMessageToReply(
              messages,
              `You have not registered for this class.`
            );
          } else if (
            error.message.includes(
              'duplicate key value violates unique constraint'
            )
          ) {
            addTextMessageToReply(
              messages,
              `Already registered CMU-ID to this LINE account.`
            );
          }
        }

        break;
      case 'lookUpId':
        ({ data, error } = await supabase
          .from('users_details')
          .select('*')
          .eq('line_id', lineId));

        if (data.length === 0) {
          addTextMessageToReply(messages, `คุณยังไม่ได้ลงทะเบียน`);
        } else {
          let d0 = data[0];
          addTextMessageToReply(
            messages,
            `Your registration details:\nCMUID: ${d0.cmu_id}\nName: ${d0.firstname} ${d0.lastname}\nEmail: ${d0.email}`
          );
        }

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

app.post('/webhook', readLineEvents, handleWebHook);
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
