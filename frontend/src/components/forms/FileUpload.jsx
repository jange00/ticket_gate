import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const FileUpload = ({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  label = 'Upload Image',
  error,
  preview = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const fileInputRef = useRef(null);
  
  const handleFile = (file) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {previewUrl && preview ? (
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <motion.button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-orange-500 bg-orange-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
            }
          `}
          whileHover={{ scale: 1.01 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <motion.div
              className="flex flex-col items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="mb-4 p-4 bg-white rounded-full shadow-md">
                <FiUpload className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.includes('image') ? 'PNG, JPG, GIF up to' : 'File up to'} {maxSize / 1024 / 1024}MB
              </p>
            </motion.div>
          </label>
        </motion.div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;










