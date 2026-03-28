const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

app.get("/api/timer", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pedidovendaid::text AS pedido,
        nome_cadcftv AS cliente,
        to_char(dt_reserva AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI:SS') AS inicio,
        to_char(primeira_conferencia, 'YYYY-MM-DD HH24:MI:SS') AS primeira_conferencia,
        to_char(ultima_conferencia, 'YYYY-MM-DD HH24:MI:SS') AS ultima_conferencia,
        tempo_util_formatado,
        situacao
      FROM vw_pedidos_timer
      WHERE dt_reserva IS NOT NULL
      ORDER BY dt_reserva ASC
      LIMIT 100
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

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.listen(10000, () => {
  console.log("API rodando na porta 10000");
});
