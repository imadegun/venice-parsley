import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1b211a] text-white py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-row justify-between items-start gap-4 md:gap-8">
          
          {/* Quick Links - Align Left */}
          <div className="flex-1">
            <h3 className="font-semibold mb-2 md:mb-4 text-xs md:text-sm text-left">Accomodation Codes</h3>
            <ul className="space-y-1 md:space-y-2 text-[10px] md:text-sm text-gray-400">
              <li>CA' ASIA (II° piano) CIR : 027042-LOC-15600- CIN : IT027042C2ADIO77EW</li>
              <li>CA' TERA' (I° piano) CIR : 027042-LOC-18099 - CIN : IT027042B45YSIFS3T</li>
              <li>CA' BIRI (I° piano) CIR : 027042-LOC-18100 - CIN : IT027042B46ALFJXWZ</li>
                             
            </ul>
          </div>
          
          
          {/* Contact - Align Right */}
          <div className="flex-1 text-right">
            <h3 className="font-semibold mb-2 md:mb-4 text-xs md:text-sm">Contact</h3>
            <ul className="space-y-1 md:space-y-2 text-[10px] md:text-sm text-gray-400">
              <li>Rio Terà dei Biri o del Parsemolo, 5384,</li>
              <li>30121 Venezia VE, Italy</li>             
              <li>E-mail info@veniceparsley.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-3 md:mt-4 pt-3 md:pt-4 text-center text-[10px] md:text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Venice Parsley. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}