const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SERVICE_KEY;
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceKey);

module.exports = { supabase };
