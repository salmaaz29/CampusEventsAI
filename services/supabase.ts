import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ampaobwuctllkqpixzgs.supabase.co'
const SUPABASE_KEY = 'sb_publishable_xptd_N1i4Hyd0qSL4cC66Q_9cHweZis'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)