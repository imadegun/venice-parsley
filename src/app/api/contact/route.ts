import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('Missing Resend API key')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// Debug: log API key presence (not the full key for security)
console.log('Resend API Key configured:', process.env.RESEND_API_KEY ? 'Yes (starts with: ' + process.env.RESEND_API_KEY.substring(0, 8) + '...)' : 'NO - Missing!')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, language } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailSubject = subject || `Contact Form: ${name}`
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Language:</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${language || 'en'}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 24px;">Message:</h3>
      <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
        ${message}
      </div>
    `

    // Send email using Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'veniceparsley@resend.dev'
    
    // console.log('Sending email from:', fromEmail)
    // console.log('Sending email to:', 'production@gayaceramic.com')

    const { data, error } = await getResend().emails.send({
      from: `Venice Parsley <${fromEmail}>`,
      to: ['kakguna1@gmail.com'],
      subject: emailSubject,
      html: emailBody,
      replyTo: email,
    })

    if (error) {
      console.error('Resend error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
