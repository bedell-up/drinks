import React from 'react';

export function InventoryList({ inventory }) {
  return (
    <ul>
      {inventory.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}