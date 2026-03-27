const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

// conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// rota principal
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// rota do timer
app.get("/api/timer", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pedidovendaid::text AS pedido,
        dt_reserva AS inicio
      FROM pedidovenda
      WHERE dt_reserva IS NOT NULL
      ORDER BY dt_reserva ASC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ERRO:", err);
    res.status(500).json({
      erro: err.message
    });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
