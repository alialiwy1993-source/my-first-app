-- =====================================================
-- Migration 005: Seed Studios Data
-- =====================================================

INSERT INTO public.studios (slug, name_ar, name_en, description_ar, category, icon, color, is_active, is_premium, sort_order)
VALUES
  ('chat',             'استوديو المحادثة',     'Chat Studio',         'محادثة ذكية مع AI بأنواع مساعدين متعددة',                          'text',     '💬', '#6366f1', TRUE, FALSE, 1),
  ('articles',         'استوديو المقالات',     'Articles Studio',     'كتابة مقالات احترافية — SEO، تقنية، تسويقية',                      'text',     '✍️', '#10b981', TRUE, FALSE, 2),
  ('translation',      'استوديو الترجمة',      'Translation Studio',  'ترجمة احترافية بين العربية والإنجليزية',                            'text',     '🌐', '#3b82f6', TRUE, FALSE, 3),
  ('research',         'استوديو الأبحاث',      'Research Studio',     'مساعدة أكاديمية للطلاب والباحثين',                                  'research', '🎓', '#f59e0b', TRUE, FALSE, 4),
  ('social',           'استوديو السوشيال',     'Social Studio',       'محتوى يوتيوب وتيك توك وإنستغرام',                                  'text',     '🎥', '#ef4444', TRUE, FALSE, 5),
  ('channel-analyzer', 'تحليل القنوات',        'Channel Analyzer',    'تحليل قناتك وتحسينها',                                              'text',     '📊', '#8b5cf6', TRUE, FALSE, 6),
  ('thumbnails',       'الصور المصغرة',        'Thumbnail Studio',    'أفكار ونصوص وprompts للصور المصغرة',                                'text',     '🖼️', '#06b6d4', TRUE, FALSE, 7),
  ('images',           'توليد الصور',          'Image Studio',        'إنشاء صور إبداعية بالذكاء الاصطناعي',                              'image',    '🎨', '#ec4899', TRUE, FALSE, 8),
  ('audio',            'توليد الصوت',          'Audio Studio',        'تحويل النص إلى صوت احترافي',                                        'audio',    '🔊', '#14b8a6', TRUE, FALSE, 9),
  ('video',            'توليد الفيديو',        'Video Studio',        'إنشاء أفكار وسكربتات ومشاهد الفيديو',                              'video',    '🎞️', '#f97316', TRUE, FALSE, 10),
  ('books-tools',      'الكتب وأدوات AI',      'Books & AI Tools',    'تلخيص كتب، خطط قراءة، دليل أدوات AI',                             'text',     '📚', '#84cc16', TRUE, FALSE, 11)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Seed بعض أدوات AI الشهيرة
-- =====================================================
INSERT INTO public.ai_tools (name, url, description_ar, category, tags, is_free)
VALUES
  ('ChatGPT',     'https://chat.openai.com',   'مساعد الذكاء الاصطناعي من OpenAI',             'writing',   ARRAY['محادثة', 'كتابة', 'عام'],              FALSE),
  ('Midjourney',  'https://midjourney.com',    'توليد صور احترافية بالذكاء الاصطناعي',          'images',    ARRAY['صور', 'تصميم', 'إبداع'],               FALSE),
  ('ElevenLabs',  'https://elevenlabs.io',     'توليد أصوات واقعية بالذكاء الاصطناعي',          'audio',     ARRAY['صوت', 'TTS', 'بودكاست'],               FALSE),
  ('Runway ML',   'https://runwayml.com',      'توليد وتحرير فيديوهات بالذكاء الاصطناعي',       'video',     ARRAY['فيديو', 'تحرير', 'توليد'],             FALSE),
  ('GitHub Copilot','https://github.com/features/copilot', 'مساعد البرمجة بالذكاء الاصطناعي', 'coding',    ARRAY['برمجة', 'كود', 'مطورين'],              FALSE),
  ('Perplexity',  'https://perplexity.ai',     'بحث ذكي بالذكاء الاصطناعي مع المصادر',          'study',     ARRAY['بحث', 'معلومات', 'دراسة'],             TRUE),
  ('Canva AI',    'https://canva.com',         'تصميم جرافيك بمساعدة الذكاء الاصطناعي',         'images',    ARRAY['تصميم', 'جرافيك', 'تسويق'],            TRUE),
  ('Grammarly',   'https://grammarly.com',     'تصحيح القواعد وتحسين الكتابة',                  'writing',   ARRAY['كتابة', 'قواعد', 'تحرير'],             TRUE)
ON CONFLICT DO NOTHING;
