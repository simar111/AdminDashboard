import { useState, useEffect } from 'react';
import { FiPackage, FiTrash2, FiEdit2, FiRefreshCw, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/products/all1');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/products/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }
      setProducts(products.filter(product => product._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredProducts = products
    .filter(product => 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
              <FiPackage className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Product Inventory</h2>
              <p className="text-gray-600 text-lg">Manage your product catalog with ease</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={fetchProducts}
              className="p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-6 h-6 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-600 text-xl font-medium">Error: {error}</p>
          <button
            onClick={fetchProducts}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : Object.keys(groupedProducts).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-500 text-xl">
            {searchTerm ? 'No matching products found' : 'No products available'}
          </p>
        </div>
      ) : (
        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div
              className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
              {expandedCategories[category] ? (
                <FiChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <FiChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </div>
            {expandedCategories[category] && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryProducts.map((product) => {
                      let imageSrcs = [];
                      if (product.images && Array.isArray(product.images)) {
                        imageSrcs = product.images
                          .map(image => 
                            image && image.data
                              ? `data:${image.contentType};base64,${image.data}`
                              : null
                          )
                          .filter(src => src !== null);
                      }

                      return (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{product.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">${product.price?.toFixed(2) || '0.00'}</td>
                          <td className="px-6 py-4">
                            {imageSrcs.length > 0 ? (
                              <div className="flex space-x-2 overflow-x-auto max-w-[200px] py-2">
                                {imageSrcs.map((src, index) => (
                                  <img
                                    key={index}
                                    src={src}
                                    alt={`product-${index}`}
                                    className="h-12 w-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No images</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{product.subcategory || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {product.sizesAvailable?.map(size => (
                              <span key={size.size} className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {size.size}: {size.quantity}
                              </span>
                            ))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              (product.totalQuantity || 0) > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.totalQuantity || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(product.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <div className="flex space-x-3">
                              <button
                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProductsPage;