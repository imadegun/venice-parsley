'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedImageManager } from '@/components/admin/unified-image-manager'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { homepageContentSchema } from '@/lib/content-schema'
import { getContentSectionForAdmin, upsertDraftContentSection, publishContentSection } from '@/lib/content-service'
import { defaultHomepageContent } from '@/lib/content'
import { Home, Image as ImageIcon, FileText, Save, Globe } from 'lucide-react'

export default function HomeContentManagement() {
  const router = useRouter()
  const [payload, setPayload] = useState(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const [heroImages, setHeroImages] = useState({ images: [] as string[], mainImageIndex: 0 })

  const [heroTitleEn, setHeroTitleEn] = useState('')
  const [heroTitleIt, setHeroTitleIt] = useState('')
  const [heroSubtitleEn, setHeroSubtitleEn] = useState('')
  const [heroSubtitleIt, setHeroSubtitleIt] = useState('')
  const [heroCtaEn, setHeroCtaEn] = useState('')
  const [heroCtaIt, setHeroCtaIt] = useState('')
  const [featuredTitleEn, setFeaturedTitleEn] = useState('')
  const [featuredTitleIt, setFeaturedTitleIt] = useState('')
  const [featuredDescriptionEn, setFeaturedDescriptionEn] = useState('')
  const [featuredDescriptionIt, setFeaturedDescriptionIt] = useState('')
  const [aboutTitleEn, setAboutTitleEn] = useState('')
  const [aboutTitleIt, setAboutTitleIt] = useState('')
  const [aboutContentEn, setAboutContentEn] = useState('')
  const [aboutContentIt, setAboutContentIt] = useState('')
  const [introTaglineEn, setIntroTaglineEn] = useState('')
  const [introTaglineIt, setIntroTaglineIt] = useState('')
  const [introTitleEn, setIntroTitleEn] = useState('')
  const [introTitleIt, setIntroTitleIt] = useState('')
  const [introDescriptionEn, setIntroDescriptionEn] = useState('')
  const [introDescriptionIt, setIntroDescriptionIt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (payload.hero) {
      setHeroTitleEn(payload.hero.title?.en || '')
      setHeroTitleIt(payload.hero.title?.it || '')
      setHeroSubtitleEn(payload.hero.subtitle?.en || '')
      setHeroSubtitleIt(payload.hero.subtitle?.it || '')
      setHeroCtaEn(payload.hero.ctaText?.en || '')
      setHeroCtaIt(payload.hero.ctaText?.it || '')
      setHeroImages({
        images: payload.hero.backgroundImages || [],
        mainImageIndex: 0
      })
    }
    if (payload.featured) {
      setFeaturedTitleEn(payload.featured.title?.en || '')
      setFeaturedTitleIt(payload.featured.title?.it || '')
      setFeaturedDescriptionEn(payload.featured.description?.en || '')
      setFeaturedDescriptionIt(payload.featured.description?.it || '')
    }
    if (payload.about) {
      setAboutTitleEn(payload.about.title?.en || '')
      setAboutTitleIt(payload.about.title?.it || '')
      setAboutContentEn(payload.about.content?.en || '')
      setAboutContentIt(payload.about.content?.it || '')
    }
    if (payload.intro) {
      setIntroTaglineEn(payload.intro.tagline?.en || '')
      setIntroTaglineIt(payload.intro.tagline?.it || '')
      setIntroTitleEn(payload.intro.title?.en || '')
      setIntroTitleIt(payload.intro.title?.it || '')
      setIntroDescriptionEn(payload.intro.description?.en || '')
      setIntroDescriptionIt(payload.intro.description?.it || '')
    } else {
      const defaultIntro = defaultHomepageContent.intro || {
        tagline: { en: '', it: '' },
        title: { en: '', it: '' },
        description: { en: '', it: '' }
      }
      setIntroTaglineEn(defaultIntro.tagline.en)
      setIntroTaglineIt(defaultIntro.tagline.it)
      setIntroTitleEn(defaultIntro.title.en)
      setIntroTitleIt(defaultIntro.title.it)
      setIntroDescriptionEn(defaultIntro.description.en)
      setIntroDescriptionIt(defaultIntro.description.it)
    }
    setMetaTitle('Venice Parcley - Luxury Artistic Apartments')
    setMetaDescription('Discover unique artistic apartments in Venice. Creative souls, and discerning travelers.')
  }, [payload])

  async function checkAuth() {
    const user = await getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const role = await getUserRole(user.id)
    if (!['admin', 'administrator'].includes(role)) {
      router.push('/')
      return
    }

    await loadContent()
  }

  async function loadContent() {
    try {
      const section = await getContentSectionForAdmin('homepage')
      const data = (section?.payload as typeof defaultHomepageContent | undefined) ?? defaultHomepageContent
      setPayload(data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const contentPayload = {
      hero: {
        title: { en: heroTitleEn, it: heroTitleIt },
        subtitle: { en: heroSubtitleEn, it: heroSubtitleIt },
        ctaText: { en: heroCtaEn, it: heroCtaIt },
        backgroundImages: heroImages.images,
      },
      featured: {
        title: { en: featuredTitleEn, it: featuredTitleIt },
        description: { en: featuredDescriptionEn, it: featuredDescriptionIt },
      },
      about: {
        title: { en: aboutTitleEn, it: aboutTitleIt },
        content: { en: aboutContentEn, it: aboutContentIt },
      },
      intro: {
        tagline: { en: introTaglineEn, it: introTaglineIt },
        title: { en: introTitleEn, it: introTitleIt },
        description: { en: introDescriptionEn, it: introDescriptionIt },
      },
    }

    const parsed = homepageContentSchema.safeParse(contentPayload)
    if (!parsed.success) {
      alert('Validation failed: ' + (parsed.error.issues[0]?.message || 'Invalid data'))
      setSaving(false)
      return
    }

    try {
      const user = await getUser()
      await upsertDraftContentSection({
        key: 'homepage',
        payload: parsed.data,
        updatedBy: user?.id,
      })
      await loadContent()
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const user = await getUser()
      await publishContentSection({
        key: 'homepage',
        publishedBy: user?.id,
      })
      await loadContent()
      alert('Content published successfully!')
    } catch (error) {
      console.error('Failed to publish:', error)
      alert('Failed to publish: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading content...</div>
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between animate-title">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Content</h1>
          <p className="text-gray-600 mt-2">
            Manage the content displayed on your homepage.
          </p>
        </div>
        <Button onClick={handlePublish} variant="outline" disabled={publishing}>
          {publishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="max-w-6xl mx-auto w-full space-y-6">
        <Tabs defaultValue="hero" className="w-full flex flex-col">
          <TabsList className="w-full mb-6 h-12 bg-muted/50">
            <TabsTrigger value="hero" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="intro" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Intro
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Home className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Globe className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

           <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <p className="text-sm text-gray-600">Configure the main hero banner content</p>
              </CardHeader>
               <CardContent className="space-y-6">
                 <Tabs defaultValue="en" className="w-full flex flex-col">
                   <TabsList className="w-full mb-6 h-12 bg-muted/50">
                     <TabsTrigger value="en" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       English
                     </TabsTrigger>
                     <TabsTrigger value="it" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       Italian
                     </TabsTrigger>
                   </TabsList>

                   <TabsContent value="en" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="heroTitleEn">Title</Label>
                       <Input
                         id="heroTitleEn"
                         value={heroTitleEn}
                         onChange={e => setHeroTitleEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="heroSubtitleEn">Subtitle</Label>
                       <Textarea
                         id="heroSubtitleEn"
                         value={heroSubtitleEn}
                         onChange={e => setHeroSubtitleEn(e.target.value)}
                         className="mt-1"
                         rows={3}
                       />
                     </div>
                     <div>
                       <Label htmlFor="heroCtaEn">Call-to-Action Text</Label>
                       <Input
                         id="heroCtaEn"
                         value={heroCtaEn}
                         onChange={e => setHeroCtaEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                   </TabsContent>

                   <TabsContent value="it" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="heroTitleIt">Title</Label>
                       <Input
                         id="heroTitleIt"
                         value={heroTitleIt}
                         onChange={e => setHeroTitleIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="heroSubtitleIt">Subtitle</Label>
                       <Textarea
                         id="heroSubtitleIt"
                         value={heroSubtitleIt}
                         onChange={e => setHeroSubtitleIt(e.target.value)}
                         className="mt-1"
                         rows={3}
                       />
                     </div>
                     <div>
                       <Label htmlFor="heroCtaIt">Call-to-Action Text</Label>
                       <Input
                         id="heroCtaIt"
                         value={heroCtaIt}
                         onChange={e => setHeroCtaIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                   </TabsContent>
                 </Tabs>
                <div>
                  <Label>Hero Background Images</Label>
                  <div className="mt-2">
                    <UnifiedImageManager
                      value={heroImages}
                      slug="homepage-hero"
                      onChange={setHeroImages}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="intro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intro Section</CardTitle>
                <p className="text-sm text-gray-600">Configure the introductory text displayed below the hero</p>
              </CardHeader>
               <CardContent className="space-y-6">
                 <Tabs defaultValue="en" className="w-full flex flex-col">
                   <TabsList className="w-full mb-6 h-12 bg-muted/50">
                     <TabsTrigger value="en" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       English
                     </TabsTrigger>
                     <TabsTrigger value="it" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       Italian
                     </TabsTrigger>
                   </TabsList>

                   <TabsContent value="en" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="introTaglineEn">Tagline (uppercase)</Label>
                       <Input
                         id="introTaglineEn"
                         value={introTaglineEn}
                         onChange={e => setIntroTaglineEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="introTitleEn">Title</Label>
                       <Input
                         id="introTitleEn"
                         value={introTitleEn}
                         onChange={e => setIntroTitleEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="introDescriptionEn">Description</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={introDescriptionEn}
                           onChange={setIntroDescriptionEn}
                           placeholder="Enter introduction description (English)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>

                   <TabsContent value="it" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="introTaglineIt">Tagline (uppercase)</Label>
                       <Input
                         id="introTaglineIt"
                         value={introTaglineIt}
                         onChange={e => setIntroTaglineIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="introTitleIt">Title</Label>
                       <Input
                         id="introTitleIt"
                         value={introTitleIt}
                         onChange={e => setIntroTitleIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="introDescriptionIt">Description</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={introDescriptionIt}
                           onChange={setIntroDescriptionIt}
                           placeholder="Inserisci descrizione introduzione (Italiano)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>
                 </Tabs>
               </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Apartments Section</CardTitle>
                <p className="text-sm text-gray-600">Configure the featured apartments display</p>
              </CardHeader>
               <CardContent className="space-y-6">
                 <Tabs defaultValue="en" className="w-full flex flex-col">
                   <TabsList className="w-full mb-6 h-12 bg-muted/50">
                     <TabsTrigger value="en" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       English
                     </TabsTrigger>
                     <TabsTrigger value="it" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       Italian
                     </TabsTrigger>
                   </TabsList>

                   <TabsContent value="en" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="featuredTitleEn">Section Title</Label>
                       <Input
                         id="featuredTitleEn"
                         value={featuredTitleEn}
                         onChange={e => setFeaturedTitleEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="featuredDescriptionEn">Section Description</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={featuredDescriptionEn}
                           onChange={setFeaturedDescriptionEn}
                           placeholder="Enter featured section description (English)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>

                   <TabsContent value="it" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="featuredTitleIt">Section Title</Label>
                       <Input
                         id="featuredTitleIt"
                         value={featuredTitleIt}
                         onChange={e => setFeaturedTitleIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="featuredDescriptionIt">Section Description</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={featuredDescriptionIt}
                           onChange={setFeaturedDescriptionIt}
                           placeholder="Inserisci descrizione sezione featured (Italiano)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>
                 </Tabs>
               </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <p className="text-sm text-gray-600">Configure the about section content</p>
              </CardHeader>
               <CardContent className="space-y-6">
                 <Tabs defaultValue="en" className="w-full flex flex-col">
                   <TabsList className="w-full mb-6 h-12 bg-muted/50">
                     <TabsTrigger value="en" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       English
                     </TabsTrigger>
                     <TabsTrigger value="it" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                       Italian
                     </TabsTrigger>
                   </TabsList>

                   <TabsContent value="en" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="aboutTitleEn">About Title</Label>
                       <Input
                         id="aboutTitleEn"
                         value={aboutTitleEn}
                         onChange={e => setAboutTitleEn(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="aboutContentEn">About Content</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={aboutContentEn}
                           onChange={setAboutContentEn}
                           placeholder="Enter about content (English)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>

                   <TabsContent value="it" className="space-y-4 min-h-[400px]">
                     <div>
                       <Label htmlFor="aboutTitleIt">About Title</Label>
                       <Input
                         id="aboutTitleIt"
                         value={aboutTitleIt}
                         onChange={e => setAboutTitleIt(e.target.value)}
                         className="mt-1"
                       />
                     </div>
                     <div>
                       <Label htmlFor="aboutContentIt">About Content</Label>
                       <div className="mt-1">
                         <MarkdownEditor
                           value={aboutContentIt}
                           onChange={setAboutContentIt}
                           placeholder="Inserisci contenuto about (Italiano)..."
                           rows={20}
                         />
                       </div>
                     </div>
                   </TabsContent>
                 </Tabs>
               </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="seo" className="space-y-6 min-h-[200px]">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
