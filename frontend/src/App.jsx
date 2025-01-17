// Frontend: App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Pokemon App</h1>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:id" element={<PokemonPage />} />
        </Routes>
      </div>vs
    </Router>
  );
};

const HomePage = () => {
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    fetchPokemons();
  }, [page, search, type]);

  const fetchPokemons = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/pokemons`, {
        params: { page, name: search, type },
      });
      setPokemons(response.data.pokemons);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">All Types</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="grass">Grass</option>
        {/* Add more types as needed */}
      </select>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
        Next
      </button>

      <div>
        {pokemons.map((pokemon) => (
          <Link key={pokemon.id} to={`/pokemons/${pokemon.id}`}>
            <div>
              <img src={pokemon.image} alt={pokemon.name} />
              <p>{pokemon.name}</p>
              <p>{pokemon.types.join(", ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const PokemonPage = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetchPokemon();
  }, [id]);

  const fetchPokemon = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/pokemons/${id}`);
      setPokemon(response.data.pokemon);
      setSimilar(response.data.similar);
    } catch (error) {
      console.error(error);
    }
  };

  if (!pokemon) return <p>Loading...</p>;

  return (
    <div>
      <h2>{pokemon.name}</h2>
      <img src={pokemon.image} alt={pokemon.name} />
      <p>ID: {pokemon.id}</p>
      <p>Type: {pokemon.types.join(", ")}</p>
      <p>Height: {pokemon.height}</p>
      <p>Weight: {pokemon.weight}</p>
      <p>Stats:</p>
      <ul>
        <li>HP: {pokemon.stats.hp}</li>
        <li>Attack: {pokemon.stats.attack}</li>
        <li>Defense: {pokemon.stats.defense}</li>
        <li>Special Attack: {pokemon.stats.specialAttack}</li>
        <li>Special Defense: {pokemon.stats.specialDefense}</li>
      </ul>

      <h3>Similar Pokémon:</h3>
      <div>
        {similar.map((sim) => (
          <Link key={sim.id} to={`/pokemons/${sim.id}`}>
            <div>
              <img src={sim.image} alt={sim.name} />
              <p>{sim.name}</p>
              <p>{sim.types.join(", ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default App;
