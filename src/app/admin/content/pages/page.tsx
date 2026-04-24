'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { UnifiedImageManager } from '@/components/admin/unified-image-manager'
import { Edit, Save, FileText, MapPin, Image as ImageIcon } from 'lucide-react'

interface MenuItem {
  id: string
  title?: {en?: string, it?: string} | null
  href: string
  is_active: boolean
  sort_order: number
  content?: {en?: string, it?: string} | string | null
  map_embed?: string | null
  image_url?: string | null
}

export default function MenuPagesManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  // Bilingual content states
  const [contentEn, setContentEn] = useState('')
  const [contentIt, setContentIt] = useState('')
  const [mapEmbed, setMapEmbed] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu')
      if (response.ok) {
        const data = await response.json()
        // Filter out system pages that should not be edited here
        const nonEditablePaths = ['/apartments', '/login', '/register', '/admin']
        const editableItems = data.filter((item: MenuItem) =>
          item.is_active && !nonEditablePaths.includes(item.href)
        )
        setMenuItems(editableItems)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditContent = (item: MenuItem) => {
    setSelectedItem(item)
    
    // Parse content - could be JSON string with {en, it} or plain string
    let enContent = ''
    let itContent = ''
    
    if (item.content) {
      if (typeof item.content === 'string') {
        try {
          const parsed = JSON.parse(item.content)
          enContent = parsed.en || ''
          itContent = parsed.it || ''
        } catch {
          enContent = item.content
        }
      } else if (typeof item.content === 'object') {
        enContent = item.content.en || ''
        itContent = item.content.it || ''
      }
    }
    
    setContentEn(enContent)
    setContentIt(itContent)
    setMapEmbed(item.map_embed || '')
    setImageUrl(item.image_url || '')
    setDialogOpen(true)
  }

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    // Store content as JSON with en/it keys
    const contentValue = JSON.stringify({
      en: contentEn,
      it: contentIt
    })

    try {
      const response = await fetch(`/api/admin/menu/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          href: selectedItem.href,
          is_active: selectedItem.is_active,
          sort_order: selectedItem.sort_order,
          content: contentValue,
          map_embed: mapEmbed,
          image_url: imageUrl,
        })
      })

      if (response.ok) {
        await fetchMenuItems()
        setDialogOpen(false)
        setSelectedItem(null)
        setContentEn('')
        setContentIt('')
        setMapEmbed('')
        setImageUrl('')
      }
    } catch (error) {
      console.error('Error saving page content:', error)
    }
  }

  if (loading) {
    return <div>Loading menu items...</div>
  }

  return (
    <div className="space-y-8 py-8">
      <div className="animate-title">
        <h1 className="text-3xl font-bold text-gray-900">Menu Page Content</h1>
        <p className="text-gray-600 mt-2">
          Manage page content for each navigation menu item. Enter content in both English and Italian.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{item.title?.en || 'Untitled'}</div>
                  <div className="text-sm text-gray-500">URL: {item.href}</div>
                   <div className="flex flex-wrap gap-2 mt-1">
                     {item.content && (
                       <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                         Content ✓
                       </span>
                     )}
                     {item.image_url && (
                       <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                         Image ✓
                       </span>
                     )}
                     {item.map_embed && (
                       <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                         Map ✓
                       </span>
                     )}
                   </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditContent(item)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Content
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0" style={{ width: '80vw', maxWidth: '1400px', minWidth: '800px' }}>
            <DialogHeader className="px-8 pt-8 pb-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                Edit Page Content: {selectedItem?.title?.en || 'Page'}
              </DialogTitle>
            </DialogHeader>
            <div className="px-8 pb-8">
              <form onSubmit={saveContent} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <p className="text-sm text-gray-600">Enter content in both English and Italian</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="en" className="w-full flex flex-col">
                      <TabsList className="w-full mb-6 h-12 bg-muted/50">
                        <TabsTrigger value="en" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          English
                        </TabsTrigger>
                        <TabsTrigger value="it" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Italian
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="en" className="space-y-4 min-h-[400px]">
                        <MarkdownEditor
                          value={contentEn}
                          onChange={setContentEn}
                          placeholder="Enter English page content..."
                          rows={20}
                        />
                      </TabsContent>

                      <TabsContent value="it" className="space-y-4 min-h-[400px]">
                        <MarkdownEditor
                          value={contentIt}
                          onChange={setContentIt}
                          placeholder="Inserisci il contenuto della pagina in italiano..."
                          rows={20}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Page Image</CardTitle>
                    <p className="text-sm text-gray-600">Upload a hero image for this page</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <UnifiedImageManager
                      value={{ images: imageUrl ? [imageUrl] : [], mainImageIndex: 0 }}
                      slug={`page-${selectedItem?.href?.replace('/', '') || 'page'}`}
                      onChange={(data) => setImageUrl(data.images[0] || '')}
                      maxFiles={1}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location Map</CardTitle>
                    <p className="text-sm text-gray-600">Optional Google Maps embed for location display</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItem?.href === '/about' && (
                      <p className="text-sm text-orange-600">Not available for About page</p>
                    )}
                    <Textarea
                      id="map_embed"
                      value={mapEmbed}
                      onChange={(e) => setMapEmbed(e.target.value)}
                      placeholder={selectedItem?.href === '/about'
                        ? "Map feature is not available for the About page"
                        : "Paste Google Maps embed iframe code..."
                      }
                      className="min-h-[80px] font-mono text-sm w-full"
                      disabled={selectedItem?.href === '/about'}
                      readOnly={selectedItem?.href === '/about'}
                    />
                    {selectedItem?.href !== '/about' && (
                      <p className="text-sm text-muted-foreground">
                        Paste a Google Maps embed iframe for location display.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Content
                  </Button>
                </div>
              </form>
            </div>
         </DialogContent>
       </Dialog>
    </div>
  )
}
