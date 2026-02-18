import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '../common/Container';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

/**
 * Footer Component
 * Contains links, contact info, and social media
 */
export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { name: t('common:home'), href: '/' },
        { name: t('common:products'), href: '/products' },
        { name: t('common:categories'), href: '/categories' },
        { name: t('common:aboutUs'), href: '/about' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Customer Service', href: '/customer-service' },
        { name: t('common:faq'), href: '/faq' },
        { name: t('common:support'), href: '/support' },
        { name: 'Return Policy', href: '/returns' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Legal', href: '/legal' },
        { name: t('common:termsAndConditions'), href: '/terms' },
        { name: t('common:privacyPolicy'), href: '/privacy' },
        { name: 'Shipping Policy', href: '/shipping' },
      ],
    },
  ];
  
  const contactInfo = [
    {
      icon: PhoneIcon,
      text: '+966 50 123 4567',
      href: 'tel:+966501234567',
    },
    {
      icon: EnvelopeIcon,
      text: 'info@chineseautoparts.sa',
      href: 'mailto:info@chineseautoparts.sa',
    },
    {
      icon: MapPinIcon,
      text: 'Riyadh, Saudi Arabia',
      href: '#',
    },
  ];
  
  return (
    <footer className="bg-gray-50 dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border mt-auto">
      <Container>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CA</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('common:appName')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-Powered platform for Chinese auto parts with intelligent search
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} {t('common:appName')}. All rights reserved.
            </p>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Payment Methods:
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-gray-200 dark:bg-dark-bg rounded flex items-center justify-center text-xs">
                  VISA
                </div>
                <div className="w-12 h-8 bg-gray-200 dark:bg-dark-bg rounded flex items-center justify-center text-xs">
                  Mada
                </div>
                <div className="w-12 h-8 bg-gray-200 dark:bg-dark-bg rounded flex items-center justify-center text-xs">
                  STCPay
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
