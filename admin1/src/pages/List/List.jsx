import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './List.css';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch food items");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to remove this food item?")) {
      return;
    }
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message || "Error removing food");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing food item");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${url}${img}`;
    return `${url}/uploads/${img}`;
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
        <p style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>All Foods List ({list.length})</p>
        <button onClick={fetchList} style={{ padding: '6px 14px', background: '#ff4c24', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={item._id || index} className='list-table-format'>
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
                }}
              />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>₹{item.price}</p>
              <p className='cursor delete-icon' onClick={() => removeFood(item._id)} title="Delete Item">❌</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
