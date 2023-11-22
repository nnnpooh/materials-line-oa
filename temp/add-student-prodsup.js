require("dotenv").config();
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const dateFNS = require("date-fns");
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SERVICE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);
const csv = require("csvtojson");

const fs = require("fs");

const csvFilePath = "./temp/student_data/studentlist_255217.csv";

// const data = fs.readFileSync(csvFilePath, "utf8");
// console.log(data);

async function addRegisteredData() {
  const students = await csv().fromFile(csvFilePath);
  // console.log(students);

  let registeredData = students.map((el) => {
    const { sec, ...rest } = el;

    return {
      ...rest,
      // email: `${el.cmu_id}@cmu.ac.th`,
    };
  });

  let userData = students.map((el) => {
    return {
      line_id: el.cmu_id,
      cmu_id: el.cmu_id,
    };
  });

  // console.log(registeredData.slice(0, 4));
  // console.log(userData.slice(0, 4));

  /* Add student data to registered_students table */
  // registeredData.forEach(async (el) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("registered_students")
  //       .insert([el]);

  //     if (error) {
  //       console.log(error);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  /* Preregistered students to users table */
  userData.forEach(async (el) => {
    try {
      const { data, error } = await supabase.from("users").insert([el]);
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  });
}

addRegisteredData();
