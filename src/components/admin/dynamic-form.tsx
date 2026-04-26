'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUploader } from './image-uploader'
import { UnifiedImageManager } from './unified-image-manager'
import { MarkdownEditor } from './markdown-editor'
import { LucideIcon } from 'lucide-react'

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'markdown' | 'images' | 'unified-images' | 'multilang-text' | 'multilang-textarea' | 'multilang-markdown'

interface Field {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  disabled?: boolean
  tab?: string // Which tab this field belongs to
}

interface TabConfig {
  key: string
  label: string
  icon?: LucideIcon
}

interface LanguageConfig {
  code: string
  label: string
  flag?: string
}

interface DynamicFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void
  fields: Field[]
  initialValues?: Record<string, unknown>
  title?: string
  submitText?: string
  loading?: boolean
  editItem?: Record<string, unknown>
  tabs?: TabConfig[] // Optional tabs configuration
  useTabs?: boolean // Whether to use the new tabbed layout
  languages?: LanguageConfig[] // Dynamic language configuration
}

export function DynamicForm({
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialValues = {},
  title = 'Add Item',
  submitText = 'Save',
  loading = false,
  editItem,
  tabs = [],
  useTabs = false,
  languages = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italian' }
  ],
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({})

  const toSlug = (input: string) =>
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  useEffect(() => {
    if (isOpen) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        const processedValues: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(initialValues)) {
          const field = fields.find(f => f.name === key)
          if (field && (field.type === 'multilang-text' || field.type === 'multilang-textarea' || field.type === 'multilang-markdown')) {
            if (typeof value === 'string') {
              processedValues[key] = { en: value, it: '' }
            } else if (value && typeof value === 'object' && 'en' in value) {
              processedValues[key] = value
            } else {
              processedValues[key] = { en: '', it: '' }
            }
          } else {
            processedValues[key] = value
          }
        }
        setValues(processedValues)
      } else {
        setValues({})
      }
    }
  }, [initialValues, isOpen, fields])

  const handleChange = (name: string, value: unknown) => {
    setValues(prev => {
      const next = { ...prev }

      // Handle nested field names (like "name.en")
      if (name.includes('.')) {
        const [baseName, lang] = name.split('.')
        const baseValue = prev[baseName]
        next[baseName] = {
          ...(typeof baseValue === 'object' && baseValue ? baseValue : {}),
          [lang]: value
        }
      } else {
        next[name] = value
      }

      const hasNameField = fields.some((field) => field.name === 'name')
      const hasSlugField = fields.some((field) => field.name === 'slug')

      // Auto-generate slug when name changes
      if ((name === 'name' || name.startsWith('name.')) && hasNameField && hasSlugField) {
        const nameValue = typeof next.name === 'object' && next.name && 'en' in next.name
          ? (next.name as { en: string }).en
          : String(next.name ?? '')
        next.slug = toSlug(nameValue)
      }

      return next
    })
  }

  // Group fields by tabs for the new layout
  const getFieldsByTab = () => {
    if (!useTabs) return { default: fields }

    const grouped: Record<string, Field[]> = {}
    fields.forEach(field => {
      const tabKey = field.tab || 'basic'
      if (!grouped[tabKey]) grouped[tabKey] = []
      grouped[tabKey].push(field)
    })
    return grouped
  }

  const fieldsByTab = getFieldsByTab()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(values)
  }

  const renderField = (field: Field) => {
    // Handle modified field names for multilingual fields in tabs
    let fieldName = field.name
    let fieldValue = values[field.name]

    // If the field name contains a dot (like "name.en"), extract the base field and language
    if (field.name.includes('.')) {
      const [baseName, lang] = field.name.split('.')
      fieldName = baseName
      const baseValue = values[baseName]
      fieldValue = typeof baseValue === 'object' && baseValue && lang in baseValue
        ? (baseValue as Record<string, unknown>)[lang]
        : ''
    }

    const value = fieldValue

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            disabled={field.disabled}
          />
        )

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            rows={5}
            disabled={field.disabled}
          />
        )

      case 'markdown':
        return (
          <MarkdownEditor
            value={String(value ?? '')}
            onChange={(val) => handleChange(field.name, val)}
            placeholder={field.placeholder}
            rows={8}
          />
        )

      case 'multilang-text':
        const multilangTextValue = (value as { en?: string; it?: string } | undefined) || { en: '', it: '' }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1">English</Label>
              <Input
                placeholder={`${field.placeholder || field.label} (English)`}
                value={multilangTextValue.en || ''}
                onChange={(e) => handleChange(field.name, { ...multilangTextValue, en: e.target.value })}
                disabled={field.disabled}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Italian</Label>
              <Input
                placeholder={`${field.placeholder || field.label} (Italian)`}
                value={multilangTextValue.it || ''}
                onChange={(e) => handleChange(field.name, { ...multilangTextValue, it: e.target.value })}
                disabled={field.disabled}
              />
            </div>
          </div>
        )

      case 'multilang-textarea':
        const multilangTextareaValue = (value as { en?: string; it?: string } | undefined) || { en: '', it: '' }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1">English</Label>
              <Textarea
                placeholder={`${field.placeholder || field.label} (English)`}
                value={multilangTextareaValue.en || ''}
                onChange={(e) => handleChange(field.name, { ...multilangTextareaValue, en: e.target.value })}
                rows={3}
                disabled={field.disabled}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Italian</Label>
              <Textarea
                placeholder={`${field.placeholder || field.label} (Italian)`}
                value={multilangTextareaValue.it || ''}
                onChange={(e) => handleChange(field.name, { ...multilangTextareaValue, it: e.target.value })}
                rows={3}
                disabled={field.disabled}
              />
            </div>
          </div>
        )

      case 'multilang-markdown':
        const multilangMarkdownValue = (value as { en?: string; it?: string } | undefined) || { en: '', it: '' }
        return (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1">English</Label>
              <MarkdownEditor
                value={multilangMarkdownValue.en || ''}
                onChange={(val) => handleChange(field.name, { ...multilangMarkdownValue, en: val })}
                placeholder={`${field.placeholder || field.label} (English)`}
                rows={6}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Italian</Label>
              <MarkdownEditor
                value={multilangMarkdownValue.it || ''}
                onChange={(val) => handleChange(field.name, { ...multilangMarkdownValue, it: val })}
                placeholder={`${field.placeholder || field.label} (Italian)`}
                rows={6}
              />
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            disabled={field.disabled}
            className="h-4 w-4 rounded border-gray-300"
          />
        )

      case 'select':
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={field.disabled}
          >
              <SelectTrigger>
                <SelectValue>{field.placeholder || 'Select...'}</SelectValue>
              </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'images':
        return (
          <ImageUploader
            value={Array.isArray(value) ? value : []}
            onChange={(urls) => handleChange(field.name, urls)}
          />
        )

      case 'unified-images':
        return (
          <UnifiedImageManager
            value={value as { images: string[], mainImageIndex: number } || { images: [], mainImageIndex: 0 }}
            slug={String(values.slug ?? (typeof values.name === 'object' && values.name && 'en' in values.name ? values.name.en : values.name) ?? '')}
            onChange={(data) => handleChange(field.name, data)}
          />
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 max-w-6xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className={useTabs ? "max-w-6xl mx-auto w-full space-y-6" : "space-y-6"}>
            {useTabs ? (
              <Tabs defaultValue={tabs[0]?.key || 'basic'} className="w-full flex flex-col">
                <TabsList className="w-full mb-6 h-12 bg-muted/50">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {tab.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent key={tab.key} value={tab.key} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{tab.label}</CardTitle>
                        <p className="text-sm text-gray-600">Configure {tab.label.toLowerCase()} settings</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {fieldsByTab[tab.key]?.map((field) => {
                          if (field.type === 'multilang-text' || field.type === 'multilang-textarea' || field.type === 'multilang-markdown') {
                            return (
                              <Tabs key={field.name} defaultValue={languages[0]?.code || 'en'} className="w-full flex flex-col">
                                <TabsList className="w-full mb-6 h-12 bg-muted/50">
                                  {languages.map((lang) => (
                                    <TabsTrigger
                                      key={lang.code}
                                      value={lang.code}
                                      className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                    >
                                      {lang.label}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>

                                {languages.map((lang) => (
                                  <TabsContent key={lang.code} value={lang.code} className="space-y-4 min-h-[400px]">
                                    <div>
                                      <Label htmlFor={`${field.name}-${lang.code}`}>{field.label} ({lang.label})</Label>
                                      {renderField({ ...field, name: `${field.name}.${lang.code}` })}
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            )
                          }

                          return (
                            <div key={field.name} className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              {renderField(field)}
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="max-w-6xl mx-auto w-full space-y-6">
                {fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : submitText}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
