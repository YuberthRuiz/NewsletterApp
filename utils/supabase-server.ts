import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createServerSupabaseClient() {
  const cookieStore = cookies() as any
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll ? cookieStore.getAll().map((c: any) => ({ name: c.name, value: c.value })) : []
      },
      setAll(cookiesToSet) {
        if (cookieStore.set) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          )
        }
      },
    },
  })
}

export function createAdminSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}