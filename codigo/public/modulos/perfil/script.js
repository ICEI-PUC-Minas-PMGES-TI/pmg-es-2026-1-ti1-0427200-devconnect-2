document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:3000/usuarios";
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");

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

    if (!TOKEN_USUARIO) {
        alert("Sessão expirada ou usuário não conectado.");
        window.location.href = "../Login/login.html";
        return;
    }

    // --- LÓGICA DE NAVEGAÇÃO ---
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
                <td>R$ ${item.meta}</td>
                ${tipoAlvo === "Vaquinha" ? `<td>R$ ${item.arrecadado || 0}</td>` : `<td>${item.cnpj}</td>`}
                <td><span class="badge ${item.status === 'Pendente' ? 'badge-pendente' : 'badge-concluida'}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success btn-editar" data-id="${item.id}">Editar</button>
                </td>
            `;
            corpo.appendChild(tr);
        });

        // Evento de Edição
        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute("data-id");
                window.location.href = `../editar-projeto/editar.html?id=${id}`;
            };
        });
    }

    // --- CARREGAMENTO INICIAL ---
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
        doacoes.forEach(d => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${new Date(d.data).toLocaleDateString()}</td><td>${d.vaquinha_titulo}</td><td>R$ ${d.valor}</td><td>${d.metodo}</td><td>Aprovado</td>`;
            elemento.appendChild(tr);
        });
    }
});