import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server'
import { JournalTemplate } from '@/components/journal/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const supabase = await createSupabaseRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('journal_templates')
      .select('*')
      .eq('id', params.id)
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
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

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error in template GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
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

    // Only allow users to update their own custom templates
    const { data, error } = await supabase
      .from('journal_templates')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        category,
        icon,
        template_content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('is_system', false)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      return NextResponse.json({ error: 'Failed to update template or template not found' }, { status: 404 })
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

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error in template PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const supabase = await createSupabaseRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow users to delete their own custom templates
    const { error } = await supabase
      .from('journal_templates')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('is_system', false)

    if (error) {
      console.error('Error deleting template:', error)
      return NextResponse.json({ error: 'Failed to delete template or template not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error in template DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const supabase = await createSupabaseRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the system template
    const { data: systemTemplate, error: fetchError } = await supabase
      .from('journal_templates')
      .select('*')
      .eq('id', params.id)
      .eq('is_system', true)
      .single()

    if (fetchError || !systemTemplate) {
      return NextResponse.json({ error: 'System template not found' }, { status: 404 })
    }

    // Copy system template to user's custom templates
    const { data, error } = await supabase
      .from('journal_templates')
      .insert({
        user_id: user.id,
        name: systemTemplate.name,
        description: systemTemplate.description,
        category: 'custom',
        icon: systemTemplate.icon,
        template_content: systemTemplate.template_content,
        is_system: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error copying template:', error)
      return NextResponse.json({ error: 'Failed to save template to your collection' }, { status: 500 })
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
    console.error('Error in template copy POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}