import React from 'react';
import { X } from 'lucide-react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Terms of Service</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-gray-700 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-500">Last Updated: December 7, 2025</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CritterTrack ("the Service"), you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
            <p>
              CritterTrack provides a pedigree and breeding registry management system for small animal breeders. 
              The Service allows users to track animals, manage breeding records, calculate genetics, and maintain 
              public profiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User Accounts</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. User Content</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>You retain ownership of content you upload (photos, animal records, etc.)</li>
              <li>By uploading content, you grant CritterTrack a license to store and display your content as part of the Service</li>
              <li>You are responsible for ensuring you have the right to upload any content</li>
              <li>Content marked as "public" may be visible to other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Upload false, inaccurate, or misleading information</li>
              <li>Impersonate another person or entity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the Service or other user accounts</li>
              <li>Upload malicious code or interfere with the Service's operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Genetics Calculator</h2>
            <p>
              The genetics calculator is provided for educational and informational purposes only. While we strive for 
              accuracy, results should not be considered 100% accurate. CritterTrack is not responsible for breeding 
              decisions made based on calculator results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation of these terms or 
              for any other reason. You may delete your account at any time through your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind, either express or implied. We do not 
              guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Limitation of Liability</h2>
            <p>
              CritterTrack shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at{' '}
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

export default TermsOfService;
