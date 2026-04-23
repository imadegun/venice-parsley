import { Container } from '@/components/layout/container'
import { createServerAuthClient } from '@/lib/supabase-server'
import { getServerLanguage } from '@/lib/server-i18n'
import { getLocalizedContent, getLocalizedTitle } from '@/lib/i18n-content'

export default async function HowToGetHerePage() {
  const supabase = await createServerAuthClient()
  const lang = await getServerLanguage()

  // Fetch the menu item for /how-to-get-here
  const { data: menuItem } = await supabase
    .from('menu_items')
    .select('*')
    .eq('href', '/how-to-get-here')
    .eq('is_active', true)
    .single()

  const content = getLocalizedContent(menuItem?.content, lang)
  const title = getLocalizedTitle(menuItem?.title, lang) || 'How to Get Here'

  return (
    <Container spacing="xxl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 animate-title">
          {title}
        </h1>
        {menuItem?.image_url && (
          <div className="mb-8 animate-title-delay-1">
            <img
              src={menuItem.image_url}
              alt={title}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        {content ? (
          <div
            className="text-lg text-gray-600 font-mulish leading-8 max-w-4xl animate-title-delay-1"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No content has been added yet.</p>
          </div>
        )}
      </div>
    </Container>
  )
}
