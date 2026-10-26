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
          <p className="text-sm text-gray-500">Last updated: October 26, 2026
          </p>

         <section className="space-y-3">
  <p className="text-base leading-relaxed">
    CritterTrack helps animal owners and breeders keep track of their
    animals, pedigrees, and breeding records, all in one place.
  </p>
  <p className="text-base leading-relaxed">
    To make this possible, we need to store some information about you
    and the animals you add. This policy explains what we collect,
    how we use it, and what other people can see.
  </p>
  <p className="text-base leading-relaxed">
    We believe you should have control over your own information.
    We don't sell your personal data, and we aim to be clear about
    how CritterTrack handles it.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    1. Information We Collect
  </h2>
  <p className="mb-3">
    When you use CritterTrack, certain information is needed to
    create your account and make the different features work.
    Most of this information is provided by you when setting
    up your profile or adding animal records.
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>
      <strong>Account Information:</strong> Your email address,
      personal name, and breeder name (if provided).
    </li>
    <li>
      <strong>Profile Information:</strong> Profile pictures,
      breeder details, country, and your chosen privacy
      and visibility settings.
    </li>
    <li>
      <strong>Animal Records:</strong> Information you add about
      your animals, including photos, pedigrees, genetics,
      litters, and breeding records.
    </li>
    <li>
      <strong>Feedback and Support:</strong> Information you
      share when reporting a problem, submitting feedback,
      or contacting us for help.
    </li>
    <li>
      <strong>Technical Information:</strong> Certain technical
      details, such as your IP address, browser, and device
      information, may be processed when you access CritterTrack.
      This helps us keep the platform working and secure.
    </li>
  </ul>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    2. How We Use Your Information
  </h2>
  <p className="mb-2">
    The information you provide is used to make CritterTrack work
    and to give you access to its features. This includes:
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>Creating and managing your account</li>
    <li>Saving your animals, litters, pedigrees, and breeding records</li>
    <li>Displaying information you've chosen to make public</li>
    <li>Sending account-related emails, such as verification and password resets</li>
    <li>Sending notifications about your animals and enclosures, if enabled</li>
    <li>Helping you when you contact us with questions or problems</li>
    <li>Fixing bugs, improving existing features, and developing new ones</li>
    <li>Keeping accounts and the platform secure</li>
  </ul>
</section>
          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    3. Public Information and Privacy Settings
  </h2>
  <p className="mb-3">
    CritterTrack allows you to share information about yourself
    and your animals with other users. What others can see
    depends on your profile settings and the visibility options
    you choose.
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>
      <strong>Your Name:</strong> You can choose whether to
      display your personal name, breeder name, or both.
      At least one name must be public to use certain community
      features, such as the Breeders Registry and offering
      animals for sale.
    </li>
    <li>
      <strong>Public Profiles:</strong> Your profile may be
      visible to other users depending on your privacy settings.
      Public profiles can appear in community features and
      the Breeders Registry.
    </li>
    <li>
      <strong>Animal Records:</strong> Animals you choose to
      display publicly may appear in searches, pedigrees,
      and other public areas of CritterTrack. Information
      connected to these animals, such as their ancestry,
      may also be visible.
    </li>
    <li>
      <strong>Breeders Registry:</strong> If you participate
      in the registry, other users may see your breeder
      information, country, and the species you've selected.
    </li>
    <li>
      <strong>Private Information:</strong> Your email address,
      password, and private account details are not displayed
      publicly. Information you've chosen to keep private
      is not intentionally made available through public
      profile features.
    </li>
    <li>
      <strong>Third Parties:</strong> We do not sell your
      personal information to advertisers or data brokers.
      Some information is processed by the external services
      needed to operate CritterTrack, as explained in
      section 10.
    </li>
  </ul>
  <p className="mt-3">
    You can change your visibility preferences through your
    profile settings whenever you want.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    4. Data Storage and Security
  </h2>
  <p>
    CritterTrack stores your account information and animal records
    using MongoDB Atlas, a cloud-based database service.
    We take security seriously and use measures such as encrypted
    connections, securely hashed passwords, and authentication
    to protect access to your account.
  </p>
  <p className="mt-3">
    While we do our best to keep your information safe,
    no online service can guarantee complete security.
  </p>
