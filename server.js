const result = await pool.query(`
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
`);
