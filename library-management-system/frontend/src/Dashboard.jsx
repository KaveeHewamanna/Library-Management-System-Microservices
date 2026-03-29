import React, { useEffect, useState } from 'react';
import { LogOut, Book, Bookmark, CreditCard, Search, BookOpen, AlertCircle } from 'lucide-react';
import { fetchBooks, fetchReservationsByUser, issueBorrow, reserveBook } from './api';

export default function Dashboard({ onLogout }) {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const userName = localStorage.getItem('library_user_name');
  const userId = localStorage.getItem('library_user_id');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [booksRes, resRes] = await Promise.all([
        fetchBooks(),
        fetchReservationsByUser(userId)
      ]);
      if (booksRes.success) setBooks(booksRes.data);
      if (resRes.success) setReservations(resRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      await reserveBook(userId, bookId, "Reserved from premium frontend");
      alert("Book reserved successfully! Expiry in 7 days.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reserve book");
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await issueBorrow(userId, bookId);
      alert("Book borrowed successfully! Due in 14 days.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue borrow. Book might already be borrowed.");
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Library Connect
            </h1>
            <p className="text-sm text-slate-400">Welcome, {userName}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="glass-button-outline flex items-center gap-2 text-sm px-4 py-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="bg-emerald-500/20 p-3 rounded-xl">
            <Book className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Books Catalog</p>
            <h3 className="text-3xl font-bold text-slate-100">{books.length}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="bg-amber-500/20 p-3 rounded-xl">
            <Bookmark className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">My Active Reservations</p>
            <h3 className="text-3xl font-bold text-slate-100">
              {reservations.filter(r => r.status === 'pending').length}
            </h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 blur-2xl rounded-full" />
          <div className="bg-red-500/20 p-3 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Fines Status</p>
            <h3 className="text-xl font-bold text-slate-100 mt-1">Excellent</h3>
            <p className="text-xs text-emerald-400 mt-1">No overdue books</p>
          </div>
        </div>
      </div>

      {/* Main Content: Books */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> 
            Digital Catalog
          </h2>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search title, author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 py-2 text-sm bg-black/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-t-2 border-indigo-500 border-solid rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-colors flex flex-col h-full group">
                <div className="h-48 bg-gradient-to-br from-indigo-900/40 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  <Book className="w-16 h-16 text-indigo-400/20 group-hover:scale-110 group-hover:text-indigo-400/40 transition-all duration-500" />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-xs px-2 py-1 rounded text-slate-300">
                    {book.genre || 'General'}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg leading-tight mb-1">{book.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{book.author}</p>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-3">
                      <span>ISBN: {book.isbn}</span>
                      <span className={book.availableCopies > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {book.availableCopies} left
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleBorrow(book._id)}
                        disabled={book.availableCopies === 0}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs py-2 rounded-lg font-medium transition-colors"
                      >
                        Borrow
                      </button>
                      <button 
                        onClick={() => handleReserve(book._id)}
                        className="bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded-lg font-medium transition-colors"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
