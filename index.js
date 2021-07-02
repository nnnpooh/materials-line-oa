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
//console.log({ supabaseUrl, supabaseKey, serviceKey });
const supabase = createClient(supabaseUrl, serviceKey);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

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
//getUserData();

//console.log(process.env);

app.get('/', (req, res) => {
  res.sendStatus(200);
});

function addTextMessageToReply(message, text) {
  message.push({
    type: 'text',
    text: text,
  });
}

function analyzeTextCommand(text) {
  let type = '';
  let command = '';

  let reg = /^(REG:)/;
  let look = /^(CMUID)/;

  if (reg.exec(text)) {
    type = 'registration';
    command = text.substring(5);
  } else if (look.exec(text)) {
    type = 'lookUpId';
  } else {
  }

  return [type, command];
}

app.post('/webhook', async function (req, res) {
  res.send('HTTP POST request sent to the webhook URL!');
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === 'message') {
    //console.log(req.body.events);
    // Message data, must be stringified
    const event = req.body.events[0];
    const messageType = event.message.type;
    const messages = [];
    const lineId = event.source.userId;
    const inputText = event.message.text;
    //console.log({ lineId });

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

        console.log({ data, error });
        if (!error) {
          addTextMessageToReply(messages, `Add ${cmuId} to the database.`);
        } else {
          addTextMessageToReply(
            messages,
            `Already added data to the database.`
          );
        }

        break;
      case 'lookUpId':
        ({ data, error } = await supabase
          .from('users')
          .select('*')
          .eq('line_id', lineId));
        console.log({ data, error });

        if (data.length === 0) {
          addTextMessageToReply(messages, `You have not registed!`);
        } else {
          addTextMessageToReply(
            messages,
            `Your registed CMU-ID is ${data[0].cmu_id}`
          );
        }

        break;
      default:
        addTextMessageToReply(messages, 'ไม่เข้าใจ');
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
});
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
