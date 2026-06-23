const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-80 flex items-center justify-center p-4 z-[200]">
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-dark-text-secondary mb-6">{message}</p>
      <button 
        onClick={onClose} 
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

export default ModalMessage;
