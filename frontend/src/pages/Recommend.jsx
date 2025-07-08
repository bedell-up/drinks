import { useState, useEffect } from "react";
import axios from "axios";

export default function Recommend() {
  const spirits = ["vodka", "gin", "rum", "tequila", "whiskey", "bourbon", "brandy"];
  const [selectedSpirit, setSelectedSpirit] = useState("");
  const [cocktails, setCocktails] = useState([]);
  const [userInventory, setUserInventory] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await axios.get("/inventory/", { headers });
        setUserInventory(res.data.inventory.map((i) => i.name.toLowerCase()));
      } catch (err) {
        console.error("Inventory load failed", err);
      }
    }
    loadInventory();
  }, []);

  const fetchCocktails = async (spirit) => {
    setSelectedSpirit(spirit);
    setSelectedCocktail(null);
    setLoading(true);

    try {
      const res = await axios.get(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${spirit}`
      );
      const drinks = res.data.drinks || [];

      const detailedDrinks = await Promise.all(
        drinks.slice(0, 10).map(async (drink) => {
          const detailsRes = await axios.get(
            `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`
          );
          const detail = detailsRes.data.drinks?.[0];
          if (!detail) return null;

          const ingredients = [];
          for (let i = 1; i <= 15; i++) {
            const ing = detail[`strIngredient${i}`];
            if (ing) ingredients.push(ing.toLowerCase());
          }

          const missing = ingredients.filter(
            (ing) => !userInventory.includes(ing)
          );

          return {
            ...detail,
            ingredients,
            missing,
            canMake: missing.length === 0,
          };
        })
      );

      setCocktails(detailedDrinks.filter(Boolean));
    } catch (err) {
      console.error("Cocktail loading failed", err);
    } finally {
      setLoading(false);
    }
  };

  const openCocktail = (drink) => {
    setSelectedCocktail(drink);
  };

  function MartiniSpinner() {
    return (
      <div className="spinner">
        <span role="img" aria-label="loading" className="martini">🍸</span>
        <p>Mixing drinks...</p>
      </div>
    );
  }

  return (
    <div className="recommend-container">
      <h2>Find Cocktails You Can Make</h2>
      <div className="spirit-buttons">
        {spirits.map((spirit) => (
          <button key={spirit} onClick={() => fetchCocktails(spirit)}>
            {spirit.charAt(0).toUpperCase() + spirit.slice(1)}
          </button>
        ))}
      </div>

      {selectedSpirit && <h3>Results for {selectedSpirit}</h3>}

      {loading ? (
        <MartiniSpinner />
      ) : (
        <div className="cocktail-grid">
          {cocktails.map((drink) => (
            <div
              key={drink.idDrink}
              className={`cocktail-card ${drink.canMake ? "can-make" : "missing"}`}
              onClick={() => openCocktail(drink)}
            >
              <img src={drink.strDrinkThumb} alt={drink.strDrink} width="100" />
              <p>{drink.strDrink}</p>
              {drink.canMake ? (
                <span className="status good">✅ You can make this</span>
              ) : (
                <span className="status warn">
                  ⚠️ Missing {drink.missing.length} ingredients
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCocktail && (
        <div className="cocktail-detail">
          <h3>{selectedCocktail.strDrink}</h3>
          <img
            src={selectedCocktail.strDrinkThumb}
            alt={selectedCocktail.strDrink}
            width="200"
          />
          <ul>
            {selectedCocktail.ingredients.map((ing) => (
              <li
                key={ing}
                style={{
                  color: userInventory.includes(ing) ? "green" : "red",
                }}
              >
                {ing}
              </li>
            ))}
          </ul>
          <p>{selectedCocktail.strInstructions}</p>
          <button onClick={() => setSelectedCocktail(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
