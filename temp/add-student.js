require('dotenv').config();
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const dateFNS = require('date-fns');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SERVICE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);
const csv = require('csvtojson');

const fs = require('fs');

// const csvFilePath = './student_data/studentlist_259103_001000.csv';
const csvFilePath = './student_data/studentlist_259103_802000.csv';

// const data = fs.readFileSync(csvFilePath, 'utf8');
// console.log(data);

async function addData() {
  const students = await csv().fromFile(csvFilePath);
  // console.log(students);

  students.forEach(async (student) => {
    console.log(
      `Processing ${student.cmu_id}: ${student.firstname} ${student.lastname}`
    );
    const { data, error } = await supabase
      .from('registered_students')
      .insert(student);

    if (error) {
      console.log(error.details);
      const { data2, error2 } = await supabase
        .from('registered_students')
        .update(student)
        .match({ cmu_id: student.cmu_id });
      if (error2) {
        console.log('Cannot update.', error.details);
      } else {
        console.log('Update data successfully.');
      }
    }
  });
}

addData();
