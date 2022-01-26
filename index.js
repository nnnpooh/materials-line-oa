require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const {
  readLineEvents,
  checkRegistration,
  checkValidCodes,
  handleWebHook,
} = require('./utilities/materials');

const {
  PS_checkStudentID,
  PS_checkValidCodes,
  PS_checkin,
} = require('./utilities/prodsup');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

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

app.post('/prodsup', PS_checkStudentID, PS_checkValidCodes, PS_checkin);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
