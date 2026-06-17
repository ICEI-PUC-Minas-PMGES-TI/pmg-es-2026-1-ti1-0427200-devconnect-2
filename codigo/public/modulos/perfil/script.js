document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:3000/usuarios";
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");

    // Elementos do Perfil / Sidebar
    const txtNomeUsuario = document.getElementById("nomeUsuario");
    const containerFoto = document.getElementById("fotoUsuario");
    const menuItems = document.querySelectorAll(".menu-item");

    // Elementos dos Cards de Indicadores
    const cardTotalDoado = document.getElementById("totalDoado");
    const cardUltimaDoacao = document.getElementById("ultimaDoacao");
    const cardProjetosApoiados = document.getElementById("projetosApoiados");

    // Elementos da Tabela e Conteúdo
    const tabelaCorpo = document.getElementById("tabelaCorpoDoacoes");
    const tituloPagina = document.getElementById("tituloPagina");
    const descricaoPagina = document.getElementById("descricaoPagina");

    // Variável global para armazenar os dados do usuário após o carregamento
    let usuarioLogado = null;

    // --- 1. LÓGICA DE ALTERNÂNCIA DO MENU SELETORES ---
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            // Se for o botão sair, trata a sessão
            if (item.textContent.trim() === "Sair") {
                sessionStorage.clear();
                window.location.href = "../Login/login.html"; // Ajuste para sua página de login
                return;
            }

            // Remove a classe ativa de todos e adiciona no clicado
            menuItems.forEach(i => i.classList.remove("ativo"));
            item.classList.add("ativo");

            const textoMenu = item.textContent.trim();
            
            // Altera o conteúdo visível na tela dependendo da aba
            if (textoMenu === "Meu perfil") {
                mostrarAbaPerfil();
            } else if (textoMenu === "Histórico de doações") {
                mostrarAbaHistorico();
            }
        });
    });

    function mostrarAbaPerfil() {
        tituloPagina.textContent = "Meu Perfil";
        descricaoPagina.textContent = "Gerencie suas informações cadastrais e preferências.";
        
        // Esconde os blocos do histórico
        document.querySelector(".card-filtro").style.display = "none";
        document.querySelector(".row.g-3.mb-4").style.display = "none"; // Cards
        
        // Renderiza um formulário simples ou dados do perfil na área da tabela
        if (usuarioLogado) {
            tabelaCorpo.closest(".historico-card").style.display = "block";
            // Substitui temporariamente a estrutura interna da área de dados
            document.querySelector(".table-responsive").innerHTML = `
                <div class="p-3">
                    <p><strong>Nome Completo:</strong> ${usuarioLogado.nome || 'Não informado'}</p>
                    <p><strong>E-mail cadastrado:</strong> ${usuarioLogado.email || 'Não informado'}</p>
                    <p><strong>CPF:</strong> ***.${usuarioLogado.cpf ? usuarioLogado.cpf.substring(3,6) : '###'}.***-**</p>
                </div>
            `;
        }
    }

    function mostrarAbaHistorico() {
        // Recarrega a estrutura padrão e renderiza novamente os dados originais
        window.location.reload(); 
    }


    // --- 2. REQUISIÇÃO AO BANCO DE DADOS (JSON SERVER) ---
    if (!TOKEN_USUARIO) {
        alert("Sessão expirada ou usuário não conectado. Faça login novamente.");
        window.location.href = "../Login/login.html";
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}?token=${TOKEN_USUARIO}`);
        if (!resposta.ok) throw new Error("Erro de comunicação com o servidor.");

        const usuarios = await resposta.json();
        if (usuarios.length === 0) throw new Error("Usuário não encontrado.");

        usuarioLogado = usuarios[0];

        // Preenche dados da Sidebar
        if (txtNomeUsuario) txtNomeUsuario.textContent = usuarioLogado.nome;
        if (usuarioLogado.foto && containerFoto) {
            containerFoto.style.backgroundImage = `url('${usuarioLogado.foto}')`;
        }

        // Processa e exibe o histórico se houver doações cadastradas
        const listaDoacoes = usuarioLogado.doacoes || [];
        processarEExibirDados(listaDoacoes);

    } catch (erro) {
        console.error("Falha ao carregar dados do painel:", erro);
        if (tabelaCorpo) {
            tabelaCorpo.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar o histórico de doações.</td></tr>`;
        }
    }


    // --- 3. PROCESSAMENTO DOS INDICADORES E RENDERIZAÇÃO ---
    function processarEExibirDados(doacoes) {
        if (!tabelaCorpo) return;
        tabelaCorpo.innerHTML = ""; // Limpa a linha estática de exemplo do HTML

        if (doacoes.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma doação realizada até o momento. 🌱</td></tr>`;
            return;
        }

        let acumuladorTotal = 0;
        let datasOrdenadas = [];
        let projetosDistintos = new Set();

        // Varre a array de doações do usuário do db.json
        doacoes.forEach(doacao => {
            acumuladorTotal += parseFloat(doacao.valor || 0);
            
            if (doacao.data) datasOrdenadas.push(new Date(doacao.data));
            if (doacao.vaquinha_titulo) projetosDistintos.add(doacao.vaquinha_titulo);

            // Formatação de data legível pt-BR
            const dataFormatada = doacao.data 
                ? new Date(doacao.data).toLocaleDateString('pt-BR') 
                : "--/--/----";

            // Formatação de moeda R$
            const valorFormatado = Number(doacao.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            // Define a classe da badge com base no status salvo
            const statusLower = String(doacao.status).toLowerCase();
            let badgeClass = "badge-pendente";
            let statusTexto = doacao.status || "Pendente";

            if (statusLower === "aprovado" || statusLower === "concluída" || statusLower === "concluido") {
                badgeClass = "badge-concluida";
                statusTexto = "Aprovado";
            }

            // Cria a linha estruturada da tabela
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td><strong>${doacao.vaquinha_titulo || "Projeto Não Identificado"}</strong></td>
                <td style="color: var(--verde-escuro); font-weight: 600;">${valorFormatado}</td>
                <td>${doacao.metodo || "Pix"}</td>
                <td><span class="${badgeClass}">${statusTexto}</span></td>
            `;
            tabelaCorpo.appendChild(tr);
        });

        // Atualiza os Cards Superiores com cálculos dinâmicos
        cardTotalDoado.textContent = acumuladorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        cardProjetosApoiados.textContent = projetosDistintos.size;

        if (datasOrdenadas.length > 0) {
            // Descobre a data mais recente ordenando a lista de datas
            const maisRecente = new Date(Math.max(...datasOrdenadas));
            cardUltimaDoacao.textContent = maisRecente.toLocaleDateString('pt-BR');
        }
    }
});