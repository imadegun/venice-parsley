import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          
          {/* Quick Links - Align Left */}
          <div className="flex-1">
            <h3 className="font-semibold mb-4 text-left">Information</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>CA' ASIA (II° piano) CIR : 027042-LOC-15600- CIN : IT027042C2ADIO77EW</li>
              <li>CA' TERA' (I° piano) CIR : 027042-LOC-13278 - CIN : IT027042C29WMT6NPE</li>
              <li>CA' BIRI (I° piano) CIR : 027042-LOC-13277 - CIN : IT027042C2BPV9VAZQ</li>
                             
            </ul>
          </div>
          
          
          {/* Contact - Align Right */}
          <div className="flex-1 text-right">
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Rio Terà dei Biri o del Parsemolo, 5384,</li>
              <li>30121 Venezia VE, Italy</li>             
              <li>E-mail info@veniceparsley.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Venice Parsley. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}