</section>

 <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    5. Emails from CritterTrack
  </h2>
  <p className="mb-3">
    CritterTrack sends certain emails to help you manage your
    account and stay informed. These include:
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>Confirming your email address when you register</li>
    <li>Helping you reset your password</li>
    <li>Informing you about important account or service updates</li>
    <li>
      Sending notifications about activity related to your
      account, animals, or other features when you've enabled
      email notifications in your settings
    </li>
  </ul>
  <p className="mt-3">
    Email notifications are optional and can be enabled or
    disabled at any time through your notification settings.
    Essential account emails, such as password resets and
    important security messages, are not affected by these
    preferences.
  </p>
  <p className="mt-3">
    We don't send marketing or promotional emails.
    Account-related emails are sent from noreply@crittertrack.net.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    6. Cookies and Tracking
  </h2>
  <p>
    CritterTrack uses your browser's local storage to keep you
    logged in between visits. This allows you to return to
    CritterTrack without having to sign in every time.
  </p>
  <p className="mt-3">
    We don't use third-party analytics, advertising trackers,
    or tracking cookies to follow your activity across
    other websites.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    7. Your Data and Your Rights
  </h2>
  <p className="mb-3">
    You have control over your personal information and how
    certain details are shared on CritterTrack. You can:
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>View and update your account and profile information</li>
    <li>Correct information that is inaccurate or outdated</li>
    <li>Manage the public visibility of your profile and animals</li>
    <li>Request a copy of the personal data we hold about you</li>
    <li>Request deletion of your account and personal information</li>
    <li>Object to or request restrictions on certain uses of your data</li>
    <li>Withdraw consent where your information is processed based on consent</li>
    <li>Request that your data be transferred elsewhere, where applicable</li>
  </ul>
  <p className="mt-3">
    Many of these options are available directly through your
    profile settings. For anything you cannot manage yourself,
    you can contact us using the email address at the bottom
    of this policy.
  </p>
  <p className="mt-3">
    You also have the right to raise a complaint with a data
    protection authority if you believe your personal information
    has not been handled correctly.
  </p>
</section>
         <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    8. How Long We Keep Your Data
  </h2>
  <p>
    Your account information and animal records are generally
    kept for as long as your account remains active. This allows
    you to continue accessing and managing your information
    whenever you use CritterTrack.
  </p>
  <p className="mt-3">
    If you decide to delete your account, your personal
    information will be deleted within 30 days. Some information
    may need to be kept longer where required by law or for
    legitimate security reasons.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    9. Children's Privacy
  </h2>
  <p>
    CritterTrack is intended for users aged 16 and older.
    We do not knowingly allow children under 16 to create
    accounts without the consent of a parent or legal guardian
    where such consent is required by law.
  </p>
  <p className="mt-3">
    If you believe a child has created an account without
    the necessary permission, please contact us so we can
    review the situation and take appropriate action.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    10. Services We Use
  </h2>
  <p className="mb-3">
    CritterTrack uses a few external services to keep the
    website and Android app running. These help us store
    information, host the platform, and send account-related
    emails and notifications.
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>
      <strong>MongoDB Atlas:</strong> Stores account information,
      animal records, pedigrees, and other data you add
      to CritterTrack.
    </li>
    <li>
      <strong>Railway:</strong> Hosts the backend services
      responsible for handling requests and managing
      CritterTrack's features.
    </li>
    <li>
      <strong>Vercel:</strong> Hosts the CritterTrack website
      and makes it accessible through your browser.
    </li>
    <li>
      <strong>Resend:</strong> Handles the delivery of account
      emails and optional email notifications.
    </li>
  </ul>
  <p className="mt-3">
    These providers may process information needed to deliver
    their services. We use them to operate CritterTrack,
    not to sell your personal information or provide it
    for advertising purposes.
  </p>
</section>

          <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    11. CritterTrack on Android
  </h2>
  <p className="mb-3">
    CritterTrack is also available as an Android app through
    Google Play. The app uses the same account and servers as
    the website, so your animal records, pedigrees, and other
    information are available on both.
  </p>
  <ul className="list-disc ml-6 space-y-2">
    <li>
      <strong>Device Permissions:</strong> The app only requests
      internet access. It does not request permission to access
      your camera, contacts, location, or photo library.
    </li>
    <li>
      <strong>Photo Uploads:</strong> When you choose to upload
      an image, the app uses Android's built-in file or photo
      picker. This lets you select individual images without
      giving CritterTrack access to your entire photo library.
    </li>
    <li>
      <strong>Push Notifications:</strong> If you enable push
      notifications, we store the subscription information
      needed to send them to your device. You can manage your
      notification preferences through your settings.
    </li>
    <li>
      <strong>Advertising and Tracking:</strong> The app does
      not contain advertisements or use advertising identifiers,
      third-party analytics, or tracking SDKs.
    </li>
    <li>
      <strong>Account Information:</strong> The Android app
      uses the same information described in this privacy
      policy. You don't need a separate account to use it.
    </li>
    <li>
      <strong>Account Deletion:</strong> You can delete your
      account through your profile settings, whether you're
      using the website or Android app.
    </li>
  </ul>
</section>

         <section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    12. Changes to This Policy
  </h2>
  <p>
    As CritterTrack grows and new features are introduced,
    we may occasionally need to update this privacy policy.
    Any changes will be reflected here, along with an updated
    date at the top of the page.
  </p>
  <p className="mt-3">
    If we make important changes that affect how your personal
    information is handled, we'll let you know through
    CritterTrack or by email. Where required, we'll ask
    for your consent before making those changes.
  </p>
</section>

<section>
  <h2 className="text-xl font-semibold text-gray-800 mb-3">
    13. Questions or Concerns?
  </h2>
  <p>
    If you have questions about this privacy policy, want
    to know more about how your information is handled,
    or would like to make a privacy-related request,
    feel free to contact us at{' '}
    <a
      href="mailto:crittertrackowner@gmail.com"
      className="text-primary hover:underline"
    >
      crittertrackowner@gmail.com
    </a>.
  </p>
  <p className="mt-3">
    We'll do our best to help and respond to your request
    as soon as reasonably possible.
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

export default PrivacyPolicy;
