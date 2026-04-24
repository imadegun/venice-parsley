import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Information</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/apartments" className="hover:text-white">CIR : 027042-LOC-15600</Link></li>
              <li><Link href="/apartments?type=artistic-studio" className="hover:text-white">CIN : IT027042C2ADIO77EW</Link></li>
                            
            </ul>
          </div>
         

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Venice, Italy</li>
              <li>info@veniceparsley.com</li>
              <li>+39 123 456 7890</li>
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