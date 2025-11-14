import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <div 
      className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 bg-black/70 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`glass-container modal-glow p-8 m-4 max-w-sm w-full text-white transform transition-all duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;