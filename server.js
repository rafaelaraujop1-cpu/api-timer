const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
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
      WITH base AS (
        SELECT
          pedidovendaid::text AS pedido,
          nome_cadcftv AS cliente,
          dt_reserva AS inicio,
          primeira_conferencia,
          ultima_conferencia,
          tempo_util_formatado,
          situacao
        FROM vw_pedidos_timer
        WHERE dt_reserva IS NOT NULL
        ORDER BY dt_reserva ASC
        LIMIT 100
      )
      SELECT
        base.*,

        CASE
          WHEN base.situacao = 'RESERVADO' THEN
            CASE
              WHEN base.inicio::date = current_timestamp::date THEN
                CASE
                  WHEN current_timestamp::time >
                    CASE
                      WHEN EXTRACT(ISODOW FROM current_timestamp) = 5 THEN time '16:30'
                      ELSE time '17:30'
                    END
                  THEN '1d 00:00:00'
                  ELSE
                    FLOOR(GREATEST(EXTRACT(EPOCH FROM (current_timestamp - base.inicio)), 0)::numeric / 86400)::text
                    || 'd ' ||
                    LPAD(FLOOR(MOD(GREATEST(EXTRACT(EPOCH FROM (current_timestamp - base.inicio)), 0)::numeric, 86400) / 3600)::text, 2, '0')
                    || ':' ||
                    LPAD(FLOOR(MOD(GREATEST(EXTRACT(EPOCH FROM (current_timestamp - base.inicio)), 0)::numeric, 3600) / 60)::text, 2, '0')
                    || ':' ||
                    LPAD(MOD(FLOOR(GREATEST(EXTRACT(EPOCH FROM (current_timestamp - base.inicio)), 0)::numeric)::bigint, 60)::text, 2, '0')
                END
              ELSE base.tempo_util_formatado
            END
          ELSE NULL
        END AS timer_reservado,

        CASE
          WHEN base.situacao IN ('CONFERIDO', 'FATURADO') THEN
            CASE
              WHEN base.ultima_conferencia IS NULL THEN NULL
              WHEN base.inicio::date = base.ultima_conferencia::date THEN
                CASE
                  WHEN base.ultima_conferencia::time >
                    CASE
                      WHEN EXTRACT(ISODOW FROM base.ultima_conferencia) = 5 THEN time '16:30'
                      ELSE time '17:30'
                    END
                  THEN '1d 00:00:00'
                  ELSE
                    FLOOR(GREATEST(EXTRACT(EPOCH FROM (base.ultima_conferencia - base.inicio)), 0)::numeric / 86400)::text
                    || 'd ' ||
                    LPAD(FLOOR(MOD(GREATEST(EXTRACT(EPOCH FROM (base.ultima_conferencia - base.inicio)), 0)::numeric, 86400) / 3600)::text, 2, '0')
                    || ':' ||
                    LPAD(FLOOR(MOD(GREATEST(EXTRACT(EPOCH FROM (base.ultima_conferencia - base.inicio)), 0)::numeric, 3600) / 60)::text, 2, '0')
                    || ':' ||
                    LPAD(MOD(FLOOR(GREATEST(EXTRACT(EPOCH FROM (base.ultima_conferencia - base.inicio)), 0)::numeric)::bigint, 60)::text, 2, '0')
                END
              ELSE
                FLOOR(COALESCE(conf_tempo.segundos_uteis_conf, 0)::numeric / 86400)::text
                || 'd ' ||
                LPAD(FLOOR(MOD(COALESCE(conf_tempo.segundos_uteis_conf, 0)::numeric, 86400) / 3600)::text, 2, '0')
                || ':' ||
                LPAD(FLOOR(MOD(COALESCE(conf_tempo.segundos_uteis_conf, 0)::numeric, 3600) / 60)::text, 2, '0')
                || ':' ||
                LPAD(MOD(COALESCE(conf_tempo.segundos_uteis_conf, 0), 60)::text, 2, '0')
            END
          ELSE NULL
        END AS timer_conferido

      FROM base

      LEFT JOIN LATERAL (
        SELECT
          SUM(
            CASE
              WHEN EXTRACT(ISODOW FROM d.dia) BETWEEN 1 AND 4 THEN
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (
                    LEAST(base.ultima_conferencia, d.dia + time '12:00')
                    - GREATEST(base.inicio, d.dia + time '07:30')
                  ))
                )
                +
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (
                    LEAST(base.ultima_conferencia, d.dia + time '17:30')
                    - GREATEST(base.inicio, d.dia + time '13:00')
                  ))
                )

              WHEN EXTRACT(ISODOW FROM d.dia) = 5 THEN
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (
                    LEAST(base.ultima_conferencia, d.dia + time '12:00')
                    - GREATEST(base.inicio, d.dia + time '07:30')
                  ))
                )
                +
                GREATEST(
                  0,
                  EXTRACT(EPOCH FROM (
                    LEAST(base.ultima_conferencia, d.dia + time '16:30')
                    - GREATEST(base.inicio, d.dia + time '13:00')
                  ))
                )

              ELSE 0
            END
          )::bigint AS segundos_uteis_conf
        FROM generate_series(
          date_trunc('day', base.inicio),
          date_trunc('day', COALESCE(base.ultima_conferencia, base.inicio)),
          interval '1 day'
        ) AS d(dia)
        WHERE base.ultima_conferencia IS NOT NULL
      ) conf_tempo ON true

      ORDER BY base.inicio ASC
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
