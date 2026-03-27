const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/api/timer", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pedidovendaid::text AS pedido,
        nome_cadcftv::text AS cliente,
        dt_reserva AS inicio
      FROM pedidovenda
      WHERE dt_reserva IS NOT NULL
      ORDER BY dt_reserva ASC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

app.get("/", (req, res) => {
  res.send("API funcionando");
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});
