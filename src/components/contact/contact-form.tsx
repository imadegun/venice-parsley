'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, CheckCircle, AlertCircle, Loader2, Mail, User, Phone, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'

interface ContactFormProps {
  language?: 'en' | 'it'
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export default function ContactForm({ language = 'en' }: ContactFormProps) {
  const { language: currentLang } = useLanguage()
  const router = useRouter()
  const lang = language || (currentLang as 'en' | 'it')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
   
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [countdown, setCountdown] = useState(3)

  // Countdown and redirect on success
  useEffect(() => {
    if (submitStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    if (submitStatus === 'success' && countdown === 0) {
      router.push('/')
    }
  }, [submitStatus, countdown, router])

  const translations = {
    en: {
      title: 'Send Us a Message',
      description: 'Fill out the form below and we\'ll get back to you as soon as possible.',
      name: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      phone: 'Phone Number (Optional)',
      phonePlaceholder: 'Enter your phone number',
      subject: 'Subject (Optional)',
      subjectPlaceholder: 'What is this about?',
      message: 'Your Message',
      messagePlaceholder: 'Tell us how we can help you...',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Message sent successfully! We\'ll get back to you soon.',
      error: 'Failed to send message. Please try again.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address'
    },
    it: {
      title: 'Inviaci un Messaggio',
      description: 'Compila il modulo sottostante e ti risponderemo il prima possibile.',
      name: 'Nome Completo',
      namePlaceholder: 'Inserisci il tuo nome completo',
      email: 'Indirizzo Email',
      emailPlaceholder: 'Inserisci la tua email',
      phone: 'Numero di Telefono (Opzionale)',
      phonePlaceholder: 'Inserisci il tuo numero di telefono',
      subject: 'Oggetto (Opzionale)',
      subjectPlaceholder: 'Di cosa si tratta?',
      message: 'Il Tuo Messaggio',
      messagePlaceholder: 'Dicci come possiamo aiutarti...',
      submit: 'Invia Messaggio',
      submitting: 'Invio in corso...',
      success: 'Messaggio inviato con successo! Ti risponderemo presto.',
      error: 'Impossibile inviare il messaggio. Riprova.',
      required: 'Questo campo è obbligatorio',
      invalidEmail: 'Inserisci un indirizzo email valido'
    }
  }

  const t = translations[lang]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t.required
    }

    if (!formData.email.trim()) {
      newErrors.email = t.required
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t.invalidEmail
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = t.required
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language: lang
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || t.error)
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(t.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (submitStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              {lang === 'it' ? 'Grazie per il tuo messaggio!' : 'Thank you for your message!'}
            </h3>
            <p className="text-green-700 mb-4">
              {lang === 'it' 
                ? 'Ti risponderemo al più presto.' 
                : 'We will contact you soon.'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {lang === 'it' 
                ? `Reindirizzamento alla home in ${countdown}...` 
                : `Redirecting to home in ${countdown}...`}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-100 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#454B44] to-[#2d362c] flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{t.title}</CardTitle>
        </div>
        <p className="text-gray-600">{t.description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.name} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.namePlaceholder}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t.email} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t.phone}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.phonePlaceholder}
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              {t.subject}
            </Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={t.subjectPlaceholder}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t.message} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t.messagePlaceholder}
              rows={5}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-[#454B44] to-[#2d362c] hover:text-yellow-300  text-white font-medium py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t.submit}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
