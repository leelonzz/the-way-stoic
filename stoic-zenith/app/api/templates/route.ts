import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server'
import { JournalTemplate } from '@/components/journal/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('journal_templates')
      .select('*')

    // Get system templates + user's custom templates
    query = query.or(`is_system.eq.true,user_id.eq.${user.id}`)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('is_system', { ascending: false }).order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Transform data to match JournalTemplate interface
    const templates: JournalTemplate[] = data.map(template => ({
      id: template.id,
      user_id: template.user_id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      template_content: template.template_content,
      is_system: template.is_system,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at)
    }))

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error in templates GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, icon, template_content } = body

    // Validate required fields
    if (!name || !template_content || !category || !icon) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, template_content, category, icon' 
      }, { status: 400 })
    }

    // Validate template_content structure
    if (!template_content.blocks || !Array.isArray(template_content.blocks)) {
      return NextResponse.json({ 
        error: 'Invalid template_content structure. Must have blocks array.' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('journal_templates')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        category,
        icon,
        template_content,
        is_system: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    const template: JournalTemplate = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      category: data.category,
      icon: data.icon,
      template_content: data.template_content,
      is_system: data.is_system,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error in templates POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}