import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    async function fetchData() {
      try {
        if (!token) {
          setError("No token found. Redirecting to login...");
          navigate("/login");
          return;
        }

        const userRes = await axios.get("/users/me", { headers });
        const invRes = await axios.get("/inventory/", { headers });

        setUser(userRes.data);
        setInventory(invRes.data.inventory);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Unauthorized. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500); // soft redirect
      }
    }
    fetchData();
  }, [navigate, token]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await axios.post("/inventory/", { name: newItem }, { headers });
      const newItemObj = { name: newItem, id: res.data.id };
      setInventory([...inventory, newItemObj]);
      setNewItem("");
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/inventory/${id}`, { headers });
      setInventory(inventory.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.username}</h2>
      <div>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="New item"
        />
        <button onClick={handleAddItem}>Add</button>
      </div>
      <ul className="inventory-list">
  {inventory.map((item) => (
    <li key={item.id} className="inventory-item">
      <span className="item-name">{item.name}</span>
      <span
        className="delete-icon"
        onClick={() => handleDelete(item.id)}
        title="Delete item"
      >
        ❌
      </span>
    </li>
  ))}
</ul>


    </div>
  );
}
