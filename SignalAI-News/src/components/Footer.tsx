import React from 'react';
import { ExternalLink, Heart, Globe, Shield, Users, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { translations, currentLanguage } = useLanguage();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    journalism: [
      { name: 'Journalist Network', href: '/social' },
      { name: 'Verification', href: '#' },
      { name: 'Ethics Guidelines', href: '#' },
      { name: 'Safety Resources', href: '#' }
    ],
    platform: [
      { name: 'How it Works', href: '#' },
      { name: 'SignalAI Points', href: '#' },
      { name: 'API Access', href: '#' },
      { name: 'Mobile App', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR Compliance', href: '#' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-600 p-2 rounded">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">SignalAI News</h3>
                <p className="text-gray-400 text-sm">Global Journalism Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering journalists and citizens worldwide to share news, exchange information, 
              and raise their voices without fear. Building a transparent, secure platform for 
              global journalism.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                <span>10M+ Users</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>1000+ Journalists</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Journalism Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Journalism</h4>
            <ul className="space-y-2">
              {footerLinks.journalism.map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-wrap items-center justify-center space-x-6 mb-4">
            {footerLinks.legal.map(link => (
              <a 
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2 md:mb-0">
              <span>© 2025 SignalAI News. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Powered by</span>
              <a 
                href="http://SignalAIstudio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                <Heart className="w-4 h-4" />
                <span>SignalAI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;