// Serverless function (Vercel) to delete the current authenticated user from Supabase Auth
// Requires env vars: SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Missing server env configuration' })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Verify token and get user
    const { data: userData, error: userError } = await admin.auth.getUser(token)
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = userData.user.id

    // Delete the auth user
    const { error: delError } = await admin.auth.admin.deleteUser(userId)
    if (delError) {
      return res.status(500).json({ error: delError.message || 'Failed to delete user' })
    }

    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' })
  }
}


