document.addEventListener("DOMContentLoaded", async () => {
    // Configurações
    const API_USUARIOS = "http://localhost:3000/usuarios";
    const API_ANONIMOS = "http://localhost:3000/anonimos";
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");

    // Identificadores da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idDaVaquinha = urlParams.get('id');
    const idDonoDaCampanha = urlParams.get('usuarioId');

    // Elementos DOM
    const btnGerarPix = document.getElementById("btn-gerar-pix");
    const formCartao = document.getElementById("form-cartao");
    const inputValor = document.getElementById("donation-amount");
    const inputNome = document.getElementById("user-name");

    // Variável para guardar o título garantido
    let tituloDaVaquinha = "Causa Apoiada";

    // --- CARREGAMENTO INICIAL ---
    async function carregarDadosIniciais() {
        if (!idDonoDaCampanha) return;
        try {
            const res = await fetch(`${API_USUARIOS}/${idDonoDaCampanha}`);
            const dono = await res.json();
            const vaquinha = dono.criacoes.find(c => String(c.id) === String(idDaVaquinha));
            if (vaquinha) {
                tituloDaVaquinha = vaquinha.titulo;
                document.getElementById("resumo-titulo").textContent = tituloDaVaquinha;
                document.getElementById("resumo-tag").textContent = vaquinha.categoria || "Geral";
            }
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
        }
    }
    await carregarDadosIniciais();

    // --- LÓGICA PRINCIPAL DE PAGAMENTO ---
    async function processarDoacao(e, metodo) {
        if (e) e.preventDefault();

        const nome = inputNome.value.trim();
        const valor = parseFloat(inputValor.value);

        if (!nome || isNaN(valor) || valor < 5) {
            alert("Preencha seu nome e valor mínimo de R$ 5,00.");
            return;
        }

        try {
            // 1. ATUALIZAR O ARRECADADO NA ONG (Dono da Campanha)
            const resDono = await fetch(`${API_USUARIOS}/${idDonoDaCampanha}`);
            const dono = await resDono.json();
            const idx = dono.criacoes.findIndex(c => String(c.id) === String(idDaVaquinha));
            
            if (idx === -1) throw new Error("Campanha não encontrada.");

            // Garante soma matemática forçando tipo Number
            const totalAtual = parseFloat(dono.criacoes[idx].arrecadado || 0);
            dono.criacoes[idx].arrecadado = totalAtual + valor;

            await fetch(`${API_USUARIOS}/${idDonoDaCampanha}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dono)
            });

            // 2. REGISTRAR A DOAÇÃO (Historico)
            const idTransacao = "doc_" + Math.random().toString(36).substr(2, 9);
            const novaDoacao = {
                id_doacao: idTransacao,
                vaquinha_id: idDaVaquinha,
                vaquinha_titulo: tituloDaVaquinha,
                valor: valor,
                metodo: metodo,
                data: new Date().toISOString()
            };

            if (TOKEN_USUARIO) {
                const res = await fetch(`${API_USUARIOS}?token=${TOKEN_USUARIO}`);
                const [user] = await res.json();
                await fetch(`${API_USUARIOS}/${user.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ doacoes: [...(user.doacoes || []), novaDoacao] })
                });
            } else {
                await fetch(API_ANONIMOS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...novaDoacao, doador: nome })
                });
            }

            // 3. REDIRECIONAR APÓS SUCESSO TOTAL
            window.location.href = `sucesso.html?id=${idTransacao}`;

        } catch (err) {
            console.error(err);
            alert("Erro crítico na transação: " + err.message);
        }
    }

    // Event Listeners
    if (btnGerarPix) btnGerarPix.onclick = (e) => processarDoacao(e, "Pix");
    if (formCartao) formCartao.onsubmit = (e) => processarDoacao(e, "Cartão");
});