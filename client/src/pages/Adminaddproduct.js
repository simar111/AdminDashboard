import { useState } from 'react';
import { FiUpload, FiPlus, FiX, FiChevronDown } from 'react-icons/fi';

const AdminAddProduct = () => {
  const [product, setProduct] = useState({
    title: '',
    tagline: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    sizesAvailable: [{ size: '', quantity: '' }]
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Shirts', 'T-Shirts', 'Jeans', 'Trousers', 
    'Jackets', 'Ethnic Wear', 'Activewear', 'Accessories'
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...product.sizesAvailable];
    updatedSizes[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setProduct(prev => ({
      ...prev,
      sizesAvailable: updatedSizes
    }));
  };

  const addSizeField = () => {
    if (product.sizesAvailable.length >= 6) {
      setError('Maximum of 6 sizes allowed');
      return;
    }
    setProduct(prev => ({
      ...prev,
      sizesAvailable: [...prev.sizesAvailable, { size: '', quantity: '' }]
    }));
  };

  const removeSizeField = (index) => {
    const updatedSizes = product.sizesAvailable.filter((_, i) => i !== index);
    setProduct(prev => ({
      ...prev,
      sizesAvailable: updatedSizes
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (imagePreviews.length + files.length > 5) {
      setError('Maximum of 5 images allowed');
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    URL.revokeObjectURL(updatedPreviews[index].preview);
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validation
    if (!product.title || product.title.length < 2 || product.title.length > 100) {
      setError('Title is required and must be between 2-100 characters');
      setIsLoading(false);
      return;
    }

    if (product.tagline && product.tagline.length > 150) {
      setError('Tagline must be less than 150 characters');
      setIsLoading(false);
      return;
    }

    if (product.description && product.description.length > 2000) {
      setError('Description must be less than 2000 characters');
      setIsLoading(false);
      return;
    }

    if (!product.price || isNaN(product.price) || product.price < 0) {
      setError('Price must be a non-negative number');
      setIsLoading(false);
      return;
    }

    if (!product.category || !categories.includes(product.category)) {
      setError('Please select a valid category');
      setIsLoading(false);
      return;
    }

    // Validate sizes
    const hasEmptySize = product.sizesAvailable.some(
      s => !s.size || !sizeOptions.includes(s.size) || isNaN(s.quantity) || s.quantity < 0
    );

    if (hasEmptySize || product.sizesAvailable.length === 0) {
      setError('All sizes must have a valid size selection and non-negative quantity');
      setIsLoading(false);
      return;
    }

    if (imagePreviews.length === 0) {
      setError('At least one product image is required');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', product.title.trim());
      formData.append('tagline', product.tagline.trim());
      formData.append('description', product.description.trim());
      formData.append('price', product.price);
      formData.append('category', product.category);
      formData.append('subcategory', product.subcategory.trim());
      formData.append('sizesAvailable', JSON.stringify(
        product.sizesAvailable.map(s => ({
          size: s.size,
          quantity: parseInt(s.quantity)
        }))
      ));
      imagePreviews.forEach((image) => {
        formData.append('images', image.file);
      });

      const response = await fetch('http://localhost:8080/api/products/add', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Reset form
      setProduct({
        title: '',
        tagline: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        sizesAvailable: [{ size: '', quantity: '' }]
      });
      imagePreviews.forEach(image => URL.revokeObjectURL(image.preview));
      setImagePreviews([]);
      
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Add New Product
          </h1>
          <p className="text-lg text-gray-600">
            Expand your men's clothing collection
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Status Messages */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Product added successfully!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Product Title (2-100 chars) <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={product.title}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter product title (e.g., Classic Fit Denim Shirt)"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
                  Tagline (max 150 chars)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="tagline"
                    name="tagline"
                    value={product.tagline}
                    onChange={handleChange}
                    maxLength={150}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Short catchy phrase (e.g., Premium Comfort Fit)"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (max 2000 chars)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Detailed product description including material, fit, care instructions..."
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <select
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    required
                    className="appearance-none block w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Subcategory Input */}
              <div className="space-y-2">
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={product.subcategory}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Slim Fit, Cargo, Bomber"
                  />
                </div>
              </div>

              {/* Sizes Available */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sizes & Stock <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  {product.sizesAvailable.map((size, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label htmlFor={`size-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                          Size
                        </label>
                        <select
                          id={`size-${index}`}
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          required={index === 0}
                          className="block w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select size</option>
                          {sizeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id={`quantity-${index}`}
                          value={size.quantity}
                          onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                          required={index === 0}
                          min="0"
                          className="block w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Available stock"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSizeField(index)}
                          className="mt-5 p-2 text-red-500 hover:text-red-700"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {product.sizesAvailable.length < 6 && (
                    <button
                      type="button"
                      onClick={addSizeField}
                      className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <FiPlus className="mr-1" />
                      Add Another Size Option
                    </button>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Images (up to 5) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload high-quality images showing different angles (JPEG, PNG, WEBP, GIF)
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-sm text-gray-600 hover:bg-gray-50"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-2 bg-gray-100 rounded-full mb-2">
                          <FiPlus className="w-5 h-5 text-gray-500" />
                        </div>
                        <p className="mb-1 text-sm text-gray-600">
                          <span className="font-medium">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Max 5MB per image
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-12 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-medium text-white shadow-sm transition-colors ${
                  isLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FiUpload />
                    <span>Add Product</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;