import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { Plus, Edit, Trash2, Search, Car, Video, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

function CarHiresManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [carHires, setCarHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', state: '', lga: '', description: '',
    video1: '', video2: '', video3: '', video4: ''
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadCarHires();
  }, []);

  const loadCarHires = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/car-hires');
      setCarHires(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 4) {
      alert("Max 4 images allowed");
      return;
    }
    setImages(e.target.files);
  };

  const openModalForAdd = () => {
    setEditId(null);
    setFormData({ name: '', state: '', lga: '', description: '', video1: '', video2: '', video3: '', video4: ''});
    setImages([]);
    setShowModal(true);
  };

  const openModalForEdit = (hire) => {
    setEditId(hire.id);
    const v = hire.videos || [];
    setFormData({
      name: hire.name || '',
      state: hire.state || '',
      lga: hire.lga || '',
      description: hire.description || '',
      video1: v[0] || '',
      video2: v[1] || '',
      video3: v[2] || '',
      video4: v[3] || ''
    });
    setImages([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('lga', formData.lga);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('is_active', 1);
    
    const videos = [formData.video1, formData.video2, formData.video3, formData.video4].filter(v => v);
    videos.forEach((v, idx) => formDataToSend.append(`videos[${idx}]`, v));
    
    for (let i = 0; i < images.length; i++) {
      formDataToSend.append('images[]', images[i]);
    }

    try {
      const url = editId ? `/admin/car-hires/${editId}` : '/admin/car-hires';
      const response = await api.post(url, formDataToSend);
      if (response.data.status === 'success' || response.status === 200) {
        setShowModal(false);
        loadCarHires();
        setFormData({ name: '', state: '', lga: '', description: '', video1: '', video2: '', video3: '', video4: ''});
        setImages([]);
        setEditId(null);
      } else {
        alert("Failed to save car hire.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save car hire.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/car-hires/${id}`);
      loadCarHires();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Car Hires Management</h1>
              <p className="text-gray-600">Manage executive car hire services.</p>
            </div>
            <button onClick={openModalForAdd} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
              <Plus size={20} /> Add Car Hire
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Media</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {carHires.map((hire) => (
                  <tr key={hire.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{hire.name}</td>
                    <td className="px-4 py-3 text-gray-600">{hire.lga}, {hire.state}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-gray-500">
                        <span className="flex items-center gap-1 text-xs"><ImageIcon size={14}/> {hire.images?.length || 0}</span>
                        <span className="flex items-center gap-1 text-xs"><Video size={14}/> {hire.videos?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openModalForEdit(hire)} className="p-2 bg-blue-100 text-blue-600 rounded">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(hire.id)} className="p-2 bg-red-100 text-red-600 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">{editId ? 'Edit Car Hire Service' : 'Add Car Hire Service'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label>Name</label><input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div><label>State</label><input required className="w-full border rounded p-2" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></div>
                    <div><label>LGA</label><input required className="w-full border rounded p-2" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} /></div>
                    <div><label>Description</label><input className="w-full border rounded p-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Fleet Images (Up to 4)</h4>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full border p-2 rounded" />
                    {editId && <p className="text-xs text-gray-500 mt-1">Uploading new images will replace the old ones.</p>}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2">YouTube Video Links (Up to 4)</h4>
                    <input placeholder="Video URL 1" type="url" className="w-full border rounded p-2 mb-2" value={formData.video1} onChange={e => setFormData({...formData, video1: e.target.value})} />
                    <input placeholder="Video URL 2" type="url" className="w-full border rounded p-2 mb-2" value={formData.video2} onChange={e => setFormData({...formData, video2: e.target.value})} />
                    <input placeholder="Video URL 3" type="url" className="w-full border rounded p-2 mb-2" value={formData.video3} onChange={e => setFormData({...formData, video3: e.target.value})} />
                    <input placeholder="Video URL 4" type="url" className="w-full border rounded p-2 mb-2" value={formData.video4} onChange={e => setFormData({...formData, video4: e.target.value})} />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded">Save</button>
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-600 text-white p-2 rounded">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default CarHiresManagement;
