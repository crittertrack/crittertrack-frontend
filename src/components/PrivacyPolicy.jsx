import React from 'react';
import { X } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-gray-700 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-500">Last Updated: December 7, 2025</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, personal name, breeder name</li>
              <li><strong>Profile Information:</strong> Profile images, breeder information, public display preferences</li>
              <li><strong>Animal Records:</strong> Animal data, photos, pedigree information, genetic codes</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, feedback submissions</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide and maintain the CritterTrack service</li>
              <li>Create and manage your account</li>
              <li>Store and display your animal records and pedigrees</li>
              <li>Send you important account notifications (email verification, password resets)</li>
              <li>Respond to your feedback and support requests</li>
              <li>Improve our services and develop new features</li>
              <li>Prevent fraud and ensure service security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Information Sharing and Public Data</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Public Profiles:</strong> If you enable "Show Public Profile," your breeder name and selected animals may be visible to other users</li>
              <li><strong>Public Animals:</strong> Animals marked as "Display" may appear in public searches</li>
              <li><strong>Private by Default:</strong> Your email address and personal information are never publicly displayed</li>
              <li><strong>No Third-Party Selling:</strong> We do not sell your personal information to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely on MongoDB Atlas cloud database with encryption. We use industry-standard 
              security measures including password hashing, JWT authentication, and HTTPS encryption. However, no method 
              of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Email Communications</h2>
            <p className="mb-2">We send emails for:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Email verification during registration</li>
              <li>Password reset requests</li>
              <li>Important account or service updates</li>
            </ul>
            <p className="mt-2">
              We do not send marketing emails. All service emails are sent from noreply@crittertrack.net.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Cookies and Tracking</h2>
            <p>
              We use localStorage to store your authentication token for login persistence. We do not use third-party 
              tracking cookies or analytics services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access your personal information through your profile</li>
              <li>Update or correct your information at any time</li>
              <li>Delete your account and associated data</li>
              <li>Control public visibility of your profile and animals</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, we will delete 
              your personal information within 30 days. Some data may be retained for legal or security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Children's Privacy</h2>
            <p>
              CritterTrack is intended for users 13 years and older. We do not knowingly collect information from 
              children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>MongoDB Atlas:</strong> Database hosting (data stored securely in the cloud)</li>
              <li><strong>Railway:</strong> Backend server hosting</li>
              <li><strong>Vercel:</strong> Frontend hosting</li>
              <li><strong>Resend:</strong> Transactional email delivery</li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies and security measures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by 
              email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us at{' '}
              <a href="mailto:crittertrackowner@gmail.com" className="text-primary hover:underline">
                crittertrackowner@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
