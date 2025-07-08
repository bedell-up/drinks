import React from 'react';

export function IngredientInput({ ingredient, setIngredient, onAdd }) {
  return (
    <div>
      <input
        type="text"
        value={ingredient}
        onChange={e => setIngredient(e.target.value)}
        placeholder="Add ingredient"
      />
      <button onClick={onAdd}>Add</button>
    </div>
  );
}
