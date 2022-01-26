const { supabase } = require('./db');
const dateFNS = require('date-fns');

async function PS_checkStudentID(req, res, next) {
  const cmu_id = req?.body?.cmu_id || null;
  const code = req?.body?.code || null;

  if (!cmu_id || !code) {
    res
      .status(200)
      .send(
        'กรุณาส่งข้อมูลเป็น JSON ที่มี "cmu_id" เป็น string 9 ตัว และ "code" เป็น string 4 ตัว.'
      );
    return;
  }

  const { data, error } = await supabase
    .from('users_details')
    .select('*')
    .eq('cmu_id', cmu_id);

  if (!error) {
    if (data.length === 0) {
      req.isRegistered = false;
      req.registeredData = [];
      res.status(400).send('ไม่พบ CMU ID ในวิชานี้ กรุณาตรวจเช็ค CMU ID');
      return;
    } else {
      req.isRegistered = true;
      req.registeredData = data[0];
      next();
    }
  } else {
    next(new Error('Error reading database'));
  }
}

async function PS_checkValidCodes(req, res, next) {
  const dateNow = dateFNS.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .lt('timestart', dateNow)
    .gt('timeend', dateNow);

  // console.log(dateNow);
  // console.log(data);

  req.availableCodes = data;
  if (!error) {
    if (data.length != 0) {
      req.isValidCodes = true;
      req.validCodes = data;
      next();
    } else {
      req.isValidCodes = false;
      req.validCodes = data;
      res.status(400).send('ไม่มีการเช็คชื่อในขณะนี้');
      return;
    }
  } else {
    next(new Error('Cannot get codes.'));
  }
}

async function PS_checkin(req, res, next) {
  const code = req.body.code;
  const codes = req.validCodes;
  const cmu_id = req.body.cmu_id;
  const matchCode = codes.find((el) => el.code == code);

  // console.log(matchCode);
  if (matchCode) {
    const { data, error } = await supabase.from('checkins').insert([
      {
        comb: cmu_id + ':' + matchCode.code,
        line_id: cmu_id,
        code: matchCode.code,
        timerecord: dateFNS.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      },
    ]);

    if (!error) {
      res
        .status(400)
        .send(`Check-In @ ${dateFNS.format(new Date(), 'yyyy-MM-dd HH:mm')}`);
    } else {
      // console.log(error);
      res.status(400).send('คุณ Checkin ไปแล้ว');
    }
  } else {
    res
      .status(200)
      .send(
        'Code ไม่ถูกต้อง. Code ที่ถูกต้องจะเป็นอักษรหรือตัวเลข 4 ตัวหลัง (ไม่มีคำว่า "CODE:")'
      );
  }
}

module.exports = { PS_checkStudentID, PS_checkValidCodes, PS_checkin };
