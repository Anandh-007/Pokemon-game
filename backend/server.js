
// Backend: server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/pokemonDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("MongoDB connected"));

// Pokemon Schema
const PokemonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  types: [String],
  image: String,
  height: Number,
  weight: Number,
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
  },
});
const Pokemon = mongoose.model("Pokemon", PokemonSchema);

// Routes
// Get paginated Pokémon list
app.get("/api/pokemons", async (req, res) => {
  const { page = 1, limit = 10, name, type } = req.query;
  const query = {};
  if (name) query.name = new RegExp(name, "i");
  if (type) query.types = type;

  try {
    const pokemons = await Pokemon.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Pokemon.countDocuments(query);

    res.json({
      pokemons,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pokémon details
app.get("/api/pokemons/:id", async (req, res) => {
  try {
    const pokemon = await Pokemon.findOne({ id: req.params.id });
    if (!pokemon) return res.status(404).json({ message: "Pokemon not found" });

    const similar = await Pokemon.find({ types: { $in: pokemon.types } }).limit(5);

    res.json({ pokemon, similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



/*
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

// MongoDB Connection
const mongoURI = "mongodb://127.0.0.1:27017/pokemonDB"; // Update with your MongoDB URI if needed
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define the Pokemon Schema
const PokemonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  types: [String],
  image: String,
  height: Number,
  weight: Number,
  stats: {
    hp: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
  },
});

const Pokemon = mongoose.model("Pokemon", PokemonSchema);

// Function to Fetch Pokémon Data
const fetchPokemonData = async (limit = 150) => {
  try {
    console.log(`Fetching data for ${limit} Pokémon...`);
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    );

    const pokemonPromises = response.data.results.map(async (pokemon) => {
      const details = await axios.get(pokemon.url);
      const data = details.data;

      return {
        id: data.id,
        name: data.name,
        types: data.types.map((type) => type.type.name),
        image: data.sprites.front_default,
        height: data.height,
        weight: data.weight,
        stats: {
          hp: data.stats[0].base_stat,
          attack: data.stats[1].base_stat,
          defense: data.stats[2].base_stat,
          specialAttack: data.stats[3].base_stat,
          specialDefense: data.stats[4].base_stat,
        },
      };
    });

    const pokemonData = await Promise.all(pokemonPromises);
    return pokemonData;
  } catch (error) {
    console.error("Error fetching Pokémon data:", error.message);
    throw error;
  }
};

// Function to Store Data in MongoDB
const storeInMongoDB = async (pokemonData) => {
  try {
    console.log("Saving Pokémon data to MongoDB...");
    await Pokemon.insertMany(pokemonData);
    console.log("Data successfully saved to MongoDB!");
  } catch (error) {
    console.error("Error saving data to MongoDB:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Main Function to Download and Store Data
const downloadAndStorePokemon = async () => {
  try {
    const pokemonData = await fetchPokemonData(150); // Fetch data for 150 Pokémon
    await storeInMongoDB(pokemonData);
  } catch (error) {
    console.error("Error in the process:", error.message);
  }
};

downloadAndStorePokemon();
*/