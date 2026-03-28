<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Timer</title>

<style>
body {
    margin: 0;
    background: #0f1115;
    font-family: Arial, sans-serif;
    color: white;
}

.titulo {
    font-size: 32px;
    text-align: center;
    padding: 18px 10px;
    font-weight: bold;
    background: #05070c;
}

.painel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px;
}

.coluna {
    background: #101722;
    border-radius: 14px;
    padding: 14px;
    min-height: calc(100vh - 110px);
}

.coluna-titulo {
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 14px;
    text-align: center;
}

.container {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.card {
    width: 100%;
    background: #1a1f29;
    padding: 15px;
    border-radius: 12px;
    border-left: 8px solid green;
    box-sizing: border-box;
}

.verde { border-color: #22c55e; }
.laranja { border-color: #f59e0b; }
.vermelho { border-color: #ef4444; }

.pedido {
    font-size: 20px;
    font-weight: bold;
}

.cliente {
    font-size: 16px;
    color: #cbd5e1;
    margin-top: 4px;
}

.timer {
    font-size: 28px;
    margin-top: 10px;
    font-weight: bold;
}

.status {
    margin-top: 8px;
    font-size: 16px;
    font-weight: bold;
}

.inicio {
    margin-top: 8px;
    font-size: 14px;
    color: #94a3b8;
}

.rodape {
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
    padding: 0 15px 20px 15px;
}

.erro {
    background: #1a1f29;
    color: #fca5a5;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    font-size: 18px;
}

@media (max-width: 900px) {
    .painel {
        grid-template-columns: 1fr;
    }

    .titulo {
        font-size: 24px;
    }

    .coluna-titulo {
        font-size: 22px;
    }

    .pedido { font-size: 18px; }
    .cliente { font-size: 15px; }
    .timer { font-size: 24px; }
}
</style>
</head>
<body>

<div class="titulo">TEMPO DE SEPARAÇÃO</div>

<div class="painel">
    <div class="coluna">
        <div class="coluna-titulo">RESERVADO</div>
        <div class="container" id="containerReservado"></div>
    </div>

    <div class="coluna">
        <div class="coluna-titulo">CONFERIDO</div>
        <div class="container" id="containerConferido"></div>
    </div>
</div>

<div class="rodape" id="rodape">Carregando...</div>

<script>
const API_URL = "https://api-timer.onrender.com/api/timer";
let dados = [];

function pad(n) {
    return String(n).padStart(2, "0");
}

function formatarData(dataStr) {
    if (!dataStr) return "";
    const d = new Date(dataStr);
    return d.toLocaleString("pt-BR");
}

function parseTempoTexto(texto) {
    const match = texto?.match(/^(\d+)d\s+(\d{2}):(\d{2}):(\d{2})$/);

    if (!match) {
        return { dias: 0, horas: 0, minutos: 0, segundos: 0, texto: "0d 00:00:00" };
    }

    return {
        dias: parseInt(match[1], 10),
        horas: parseInt(match[2], 10),
        minutos: parseInt(match[3], 10),
        segundos: parseInt(match[4], 10),
        texto: `${match[1]}d ${match[2]}:${match[3]}:${match[4]}`
    };
}

function calcularDiferenca(inicio, fim) {
    if (!inicio || !fim) {
        return { dias: 0, horas: 0, minutos: 0, segundos: 0, texto: "0d 00:00:00" };
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    let diff = Math.floor((dataFim - dataInicio) / 1000);
    if (diff < 0) diff = 0;

    const dias = Math.floor(diff / 86400);
    const horas = Math.floor((diff % 86400) / 3600);
    const minutos = Math.floor((diff % 3600) / 60);
    const segundos = diff % 60;

    return {
        dias,
        horas,
        minutos,
        segundos,
        texto: `${dias}d ${pad(horas)}:${pad(minutos)}:${pad(segundos)}`
    };
}

function corTempo(tempo) {
    const horas = tempo.dias * 24 + tempo.horas;

    if (horas >= 24) return "vermelho";
    if (horas >= 8) return "laranja";
    return "verde";
}

async function buscarDados() {
    try {
        const resposta = await fetch(API_URL, { cache: "no-store" });

        if (!resposta.ok) {
            throw new Error("Erro ao buscar API");
        }

        dados = await resposta.json();
        render();

        document.getElementById("rodape").innerText =
            "Última atualização: " + new Date().toLocaleString("pt-BR");
    } catch (erro) {
        document.getElementById("containerReservado").innerHTML =
            `<div class="erro">Erro ao carregar os dados da API.</div>`;
        document.getElementById("containerConferido").innerHTML =
            `<div class="erro">Erro ao carregar os dados da API.</div>`;
        document.getElementById("rodape").innerText = "Falha na atualização";
        console.error(erro);
    }
}

function render() {
    const reservado = dados
        .filter(item => item.situacao === "RESERVADO")
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    const conferido = dados
        .filter(item => item.situacao === "CONFERIDO")
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    const containerReservado = document.getElementById("containerReservado");
    const containerConferido = document.getElementById("containerConferido");

    containerReservado.innerHTML = "";
    containerConferido.innerHTML = "";

    reservado.forEach(item => {
        const tempo = parseTempoTexto(item.tempo_util_formatado || "0d 00:00:00");

        const div = document.createElement("div");
        div.className = `card ${corTempo(tempo)}`;

        div.innerHTML = `
            <div class="pedido">Pedido ${item.pedido}</div>
            <div class="cliente">${item.cliente || ""}</div>
            <div class="timer">${tempo.texto}</div>
            <div class="status">RESERVADO</div>
            <div class="inicio">Data da reserva: ${formatarData(item.inicio)}</div>
        `;

        containerReservado.appendChild(div);
    });

    conferido.forEach(item => {
        const tempo = calcularDiferenca(item.inicio, item.ultima_conferencia);

        const div = document.createElement("div");
        div.className = `card ${corTempo(tempo)}`;

        div.innerHTML = `
            <div class="pedido">Pedido ${item.pedido}</div>
            <div class="cliente">${item.cliente || ""}</div>
            <div class="timer">${tempo.texto}</div>
            <div class="status">CONFERIDO</div>
            <div class="inicio">Data da reserva: ${formatarData(item.inicio)}</div>
        `;

        containerConferido.appendChild(div);
    });
}

buscarDados();
setInterval(buscarDados, 30000);
</script>

</body>
</html>
