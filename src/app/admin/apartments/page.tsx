'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { createApartment, deleteApartment, updateApartment } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedImageManager } from '@/components/admin/unified-image-manager'
import { Plus, Building, Save, Trash2, Edit2, ArrowLeft, Image as ImageIcon, Info, DollarSign, Users } from 'lucide-react'

interface Apartment {
  id: string
  name: string | { en: string; it: string }
  slug: string
  category: string
  description: string | { en: string; it: string }
  short_description: string | { en: string; it: string } | null
  base_price_cents: number
  max_guests: number
  bedrooms: number
  size_sqm: number
  amenities: string[]
  gallery_images: string[]
  image_url: string
  stripe_payment_link_url?: string
}

interface ImageState {
  images: string[]
  mainImageIndex: number
}

export default function AdminApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [nameEn, setNameEn] = useState('')
  const [nameIt, setNameIt] = useState('')
  const [category, setCategory] = useState('')
  const [basePriceCents, setBasePriceCents] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [sizeSqm, setSizeSqm] = useState('')
  const [shortDescEn, setShortDescEn] = useState('')
  const [shortDescIt, setShortDescIt] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionIt, setDescriptionIt] = useState('')
  const [amenities, setAmenities] = useState('')
  const [stripePaymentLinkUrl, setStripePaymentLinkUrl] = useState('')
  const [galleryImages, setGalleryImages] = useState<ImageState>({ images: [], mainImageIndex: 0 })

  useEffect(() => {
    loadApartments()
  }, [])

  async function loadApartments() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })
    setApartments(data || [])
    setLoading(false)
  }

  function resetForm() {
    setNameEn('')
    setNameIt('')
    setCategory('')
    setBasePriceCents('')
    setMaxGuests('')
    setBedrooms('')
    setSizeSqm('')
    setShortDescEn('')
    setShortDescIt('')
    setDescriptionEn('')
    setDescriptionIt('')
    setAmenities('')
    setStripePaymentLinkUrl('')
    setGalleryImages({ images: [], mainImageIndex: 0 })
    setEditingApartment(null)
  }

  function handleAdd() {
    resetForm()
    setView('form')
  }

  function handleEdit(item: Apartment) {
    setEditingApartment(item)
    setNameEn(typeof item.name === 'object' ? item.name.en || '' : item.name || '')
    setNameIt(typeof item.name === 'object' ? item.name.it || '' : '')
    setCategory(item.category || '')
    setBasePriceCents(item.base_price_cents?.toString() || '')
    setMaxGuests(item.max_guests?.toString() || '')
    setBedrooms(item.bedrooms?.toString() || '')
    setSizeSqm(item.size_sqm?.toString() || '')
    setShortDescEn(typeof item.short_description === 'object' ? item.short_description.en || '' : item.short_description || '')
    setShortDescIt(typeof item.short_description === 'object' ? item.short_description.it || '' : '')
    setDescriptionEn(typeof item.description === 'object' ? item.description.en || '' : item.description || '')
    setDescriptionIt(typeof item.description === 'object' ? item.description.it || '' : '')
    setAmenities(item.amenities?.join(', ') || '')
    setStripePaymentLinkUrl(item.stripe_payment_link_url || '')
    setGalleryImages({
      images: item.gallery_images || [],
      mainImageIndex: Math.max(0, item.gallery_images?.findIndex(img => img === item.image_url) ?? 0)
    })
    setView('form')
  }

  function handleBackToList() {
    setView('list')
    resetForm()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const nameObj = { en: nameEn, it: nameIt }
      const shortDescObj = { en: shortDescEn, it: shortDescIt }
      const descObj = { en: descriptionEn, it: descriptionIt }
      const amenitiesArr = amenities.split(',').map(a => a.trim()).filter(Boolean)
      const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const values = {
        name: nameObj,
        slug,
        category,
        base_price_cents: parseInt(basePriceCents) || 0,
        max_guests: parseInt(maxGuests) || 1,
        bedrooms: parseInt(bedrooms) || 0,
        size_sqm: parseFloat(sizeSqm) || 0,
        short_description: shortDescObj,
        description: descObj,
        amenities: amenitiesArr,
        gallery_images: galleryImages.images,
        image_url: galleryImages.images[galleryImages.mainImageIndex] || '',
        stripe_payment_link_url: stripePaymentLinkUrl,
      }

      if (editingApartment) {
        await updateApartment({ id: editingApartment.id, ...values })
      } else {
        await createApartment(values)
      }

      await loadApartments()
      handleBackToList()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Apartment) {
    if (!confirm(`Are you sure you want to delete "${typeof item.name === 'object' ? item.name.en || item.name.it : item.name}"? This action cannot be undone.`)) return
    setDeleting(item.id)
    try {
      await deleteApartment(item.id)
      await loadApartments()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setDeleting(null)
    }
  }

  function getApartmentName(item: Apartment): string {
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name.en || item.name.it || 'Untitled'
    }
    return item.name || 'Untitled'
  }

  if (loading) {
    return <div className="p-8">Loading apartments...</div>
  }

  if (view === 'form') {
    return (
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="animate-title">
          <Button variant="ghost" onClick={handleBackToList} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apartments
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
          </h1>
          <p className="text-gray-600 mt-2">
            {editingApartment ? 'Update the apartment details below.' : 'Fill in the details to create a new apartment.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="max-w-4xl mx-auto w-full space-y-6">
          <Tabs defaultValue="details" className="w-full flex flex-col">
            <TabsList className="w-full mb-6 h-12 bg-muted/50">
              <TabsTrigger value="details" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="description" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Building className="h-4 w-4 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger value="images" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <p className="text-sm text-gray-600">Name, pricing, and capacity details</p>
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

                    <TabsContent value="en" className="space-y-4">
                      <div>
                        <Label htmlFor="nameEn">Apartment Name</Label>
                        <Input id="nameEn" value={nameEn} onChange={e => setNameEn(e.target.value)} className="mt-1" required />
                      </div>
                      <div>
                        <Label htmlFor="shortDescEn">Short Description</Label>
                        <Textarea id="shortDescEn" value={shortDescEn} onChange={e => setShortDescEn(e.target.value)} className="mt-1" rows={3} />
                      </div>
                    </TabsContent>

                    <TabsContent value="it" className="space-y-4">
                      <div>
                        <Label htmlFor="nameIt">Apartment Name (Italian)</Label>
                        <Input id="nameIt" value={nameIt} onChange={e => setNameIt(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="shortDescIt">Short Description (Italian)</Label>
                        <Textarea id="shortDescIt" value={shortDescIt} onChange={e => setShortDescIt(e.target.value)} className="mt-1" rows={3} />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1" placeholder="e.g., luxury, standard" />
                    </div>
                    <div>
                      <Label htmlFor="basePriceCents">Base Price (cents)</Label>
                      <Input id="basePriceCents" type="number" value={basePriceCents} onChange={e => setBasePriceCents(e.target.value)} className="mt-1" required />
                      {basePriceCents && (
                        <p className="text-xs text-gray-500 mt-1">€{(parseInt(basePriceCents) / 100).toFixed(2)} per night</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Input id="maxGuests" type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className="mt-1" required />
                    </div>
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input id="bedrooms" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="mt-1" required />
                    </div>
                    <div>
                      <Label htmlFor="sizeSqm">Size (sqm)</Label>
                      <Input id="sizeSqm" type="number" step="0.1" value={sizeSqm} onChange={e => setSizeSqm(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="amenities">Amenities (comma separated)</Label>
                      <Input id="amenities" value={amenities} onChange={e => setAmenities(e.target.value)} className="mt-1" placeholder="WiFi, AC, Kitchen" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stripeUrl">Stripe Payment Link URL</Label>
                    <Input id="stripeUrl" value={stripePaymentLinkUrl} onChange={e => setStripePaymentLinkUrl(e.target.value)} className="mt-1" placeholder="https://buy.stripe.com/..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Full Description</CardTitle>
                  <p className="text-sm text-gray-600">Detailed description of the apartment (supports Markdown)</p>
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

                    <TabsContent value="en" className="space-y-4 min-h-[300px]">
                      <div>
                        <Label htmlFor="descEn">Description (English)</Label>
                        <Textarea id="descEn" value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} className="mt-1 font-mono" rows={15} placeholder="Enter apartment description..." />
                      </div>
                    </TabsContent>

                    <TabsContent value="it" className="space-y-4 min-h-[300px]">
                      <div>
                        <Label htmlFor="descIt">Description (Italian)</Label>
                        <Textarea id="descIt" value={descriptionIt} onChange={e => setDescriptionIt(e.target.value)} className="mt-1 font-mono" rows={15} placeholder="Inserisci descrizione dell'appartamento..." />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images</CardTitle>
                  <p className="text-sm text-gray-600">Upload and manage apartment photos</p>
                </CardHeader>
                <CardContent>
                  <UnifiedImageManager
                    value={galleryImages}
                    slug={`apartment-${editingApartment?.id || 'new'}`}
                    onChange={setGalleryImages}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleBackToList}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : editingApartment ? 'Update Apartment' : 'Create Apartment'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-title">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apartments Management</h1>
          <p className="text-gray-600 mt-2">
            Create, update, and delete apartment inventory.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Apartment
        </Button>
      </div>

      {/* Apartments List */}
      {apartments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No apartments yet</h3>
            <p className="text-gray-600 mb-4">Click "Add Apartment" to create your first apartment.</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Apartment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {item.gallery_images && item.gallery_images.length > 0 ? (
                  <img
                    src={item.image_url || item.gallery_images[0]}
                    alt={getApartmentName(item)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {item.category && (
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{getApartmentName(item)}</h3>
                  {typeof item.short_description === 'object' ? (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.short_description.en || item.short_description.it || ''}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.short_description || ''}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    €{(item.base_price_cents / 100).toFixed(0)}/night
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {item.max_guests} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {item.bedrooms} bed{item.bedrooms !== 1 ? 's' : ''}
                  </span>
                </div>

                {item.size_sqm && (
                  <p className="text-xs text-gray-500">{item.size_sqm} m²</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
