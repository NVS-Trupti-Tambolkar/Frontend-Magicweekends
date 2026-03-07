// Footer.jsx
import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-yellow-400 transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-400 transition-colors">About Us</a></li>
              <li><a href="/tours" className="hover:text-yellow-400 transition-colors">Tours</a></li>
              <li><a href="/destinations" className="hover:text-yellow-400 transition-colors">Destinations</a></li>
              <li><a href="/gallery" className="hover:text-yellow-400 transition-colors">Gallery</a></li>
              <li><a href="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 2: Policies */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">POLICIES</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-yellow-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="/cancellation" className="hover:text-yellow-400 transition-colors">Cancellation Policy</a></li>
              <li><a href="/refund" className="hover:text-yellow-400 transition-colors">Refund Policy</a></li>
              <li><a href="/shipping" className="hover:text-yellow-400 transition-colors">Shipping Policy</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">CONTACT US</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-yellow-400" />
                <span>123 Travel Street, Mumbai, Maharashtra 400001</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-3 text-yellow-400" />
                <a href="tel:+911234567890" className="hover:text-yellow-400 transition-colors">+91 12345 67890</a>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-3 text-yellow-400" />
                <a href="mailto:magicweekends@gmail.com" className="hover:text-yellow-400 transition-colors">
                  magicweekends@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media & Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-yellow-400">FOLLOW US</h3>
            <div className="flex space-x-4 mb-6">
              <a href="https://facebook.com" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-all">
                <FaFacebook size={20} />
              </a>
              <a href="https://instagram.com" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-all">
                <FaInstagram size={20} />
              </a>
              <a href="https://twitter.com" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-400 hover:text-gray-900 transition-all">
                <FaTwitter size={20} />
              </a>
            </div>

            {/* <h3 className="text-xl font-bold mb-4 text-yellow-400">NEWSLETTER</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-r-lg font-bold hover:bg-yellow-500 transition-colors">
                Subscribe
              </button>
            </div> */}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left: Copyright */}
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Magic Weekends. All rights reserved.
            </p>
          </div>

          {/* Middle: Additional Links (from image) */}
          <div className="mb-4 md:mb-0">
            <div className="flex flex-wrap justify-center gap-4 text-gray-400">
              {/* <a href="/about" className="hover:text-yellow-400 transition-colors">About Us</a> */}
              <a href="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</a>
              <a href="/cancellation" className="hover:text-yellow-400 transition-colors">Cancellation Policy</a>
              <a href="/terms" className="hover:text-yellow-400 transition-colors">Terms & Conditions</a>
            </div>
          </div>

          {/* Right: Tours Link and Powered By */}
          <div className="text-center md:text-right">
            <a
              href="https://www.Maharashtragadkille.Com/Collections/Tours"
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-bold block mb-2"
            >
              Explore Our Tours
            </a>
            <p className="text-gray-400 text-sm">
              Online booking system by Vacation Labs |© 2025, Maharashtra Gadkille
            </p>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer;