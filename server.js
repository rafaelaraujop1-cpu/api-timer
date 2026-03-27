const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", async (req, res) => {
  try {
    const test = await pool.query("SELECT NOW() AS agora");
    res.json({
      status: "API funcionando",
      banco: "conectado",
      agora: test.rows[0].agora
    });
  } catch (err) {
    console.error("ERRO ROOT:", err);
    res.status(500).json({
      status: "API funcionando",
      banco: "erro",
      erro: err.message
    });
  }
});

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
    console.error("ERRO TIMER:", err);
    res.status(500).json({
      erro: err.message,
      detalhe: err.code || null
    });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
