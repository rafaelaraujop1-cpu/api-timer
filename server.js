Tá errado. 
Calcule as horas respeitando o horário útil de trabalho:

Segunda a Quinta: 07:30 as 12:00 e 13:0 as 17:30
Sexta: 07:30 as 12:00 e 13:00 as 16:30

Vou te dar os resultados da Api e os valores que preciso que aparece no timer:

Quando for tiver a data ultima_conferencia preenchida:

"pedido":"377302","cliente":"A M DE SA COMERCIO DE METAIS","inicio":"2026-03-26 15:51:50","primeira_conferencia":"2026-03-27 08:20:45","ultima_conferencia":"2026-03-27 08:36:21","tempo_util_formatado":"0d 09:38:10","situacao":"FATURADO"}

Inicio: 026-03-26 15:51:507
Ultima Conferencia:  2026-03-27 08:36:21

15:51:50 → 17:30:00 = 01:38:10
07:30:00 → 08:36:21 = 01:06:21
Resultado do timer: 02:44:31

Quando não tiver a data ultima_conferencia preenchida:

Calcular o timer baseado no último horário útil:
Inicio: 026-03-26 07:30:00

Se hoje fosse dia 27/03/2026 sexta feira as 16:00 ele deveria preencher o timer e continuar contando até chegar 16:30, timer ficaria sim:
1d 07:30
