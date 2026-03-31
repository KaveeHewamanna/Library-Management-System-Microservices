import React, { useEffect, useState } from 'react';
import { LogOut, Book, Bookmark, CreditCard, Search, BookOpen, AlertCircle, Plus, X, Edit2, Trash2, Users } from 'lucide-react';
import { fetchBooks, fetchReservationsByUser, issueBorrow, reserveBook, createMeetingRoomReservation, updateReservation, cancelReservation } from './api';

export default function Dashboard({ onLogout }) {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Meeting Room Reservation States
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [roomForm, setRoomForm] = useState({
    reservationTime: '',
    numberOfMembers: 1,
    memberNames: [''],
    notes: ''
  });
  
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

  // Meeting Room Handlers
  const handleMemberNameChange = (index, value) => {
    const newNames = [...roomForm.memberNames];
    newNames[index] = value;
    setRoomForm({ ...roomForm, memberNames: newNames });
  };

  const addMemberField = () => {
    setRoomForm({
      ...roomForm,
      memberNames: [...roomForm.memberNames, '']
    });
  };

  const removeMemberField = (index) => {
    setRoomForm({
      ...roomForm,
      memberNames: roomForm.memberNames.filter((_, i) => i !== index)
    });
  };

  const handleCreateRoomReservation = async (e) => {
    e.preventDefault();
    
    const validMembers = roomForm.memberNames.filter(name => name.trim() !== '');
    if (validMembers.length === 0) {
      alert('Please add at least one member name');
      return;
    }

    try {
      if (editingReservation) {
        const updates = {
          reservationTime: roomForm.reservationTime,
          numberOfMembers: parseInt(roomForm.numberOfMembers),
          memberNames: validMembers,
          notes: roomForm.notes
        };
        await updateReservation(editingReservation._id, updates);
        alert('Meeting room reservation updated successfully!');
        setEditingReservation(null);
      } else {
        await createMeetingRoomReservation(
          userId,
          roomForm.reservationTime,
          parseInt(roomForm.numberOfMembers),
          validMembers,
          roomForm.notes
        );
        alert('Meeting room reserved successfully!');
      }
      
      setRoomForm({
        reservationTime: '',
        numberOfMembers: 1,
        memberNames: [''],
        notes: ''
      });
      setShowRoomForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create/update reservation");
    }
  };

  const handleEditReservation = (res) => {
    if (res.reservationType === 'meetingRoom') {
      setEditingReservation(res);
      setRoomForm({
        reservationTime: res.reservationTime,
        numberOfMembers: res.numberOfMembers,
        memberNames: res.memberNames || [''],
        notes: res.notes || ''
      });
      setShowRoomForm(true);
    }
  };

  const handleCancelReservation = async (resId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await cancelReservation(resId);
        alert('Reservation cancelled successfully!');
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel reservation");
      }
    }
  };

  const handleCloseForm = () => {
    setShowRoomForm(false);
    setEditingReservation(null);
    setRoomForm({
      reservationTime: '',
      numberOfMembers: 1,
      memberNames: [''],
      notes: ''
    });
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const meetingRoomReservations = reservations.filter(r => r.reservationType === 'meetingRoom');
  const bookReservations = reservations.filter(r => r.reservationType !== 'meetingRoom');

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

        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Meeting Room Bookings</p>
            <h3 className="text-3xl font-bold text-slate-100">
              {meetingRoomReservations.filter(r => r.status === 'pending').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content: Books */}
      <div className="glass-card p-6 md:p-8 mb-10">
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

      {/* Meeting Room Reservations Section */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Meeting Room Reservations
          </h2>
          <button
            onClick={() => setShowRoomForm(!showRoomForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Reservation
          </button>
        </div>

        {/* Meeting Room Form */}
        {showRoomForm && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-100">
                {editingReservation ? 'Update Reservation' : 'Book Meeting Room'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoomReservation} className="space-y-4">
              {/* Reservation Time */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reservation Time *
                </label>
                <input
                  type="datetime-local"
                  value={roomForm.reservationTime}
                  onChange={(e) => setRoomForm({ ...roomForm, reservationTime: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400"
                />
              </div>

              {/* Number of Members */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Members *
                </label>
                <input
                  type="number"
                  min="1"
                  value={roomForm.numberOfMembers}
                  onChange={(e) => setRoomForm({ ...roomForm, numberOfMembers: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                />
              </div>

              {/* Member Names */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Member Names *
                </label>
                <div className="space-y-2">
                  {roomForm.memberNames.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Member ${index + 1} name`}
                        value={name}
                        onChange={(e) => handleMemberNameChange(index, e.target.value)}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400"
                      />
                      {roomForm.memberNames.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMemberField(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMemberField}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={roomForm.notes}
                  onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                  placeholder="Any special requirements..."
                  rows="3"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                >
                  {editingReservation ? 'Update' : 'Reserve'} Meeting Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reservations List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
          </div>
        ) : meetingRoomReservations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No meeting room reservations yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetingRoomReservations.map(res => (
              <div key={res._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        res.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                        res.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {res.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reserved on {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 mb-2">
                      📅 {new Date(res.reservationTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEditReservation(res)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelReservation(res._id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-colors"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Members</p>
                    <p className="text-slate-200 font-medium">{res.numberOfMembers}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Attending</p>
                    <p className="text-slate-200 text-sm">{res.memberNames?.join(', ')}</p>
                  </div>
                </div>

                {res.notes && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Notes</p>
                    <p className="text-xs text-slate-300">{res.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
