-- Create journal_templates table for storing journal templates
CREATE TABLE IF NOT EXISTS public.journal_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('getting_started', 'reflections', 'custom')),
    icon TEXT DEFAULT 'file-text',
    template_content JSONB NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_system_template_no_user CHECK (
        (is_system = true AND user_id IS NULL) OR 
        (is_system = false AND user_id IS NOT NULL)
    )
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.journal_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_templates
CREATE POLICY "Everyone can view system templates" ON public.journal_templates
    FOR SELECT USING (is_system = true);

CREATE POLICY "Users can view own custom templates" ON public.journal_templates
    FOR SELECT USING (is_system = false AND auth.uid() = user_id);

CREATE POLICY "Users can insert own custom templates" ON public.journal_templates
    FOR INSERT WITH CHECK (is_system = false AND auth.uid() = user_id);

CREATE POLICY "Users can update own custom templates" ON public.journal_templates
    FOR UPDATE USING (is_system = false AND auth.uid() = user_id);

CREATE POLICY "Users can delete own custom templates" ON public.journal_templates
    FOR DELETE USING (is_system = false AND auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_templates_user_id ON public.journal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_templates_category ON public.journal_templates(category);
CREATE INDEX IF NOT EXISTS idx_journal_templates_system ON public.journal_templates(is_system);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_journal_templates_updated_at 
    BEFORE UPDATE ON public.journal_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert system templates
INSERT INTO public.journal_templates (name, description, category, icon, template_content, is_system) VALUES
(
    'Daily Gratitude',
    'Start your day with gratitude and positive reflection',
    'getting_started',
    'heart',
    '{
        "blocks": [
            {
                "id": "1",
                "type": "heading",
                "level": 2,
                "text": "Daily Gratitude",
                "richText": "<h2>Daily Gratitude</h2>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "2",
                "type": "paragraph",
                "text": "TODAY I AM GRATEFUL FOR:",
                "richText": "<p><strong>TODAY I AM GRATEFUL FOR:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "3",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "4",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "5",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "6",
                "type": "paragraph",
                "text": "SIMPLE DELIGHTS I HAVE ENJOYED LATELY",
                "richText": "<p><strong>SIMPLE DELIGHTS I HAVE ENJOYED LATELY</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "7",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "8",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "9",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "10",
                "type": "paragraph",
                "text": "3 GOOD THINGS THAT HAPPENED TODAY",
                "richText": "<p><strong>3 GOOD THINGS THAT HAPPENED TODAY</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "11",
                "type": "numbered-list",
                "text": "1. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "12",
                "type": "numbered-list",
                "text": "2. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "13",
                "type": "numbered-list",
                "text": "3. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            }
        ]
    }',
    true
),
(
    '5 minutes A.M.',
    'Quick morning reflection to set intentions for the day',
    'getting_started',
    'sunrise',
    '{
        "blocks": [
            {
                "id": "1",
                "type": "heading",
                "level": 2,
                "text": "Morning Reflection (5 minutes)",
                "richText": "<h2>Morning Reflection (5 minutes)</h2>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "2",
                "type": "paragraph",
                "text": "How am I feeling right now?",
                "richText": "<p><strong>How am I feeling right now?</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "3",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "4",
                "type": "paragraph",
                "text": "What are my top 3 priorities today?",
                "richText": "<p><strong>What are my top 3 priorities today?</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "5",
                "type": "numbered-list",
                "text": "1. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "6",
                "type": "numbered-list",
                "text": "2. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "7",
                "type": "numbered-list",
                "text": "3. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "8",
                "type": "paragraph",
                "text": "One intention I want to set for today:",
                "richText": "<p><strong>One intention I want to set for today:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "9",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            }
        ]
    }',
    true
),
(
    'Daily Goal Plan',
    'Structure your day with clear goals and action steps',
    'getting_started',
    'target',
    '{
        "blocks": [
            {
                "id": "1",
                "type": "heading",
                "level": 2,
                "text": "Daily Goal Plan",
                "richText": "<h2>Daily Goal Plan</h2>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "2",
                "type": "paragraph",
                "text": "Main Goal for Today:",
                "richText": "<p><strong>Main Goal for Today:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "3",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "4",
                "type": "paragraph",
                "text": "Action Steps:",
                "richText": "<p><strong>Action Steps:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "5",
                "type": "todo",
                "text": "□ ",
                "richText": "<p>□ </p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "6",
                "type": "todo",
                "text": "□ ",
                "richText": "<p>□ </p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "7",
                "type": "todo",
                "text": "□ ",
                "richText": "<p>□ </p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "8",
                "type": "paragraph",
                "text": "Potential Obstacles:",
                "richText": "<p><strong>Potential Obstacles:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "9",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "10",
                "type": "paragraph",
                "text": "Success Metric:",
                "richText": "<p><strong>Success Metric:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "11",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            }
        ]
    }',
    true
),
(
    'Evening Reflection',
    'End your day with thoughtful reflection and planning',
    'reflections',
    'moon',
    '{
        "blocks": [
            {
                "id": "1",
                "type": "heading",
                "level": 2,
                "text": "Evening Reflection",
                "richText": "<h2>Evening Reflection</h2>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "2",
                "type": "paragraph",
                "text": "What went well today?",
                "richText": "<p><strong>What went well today?</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "3",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "4",
                "type": "paragraph",
                "text": "What could I improve tomorrow?",
                "richText": "<p><strong>What could I improve tomorrow?</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "5",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "6",
                "type": "paragraph",
                "text": "What am I grateful for today?",
                "richText": "<p><strong>What am I grateful for today?</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "7",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "8",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "9",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "10",
                "type": "paragraph",
                "text": "Tomorrow I will focus on:",
                "richText": "<p><strong>Tomorrow I will focus on:</strong></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "11",
                "type": "paragraph",
                "text": "",
                "richText": "<p></p>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            }
        ]
    }',
    true
),
(
    'Weekly Review',
    'Comprehensive weekly reflection and planning ahead',
    'reflections',
    'calendar-week',
    '{
        "blocks": [
            {
                "id": "1",
                "type": "heading",
                "level": 1,
                "text": "Weekly Review",
                "richText": "<h1>Weekly Review</h1>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "2",
                "type": "heading",
                "level": 3,
                "text": "Wins & Accomplishments",
                "richText": "<h3>Wins & Accomplishments</h3>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "3",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "4",
                "type": "heading",
                "level": 3,
                "text": "Challenges & Lessons",
                "richText": "<h3>Challenges & Lessons</h3>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "5",
                "type": "bullet-list",
                "text": "• ",
                "richText": "<ul><li></li></ul>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "6",
                "type": "heading",
                "level": 3,
                "text": "Next Week Focus",
                "richText": "<h3>Next Week Focus</h3>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "7",
                "type": "numbered-list",
                "text": "1. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "8",
                "type": "numbered-list",
                "text": "2. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            },
            {
                "id": "9",
                "type": "numbered-list",
                "text": "3. ",
                "richText": "<ol><li></li></ol>",
                "createdAt": "2025-08-14T00:00:00.000Z"
            }
        ]
    }',
    true
);