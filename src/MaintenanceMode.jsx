export default function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CritterTrack</h1>
        </div>

        {/* Main Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Maintenance in Progress</h2>
          <p className="text-gray-600 mb-4">
            We're making important improvements to CritterTrack to serve you better.
          </p>
          <p className="text-sm text-gray-500">
            We apologize for the inconvenience and appreciate your patience.
          </p>
        </div>

        {/* Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">System Status: Maintenance</span>
          </div>
          <p className="text-xs text-blue-600">
            Expected availability: within a few hours
          </p>
        </div>

        {/* What's happening */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-700 text-sm mb-2">What's happening:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Backend optimization</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Database improvements</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>System stability enhancements</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500 mb-3">
            Questions? We're here to help.
          </p>
          <a 
            href="mailto:support@crittertrack.com"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-6">
          CritterTrack © 2025 - We're committed to serving you better
        </p>
      </div>
    </div>
  );
}
