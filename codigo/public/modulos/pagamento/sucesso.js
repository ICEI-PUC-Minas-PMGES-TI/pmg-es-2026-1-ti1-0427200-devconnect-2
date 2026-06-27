document.addEventListener("DOMContentLoaded", async () => {
    const API_USUARIOS = "http://localhost:3000/usuarios";
    const API_ANONIMOS = "http://localhost:3000/anonimos";

    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");
    const urlParams = new URLSearchParams(window.location.search);
    const idBuscado = urlParams.get('id');

    // 1. Validação inicial
    if (!idBuscado) {
        alert("Erro: Dados da doação não encontrados.");
        window.location.href = "../home-page/home_page.html";
        return;
    }

    // 2. Função de busca robusta
    async function encontrarDoacao() {
        try {
            // Tenta achar no usuário logado (se houver token)
            if (TOKEN_USUARIO) {
                const res = await fetch(`${API_USUARIOS}?token=${TOKEN_USUARIO}`);
                const users = await res.json();
                if (users.length > 0 && users[0].doacoes) {
                    const d = users[0].doacoes.find(d => String(d.id_doacao) === String(idBuscado));
                    if (d) return d;
                }
            }

            // Tenta nos anónimos
            const resAnon = await fetch(`${API_ANONIMOS}?id_doacao=${idBuscado}`);
            const anonimos = await resAnon.json();
            if (anonimos.length > 0) return anonimos[0];

            // Tenta varredura global (caso a doação tenha sido registrada no dono ou outro lugar)
            const resGlobal = await fetch(API_USUARIOS);
            const todos = await resGlobal.json();
            for (const u of todos) {
                if (u.doacoes) {
                    const d = u.doacoes.find(d => String(d.id_doacao) === String(idBuscado));
                    if (d) return d;
                }
            }
        } catch (e) {
            console.error("Erro na busca da doação:", e);
        }
        return null;
    }

    // 3. Execução e Atualização de Interface
    const doacao = await encontrarDoacao();

    if (doacao) {
        // Preenchimento dos dados recuperados
        const elTitulo = document.getElementById('view-titulo');
        const elMetodo = document.getElementById('view-metodo');
        const elValor = document.getElementById('view-valor');

        if (elTitulo) elTitulo.textContent = doacao.vaquinha_titulo || "Causa Apoiada";
        if (elMetodo) elMetodo.textContent = doacao.metodo;
        if (elValor) elValor.textContent = Number(doacao.valor).toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL'
        });

        // Feedback visual para PIX
        if (doacao.metodo === 'Pix') {
            document.getElementById('main-title').textContent = 'Pedido de Doação Gerado!';
            document.getElementById('main-subtitle').textContent = 'Sua contribuição foi registrada. Siga as instruções do banco para concluir o pagamento.';
            const pixSection = document.getElementById('pix-section');
            if (pixSection) pixSection.style.display = 'block';
        }
    } else {
        alert("Doação não localizada. Por favor, verifique sua conexão.");
        window.location.href = "../home-page/home_page.html";
    }
});