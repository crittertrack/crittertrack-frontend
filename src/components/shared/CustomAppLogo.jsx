const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  <div className="relative inline-block">
    <img 
      src="/logo.png" 
      alt="Crittertrack Logo" 
      className={`${size} shadow-md`} 
    />
    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg transform rotate-12">
      BETA
    </div>
  </div>
);

export default CustomAppLogo;
