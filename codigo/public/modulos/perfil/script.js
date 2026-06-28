document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://pmg-es-2026-1-ti1-0427200-devconnect-2-1.onrender.com/usuarios";
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");

    // Elementos da Interface
    const txtNomeUsuario = document.getElementById("nomeUsuario");
    const containerFoto = document.getElementById("fotoUsuario");
    const menuItems = document.querySelectorAll(".menu-item");
    const cardTotalDoado = document.getElementById("totalDoado");
    const cardUltimaDoacao = document.getElementById("ultimaDoacao");
    const cardProjetosApoiados = document.getElementById("projetosApoiados");
    const tabelaCorpo = document.getElementById("tabelaCorpoDoacoes");
    const tituloPagina = document.getElementById("tituloPagina");
    const descricaoPagina = document.getElementById("descricaoPagina");

    let usuarioLogado = null;
    const estruturaOriginalTabela = document.querySelector(".table-responsive").innerHTML;

    // Verificação de Segurança
    if (!TOKEN_USUARIO) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "../Login/login.html";
        return;
    }

    // --- LÓGICA DE ABAS ---
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            if (item.textContent.trim() === "Sair") {
                sessionStorage.clear();
                window.location.href = "../Login/login.html";
                return;
            }
            menuItems.forEach(i => i.classList.remove("ativo"));
            item.classList.add("ativo");

            const textoMenu = item.textContent.trim();
            if (textoMenu === "Meu perfil") mostrarAbaPerfil();
            else if (textoMenu === "Histórico de doações") mostrarAbaHistorico();
            else if (textoMenu === "Minhas criações") mostrarAbaCriacoes();
        });
    });

    function mostrarAbaPerfil() {
        tituloPagina.textContent = "Meu Perfil";
        descricaoPagina.textContent = "Gerencie suas informações.";
        document.querySelector(".card-filtro").style.display = "none";
        document.querySelector(".row.g-3.mb-4").style.display = "none";
        document.querySelector(".historico-card").style.display = "block";
        document.querySelector(".table-responsive").innerHTML = `
            <div class="p-3">
                <p><strong>Nome:</strong> ${usuarioLogado.nome}</p>
                <p><strong>E-mail:</strong> ${usuarioLogado.email}</p>
            </div>`;
    }

    function mostrarAbaHistorico() {
        tituloPagina.textContent = "Histórico de doações";
        descricaoPagina.textContent = "Acompanhe suas doações.";
        document.querySelector(".card-filtro").style.display = "block";
        document.querySelector(".row.g-3.mb-4").style.display = "flex";
        document.querySelector(".historico-card").style.display = "block";
        document.querySelector(".table-responsive").innerHTML = estruturaOriginalTabela;
        processarEExibirDados(usuarioLogado.doacoes || [], document.getElementById("tabelaCorpoDoacoes"));
    }

    function mostrarAbaCriacoes() {
        tituloPagina.textContent = "Minhas Criações";
        descricaoPagina.textContent = "Gerencie suas vaquinhas e ONGs.";
        document.querySelector(".card-filtro").style.display = "none";
        document.querySelector(".row.g-3.mb-4").style.display = "none";
        document.querySelector(".historico-card").style.display = "block";

        document.querySelector(".table-responsive").innerHTML = `
            <div class="d-flex gap-2 mb-3">
                <button class="btn btn-sm btn-success px-3" id="sub-aba-vaquinhas">Minhas Vaquinhas</button>
                <button class="btn btn-sm btn-outline-secondary px-3" id="sub-aba-ongs">Minhas ONGs</button>
            </div>
            <table class="table align-middle">
                <thead><tr id="cabecalho-criacoes"></tr></thead>
                <tbody id="tabelaCorpoCriacoes"></tbody>
            </table>`;

        document.getElementById("sub-aba-vaquinhas").onclick = () => renderizarTabelaPorTipo("Vaquinha");
        document.getElementById("sub-aba-ongs").onclick = () => renderizarTabelaPorTipo("ONG");
        renderizarTabelaPorTipo("Vaquinha");
    }

    function renderizarTabelaPorTipo(tipoAlvo) {
        const cabecalho = document.getElementById("cabecalho-criacoes");
        const corpo = document.getElementById("tabelaCorpoCriacoes");
        corpo.innerHTML = "";

        const listaFiltrada = (usuarioLogado.criacoes || []).filter(c => String(c.tipo).toLowerCase() === tipoAlvo.toLowerCase());

        cabecalho.innerHTML = tipoAlvo === "Vaquinha" 
            ? "<th>Título</th><th>Meta</th><th>Arrecadado</th><th>Status</th><th>Ações</th>" 
            : "<th>Nome</th><th>Razão Social</th><th>CNPJ</th><th>Status</th><th>Ações</th>";

        listaFiltrada.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.titulo}</strong></td>
                <td>R$ ${Number(item.meta).toFixed(2)}</td>
                ${tipoAlvo === "Vaquinha" ? `<td>R$ ${Number(item.arrecadado || 0).toFixed(2)}</td>` : `<td>${item.cnpj}</td>`}
                <td><span class="badge ${item.status === 'Pendente' ? 'badge-pendente' : 'badge-concluida'}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success btn-editar" data-id="${item.id}">Editar</button>
                </td>
            `;
            corpo.appendChild(tr);
        });

        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.onclick = (e) => window.location.href = `../editar-projeto/editar.html?id=${e.target.dataset.id}`;
        });
    }

    // --- CARREGAMENTO E CÁLCULOS ---
    try {
        const res = await fetch(`${API_URL}?token=${TOKEN_USUARIO}`);
        const usuarios = await res.json();
        usuarioLogado = usuarios[0];

        if (txtNomeUsuario) txtNomeUsuario.textContent = usuarioLogado.nome;
        processarEExibirDados(usuarioLogado.doacoes || [], tabelaCorpo);
    } catch (e) { console.error(e); }

    function processarEExibirDados(doacoes, elemento) {
        if (!elemento) return;
        elemento.innerHTML = "";
        let total = 0;

        doacoes.forEach(d => {
            total += parseFloat(d.valor) || 0;
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${new Date(d.data).toLocaleDateString()}</td><td>${d.vaquinha_titulo}</td><td>R$ ${parseFloat(d.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td><td>${d.metodo}</td><td>Aprovado</td>`;
            elemento.appendChild(tr);
        });

        if (cardTotalDoado) cardTotalDoado.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (cardProjetosApoiados) cardProjetosApoiados.textContent = new Set(doacoes.map(d => d.vaquinha_titulo)).size;
        
        if (doacoes.length > 0) {
            const datas = doacoes.map(d => new Date(d.data));
            cardUltimaDoacao.textContent = new Date(Math.max(...datas)).toLocaleDateString('pt-BR');
        }
    }
});