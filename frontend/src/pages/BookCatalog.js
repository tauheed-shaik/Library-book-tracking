import React, { useState, useEffect } from 'react';
import { bookAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [page, search, selectedCategory]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await bookAPI.getAllBooks(page, 12, selectedCategory, search);
      setBooks(response.data.books);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await bookAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">📚 Book Catalog</h1>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search books, authors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="input-field w-40"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map(book => (
            <div key={book._id} className="card hover:shadow-xl transition">
              <h3 className="font-bold text-lg mb-2">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
              <p className="text-gray-500 text-xs mb-2">{book.isbn}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-blue-600">
                  {book.availableCopies} available
                </span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {book.category?.name}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-4">{book.description}</p>
              <button className="btn-primary w-full text-sm">
                {book.availableCopies > 0 ? '📖 Issue Book' : '🔔 Reserve'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookCatalog;
