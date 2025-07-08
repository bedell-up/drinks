import { useState, useEffect } from "react";
import axios from "axios";

export default function Library() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await axios.get("/inventory/", { headers });
        setInventory(res.data.inventory);
      } catch (err) {
        console.error("Failed to fetch inventory", err);
      }
    }
    fetchInventory();
  }, []);

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await axios.post("/inventory/", { name: newItem }, { headers });
      setInventory([...inventory, { name: newItem, id: res.data.id }]);
      setNewItem("");
    } catch (err) {
      console.error("Add item failed", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/inventory/${id}`, { headers });
      setInventory(inventory.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete item failed", err);
    }
  };

  return (
    <div className="library-container">
      <h2>My Booze Library</h2>
      <input
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="Add a new bottle (e.g. Vodka)"
      />
      <button onClick={addItem}>Add</button>
     <ul className="inventory-list">
  {inventory.map((item) => (
    <li key={item.id} className="inventory-item">
      <span className="item-name">{item.name}</span>
      <span
        className="delete-icon"
        onClick={() => deleteItem(item.id)}
        title="Delete"
      >
        ❌
      </span>
    </li>
  ))}
</ul>

    </div>
  );
}
