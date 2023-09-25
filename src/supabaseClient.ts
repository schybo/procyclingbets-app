import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {auth: {
//     flowType: 'pkce',
// }})

const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options)
