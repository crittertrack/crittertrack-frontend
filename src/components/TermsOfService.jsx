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

          <section className="space-y-3">
  <p className="text-base leading-relaxed">
    CritterTrack is a platform for animal owners and breeders
    to manage their animals, keep breeding records, explore
    pedigrees, and connect with others in the community.
  </p>
  <p className="text-base leading-relaxed">
    These terms explain what you can expect from CritterTrack,
    what we expect from users, and a few important things to
    keep in mind while using the platform.
  </p>
  <p className="text-base leading-relaxed">
    We want CritterTrack to be a useful and reliable place
    for everyone. By creating an account or using the platform,
    you agree to follow these terms.
  </p>
</section>
          
          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    1. Using CritterTrack
  </h2>
  <p>
    By creating an account or using CritterTrack, you agree
    to these Terms of Service. If you don't agree with them,
    you should not use the platform.
  </p>
  <p className="mt-3">
    These terms apply to both the CritterTrack website and
    the Android app available through Google Play.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    2. What CritterTrack Offers
  </h2>
  <p>
    CritterTrack helps animal owners and breeders organize
    their animal records, manage litters and breeding plans,
    build pedigrees, and keep track of genetics and ancestry.
  </p>
  <p className="mt-3">
    The platform also includes community features, public
    profiles, a Breeders Registry, and options for sharing
    animal information with other users.
  </p>
  <p className="mt-3">
    We're continuously improving CritterTrack. Features may
    be added, changed, or removed as the platform develops.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    3. Your Account
  </h2>
  <p className="mb-3">
    To use CritterTrack, you'll need to create an account.
    When registering and using your account, we ask that you:
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>Provide accurate information when creating your account</li>
    <li>Keep your login details private and secure</li>
    <li>Keep your profile information reasonably up to date</li>
    <li>Contact us if you believe someone has accessed your account without permission</li>
    <li>Use your account responsibly and respect other users</li>
  </ul>
  <p className="mt-3">
    You're responsible for activity carried out through your
    account, except where it results from circumstances outside
    your reasonable control.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    4. Your Content and Animal Records
  </h2>
  <p className="mb-3">
    The information, photos, and animal records you add to
    CritterTrack remain yours. We don't claim ownership
    of your content simply because you upload it.
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>
      <strong>Your Content:</strong> You are responsible for
      making sure you have permission to upload and share
      any photos, information, or other material.
    </li>
    <li>
      <strong>Animal Records:</strong> You are responsible
      for the accuracy of the information you enter,
      including pedigrees, genetics, and breeding records.
    </li>
    <li>
      <strong>Public Information:</strong> Content you choose
      to make public may be viewed by other users and
      appear in searches, pedigrees, or community features.
    </li>
    <li>
      <strong>Permission to Display:</strong> By adding
      content, you allow CritterTrack to store, process,
      and display it as needed to provide the features
      you use, in accordance with your privacy settings.
    </li>
  </ul>
  <p className="mt-3">
    If you believe content on CritterTrack has been uploaded
    without permission or contains incorrect information
    that affects you, please contact us.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    5. Using CritterTrack Responsibly
  </h2>
  <p className="mb-3">
    We want CritterTrack to remain a useful and welcoming
    platform for animal owners and breeders. When using
    CritterTrack, please don't:
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>Deliberately provide false or misleading information</li>
    <li>Impersonate another person or breeder</li>
    <li>Upload content you don't have permission to use</li>
    <li>Harass, threaten, or deliberately mislead other users</li>
    <li>Use CritterTrack for unlawful activities</li>
    <li>Attempt to access accounts or information without permission</li>
    <li>Upload harmful code or intentionally interfere with the platform</li>
    <li>Abuse features in ways that negatively affect other users or the service</li>
  </ul>
  <p className="mt-3">
    If we become aware of activity that violates these rules,
    we may take appropriate action to protect CritterTrack
    and its users.
  </p>
</section>
          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    6. Genetics and Breeding Information
  </h2>
  <p>
    CritterTrack provides tools to help you understand
    genetics, explore possible breeding outcomes, and
    organize breeding information.
  </p>
  <p className="mt-3">
    Genetics calculations are based on the information
    available and the genetic rules supported by the
    platform. Actual breeding results can differ, and
    not every genetic factor can be predicted.
  </p>
  <p className="mt-3">
    These tools are intended to support your own knowledge
    and decisions, not replace them. You remain responsible
    for your breeding choices and the welfare of your animals.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    7. Account Suspension and Deletion
  </h2>
  <p>
    We may temporarily restrict, suspend, or close accounts
    that seriously or repeatedly violate these terms,
    misuse CritterTrack, or put the platform or its users
    at risk.
  </p>
  <p className="mt-3">
    Where appropriate, we'll try to explain the reason
    for an account restriction and provide an opportunity
    to resolve the issue.
  </p>
  <p className="mt-3">
    You can also choose to delete your account at any time
    through your profile settings. Information associated
    with account deletion is explained in our Privacy Policy.
  </p>
</section>

  <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    8. Availability, Reliability and Development
  </h2>
  <p>
    We do our best to keep CritterTrack available, secure,
    and working as intended. However, occasional bugs,
    maintenance, or technical issues may affect access
    to certain features.
  </p>
  <p className="mt-3">
    We cannot promise that the platform will always be
    available without interruptions or errors. We'll
    work to resolve problems when they occur and continue
    improving the service.
  </p>
  <p className="mt-3">
    CritterTrack is independently developed, operated,
    and maintained by its creator. No AI agents are
    involved in operating the platform, managing user
    accounts, or making administrative decisions.
    All development, maintenance, and platform-related
    decisions remain under direct human control.
  </p>
</section>

         <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    10. Changes to These Terms
  </h2>
  <p>
    As CritterTrack continues to develop, we may occasionally
    need to update these terms to reflect new features,
    changes to the platform, or legal requirements.
  </p>
  <p className="mt-3">
    If we make important changes, we'll let you know through
    CritterTrack or by email, with advance notice where
    required. The date at the top of this page shows
    when the terms were last updated.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    11. Questions or Concerns?
  </h2>
  <p>
    If you have questions about these terms, need help
    with your account, or would like to report an issue,
    you're welcome to contact us at{' '}
    <a
      href="mailto:crittertrackowner@gmail.com"
      className="text-primary hover:underline"
    >
      crittertrackowner@gmail.com
    </a>.
  </p>
  <p className="mt-3">
    As CritterTrack is maintained independently, response
    times may vary, but we'll do our best to help whenever
    possible.
  </p>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
