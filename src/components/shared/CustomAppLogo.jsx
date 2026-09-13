// `lite` swaps to crittertrack-lite's own branding (logo + "CritterTrack Lite" label) for the
// full-site header when the account's uiMode is 'lite'. Desktop/PWA web only — callers must
// gate this with !Capacitor.isNativePlatform() themselves.
const CustomAppLogo = ({ size = "w-10 h-10", lite = false }) => (
  <div className="relative inline-flex items-center gap-2">
    <img
      src={lite ? "/lite-logo.png" : "/logo.png"}
      alt={lite ? "CritterTrack Lite Logo" : "Crittertrack Logo"}
      className={`${size} ${lite ? 'rounded-md object-contain' : ''} shadow-md`}
    />
    {lite ? (
      <span className="text-base font-bold text-gray-800 dark:text-dark-text whitespace-nowrap">CritterTrack Lite</span>
    ) : (
      <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg transform rotate-12">
        BETA
      </div>
    )}
  </div>
);

export default CustomAppLogo;
