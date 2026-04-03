import React, { useState, useEffect } from 'react';
import { 
  LogOut, Users, BookOpen, Calendar, AlertCircle, 
  Plus, Trash2, CheckCircle, Clock, Edit2, Pencil, X 
} from 'lucide-react';
import { 
  fetchAllUsers, deleteUser, updateUser,
  fetchBooks, addBook, deleteBook, updateBook,
  fetchAllReservations,
  fetchAllBorrows, returnBook
} from './api';

export default function LibrarianDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('books');
  const userName = localStorage.getItem('library_user_name');

  const navItems = [
    { id: 'books', label: 'Catalog', icon: BookOpen },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'borrows', label: 'Borrows & Fines', icon: AlertCircle },
    { id: 'users', label: 'Members', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card rounded-none md:min-h-screen p-6 flex flex-col border-r border-slate-700/50">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <Users className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400">Head Librarian</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-fuchsia-400' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="mb-4 text-sm text-slate-400 px-2">{userName}</div>
          <button 
            onClick={onLogout}
            className="w-full glass-button-outline flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-y-auto">
        <div className="glass-card p-6 min-h-[500px]">
          {activeTab === 'books' && <BooksPanel />}
          {activeTab === 'reservations' && <ReservationsPanel />}
          {activeTab === 'borrows' && <BorrowsPanel />}
          {activeTab === 'users' && <UsersPanel />}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// Sub-Panels
// ==========================================

function BooksPanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', totalCopies: 1 });
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { load() }, []);
  
  const load = async () => {
    setLoading(true);
    const res = await fetchBooks();
    if (res.success) setBooks(res.data);
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addBook({ ...newBook, availableCopies: newBook.totalCopies });
      setShowAdd(false);
      setNewBook({ title: '', author: '', isbn: '', totalCopies: 1 });
      setMessage({ type: 'success', text: 'Book added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      load();
    } catch (err) { 
      setMessage({ type: 'error', text: 'Failed to add book.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleEdit = (book) => {
    setEditingBook({ ...book });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBook) return;
    try {
      // Only send the editable fields to the backend
      const updateData = {
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        totalCopies: editingBook.totalCopies,
        availableCopies: editingBook.availableCopies,
      };
      await updateBook(editingBook._id, updateData);
      setShowEditModal(false);
      setEditingBook(null);
      setMessage({ type: 'success', text: 'Book updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update book.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this book?")) return;
    try {
      await deleteBook(id);
      load();
    } catch (err) { alert("Failed to delete."); }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-indigo-400">Loading Catalog...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-fuchsia-300">
          <BookOpen className="w-6 h-6" /> Core Catalog
        </h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'New Book'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-8 p-4 bg-black/20 border border-fuchsia-500/20 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
          <input className="glass-input col-span-2" placeholder="Title" required value={newBook.title} onChange={e=>setNewBook({...newBook, title:e.target.value})} />
          <input className="glass-input" placeholder="Author" required value={newBook.author} onChange={e=>setNewBook({...newBook, author:e.target.value})} />
          <input className="glass-input" placeholder="ISBN" required value={newBook.isbn} onChange={e=>setNewBook({...newBook, isbn:e.target.value})} />
          <button type="submit" className="glass-button w-full border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20">Save</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400">
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">ISBN</th>
              <th className="p-3">Avail / Total</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3 text-slate-400">{b.author}</td>
                <td className="p-3 text-slate-400 font-mono text-sm">{b.isbn}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${b.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {b.availableCopies} / {b.totalCopies}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleEdit(b)} className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(b._id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && editingBook && (
        <EditBookModal 
          book={editingBook} 
          onSave={handleSaveEdit} 
          onClose={() => { setShowEditModal(false); setEditingBook(null); }}
          onChange={setEditingBook}
        />
      )}
    </div>
  )
}

function ReservationsPanel() {
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load() }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReservations();
      if (data.success) setRes(data.data);
    } catch(e) {}
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-indigo-400">Loading Reservations...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-2 text-fuchsia-300 mb-6">
        <Calendar className="w-6 h-6" /> Active Reservations
      </h2>
      <div className="space-y-3">
        {res.length === 0 ? <p className="text-slate-400">No reservations found.</p> : res.map(r => (
          <div key={r._id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-black/20 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/10 p-3 rounded-full">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-slate-200">User ID: <span className="font-mono text-xs text-slate-400">{r.userId}</span></p>
                <p className="text-sm text-slate-400">Book ID: <span className="font-mono">{r.bookId}</span></p>
                {r.notes && <p className="text-xs text-amber-200/50 italic mt-1">"{r.notes}"</p>}
              </div>
            </div>
            <div className="flex flex-col items-end mt-4 md:mt-0">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-medium uppercase tracking-wider mb-2">
                {r.status}
              </span>
              <span className="text-xs text-slate-500">Expires: {new Date(r.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BorrowsPanel() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load() }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBorrows();
      if (data.success) setBorrows(data.data);
    } catch(e) {}
    setLoading(false);
  };

  const handleReturn = async (id) => {
    if(!window.confirm("Process return for this book?")) return;
    try {
      const res = await returnBook(id);
      alert(`Book returned! Fine calculated: $${res.data.fineAmount.toFixed(2)}`);
      load();
    } catch (err) { alert("Failed to return book."); }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-indigo-400">Loading Borrows...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-2 text-fuchsia-300 mb-6">
        <AlertCircle className="w-6 h-6" /> Circulation & Fines
      </h2>
      <div className="space-y-4">
        {borrows.length === 0 ? <p className="text-slate-400">Nothing currently borrowed.</p> : borrows.sort((a,b) => a.status==='borrowed' ? -1 : 1).map(b => (
          <div key={b._id} className="flex flex-col md:flex-row justify-between items-center p-5 bg-black/20 border border-slate-700/50 rounded-xl relative overflow-hidden group">
            {b.status === 'borrowed' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fuchsia-500 shadow-[0_0_10px_#d946ef]" />}
            <div className="mb-4 md:mb-0 pl-2">
              <p className="font-medium text-slate-200 mb-1">Receipt ID: <span className="font-mono text-xs">{b._id}</span></p>
              <div className="text-sm text-slate-400 grid grid-cols-2 gap-x-8 gap-y-1">
                <span>User: <span className="font-mono text-xs">{b.userId}</span></span>
                <span>Borrowed: {new Date(b.borrowDate).toLocaleDateString()}</span>
                <span>Book: <span className="font-mono text-xs">{b.bookId}</span></span>
                <span className={new Date() > new Date(b.dueDate) ? 'text-red-400 font-bold' : ''}>
                  Due: {new Date(b.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {b.status === 'borrowed' ? (
                <button 
                  onClick={() => handleReturn(b._id)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> Process Return
                </button>
              ) : (
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-medium uppercase mb-2 inline-block shadow-inner">
                    Returned
                  </span>
                  <p className="text-sm text-red-300/80 font-mono">Fine: ${b.fineAmount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);   // holds the user being edited
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load() }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      if (data.success) setUsers(data.data);
    } catch(e) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this user?")) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) { alert("Failed to delete."); }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name:    user.name    || '',
      phone:   user.phone   || '',
      address: user.address || '',
      role:    user.role    || 'member',
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(editingUser._id, editForm);
      setEditingUser(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-indigo-400">Loading Directory...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-2 text-fuchsia-300 mb-6">
        <Users className="w-6 h-6" /> Member Directory
      </h2>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-fuchsia-300 mb-1">Edit User</h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">{editingUser.email}</p>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  className="glass-input w-full"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input
                  className="glass-input w-full"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+94771234567"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Address</label>
                <input
                  className="glass-input w-full"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="123 Main St, Colombo"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Role</label>
                <select
                  className="glass-input w-full"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="member">member</option>
                  <option value="librarian">librarian</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold transition-colors text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── User Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u._id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl relative group">
            {/* Action buttons — visible on hover */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEdit(u)}
                title="Edit user"
                className="p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(u._id)}
                title="Delete user"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                {u.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">{u.name}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${u.role === 'librarian' || u.role === 'admin' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-slate-700 text-slate-300'}`}>
                  {u.role}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Email: <span className="text-slate-300">{u.email}</span></p>
              <p>ID: <span className="font-mono text-slate-300">{u.membershipId}</span></p>
              {u.phone   && <p>Phone: <span className="text-slate-300">{u.phone}</span></p>}
              {u.address && <p>Address: <span className="text-slate-300">{u.address}</span></p>}
              <p>Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// Edit Book Modal
// ==========================================

function EditBookModal({ book, onSave, onClose, onChange }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 border border-fuchsia-500/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-fuchsia-500/20 bg-slate-900/95">
          <h3 className="text-xl font-bold text-fuchsia-300">Edit Book</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Title *</label>
              <input 
                type="text"
                className="glass-input w-full"
                required
                value={book.title || ''} 
                onChange={e => onChange({...book, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Author *</label>
              <input 
                type="text"
                className="glass-input w-full"
                required
                value={book.author || ''} 
                onChange={e => onChange({...book, author: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2 font-medium">ISBN *</label>
            <input 
              type="text"
              className="glass-input w-full"
              required
              value={book.isbn || ''} 
              onChange={e => onChange({...book, isbn: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Total Copies *</label>
              <input 
                type="number"
                className="glass-input w-full"
                required
                min="1"
                value={book.totalCopies || 1} 
                onChange={e => onChange({...book, totalCopies: parseInt(e.target.value) || 1})}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-medium">Available Copies *</label>
              <input 
                type="number"
                className="glass-input w-full"
                required
                min="0"
                max={book.totalCopies || 1}
                value={book.availableCopies || 0} 
                onChange={e => onChange({...book, availableCopies: Math.min(parseInt(e.target.value) || 0, book.totalCopies)})}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg text-xs text-slate-400">
            <p>Note: Only the above fields can be edited. Other book properties are managed separately.</p>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-fuchsia-500/20 bg-slate-900/95">
          <button 
            onClick={onClose}
            className="flex-1 glass-button border border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
