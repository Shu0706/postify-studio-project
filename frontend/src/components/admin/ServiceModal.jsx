import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiSave } from 'react-icons/fi';

const ServiceModal = ({ 
  showModal, 
  modalMode, 
  formData, 
  setFormData, 
  handleSubmit, 
  handleCloseModal,
  addArrayField,
  removeArrayField,
  updateArrayField,
  addPackage,
  removePackage,
  updatePackage 
}) => {
  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'social-media-management', label: 'Social Media Management' },
    { value: 'content-writing', label: 'Content Writing' },
    { value: 'graphic-design', label: 'Graphic Design' },
    { value: 'seo-optimization', label: 'SEO Optimization' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'branding', label: 'Branding' },
    { value: 'video-editing', label: 'Video Editing' }
  ];

  const isReadOnly = modalMode === 'view';

  const ArrayFieldInput = ({ label, field, placeholder }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {formData[field].map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateArrayField(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly={isReadOnly}
          />
          {!isReadOnly && formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayField(field, index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiMinus size={16} />
            </button>
          )}
        </div>
      ))}
      {!isReadOnly && (
        <button
          type="button"
          onClick={() => addArrayField(field)}
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
        >
          <FiPlus size={16} />
          Add {label.slice(0, -1)}
        </button>
      )}
    </div>
  );

  const PackageInput = ({ pkg, index }) => (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Package {index + 1}</h4>
        {!isReadOnly && formData.pricing.packages.length > 1 && (
          <button
            type="button"
            onClick={() => removePackage(index)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <FiMinus size={16} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
          <input
            type="text"
            value={pkg.name}
            onChange={(e) => updatePackage(index, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Basic, Professional, Enterprise"
            readOnly={isReadOnly}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input
            type="number"
            value={pkg.price}
            onChange={(e) => updatePackage(index, 'price', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            readOnly={isReadOnly}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={pkg.description}
          onChange={(e) => updatePackage(index, 'description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="2"
          placeholder="Package description..."
          readOnly={isReadOnly}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
        {pkg.features.map((feature, featureIndex) => (
          <div key={featureIndex} className="flex gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => {
                const updatedFeatures = [...pkg.features];
                updatedFeatures[featureIndex] = e.target.value;
                updatePackage(index, 'features', updatedFeatures);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Feature description"
              readOnly={isReadOnly}
            />
            {!isReadOnly && pkg.features.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const updatedFeatures = pkg.features.filter((_, i) => i !== featureIndex);
                  updatePackage(index, 'features', updatedFeatures);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiMinus size={16} />
              </button>
            )}
          </div>
        ))}
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => {
              const updatedFeatures = [...pkg.features, ''];
              updatePackage(index, 'features', updatedFeatures);
            }}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
          >
            <FiPlus size={16} />
            Add Feature
          </button>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
        <input
          type="number"
          value={pkg.deliveryTime}
          onChange={(e) => updatePackage(index, 'deliveryTime', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="7"
          readOnly={isReadOnly}
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' && 'Add New Service'}
                {modalMode === 'edit' && 'Edit Service'}
                {modalMode === 'view' && 'View Service'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter service name"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isReadOnly}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter service description"
                    required
                    readOnly={isReadOnly}
                  />
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Price ($)</label>
                      <input
                        type="number"
                        value={formData.pricing.basePrice}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing, basePrice: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        readOnly={isReadOnly}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={formData.pricing.currency}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          pricing: { ...prev.pricing, currency: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isReadOnly}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery (days)</label>
                      <input
                        type="number"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedDeliveryTime: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="7"
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>

                  {/* Packages */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Service Packages</h4>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={addPackage}
                          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                        >
                          <FiPlus size={16} />
                          Add Package
                        </button>
                      )}
                    </div>
                    
                    {formData.pricing.packages.map((pkg, index) => (
                      <PackageInput key={index} pkg={pkg} index={index} />
                    ))}
                  </div>
                </div>

                {/* Features, Requirements, Deliverables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ArrayFieldInput 
                    label="Features" 
                    field="features" 
                    placeholder="Enter a feature" 
                  />
                  <ArrayFieldInput 
                    label="Requirements" 
                    field="requirements" 
                    placeholder="Enter a requirement" 
                  />
                  <ArrayFieldInput 
                    label="Deliverables" 
                    field="deliverables" 
                    placeholder="Enter a deliverable" 
                  />
                </div>

                {/* Tags */}
                <ArrayFieldInput 
                  label="Tags" 
                  field="tags" 
                  placeholder="Enter a tag" 
                />

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isReadOnly}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Service is active and available to clients
                  </label>
                </div>

                {/* Form Actions */}
                {!isReadOnly && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiSave size={18} />
                      {modalMode === 'add' ? 'Create Service' : 'Update Service'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal;
