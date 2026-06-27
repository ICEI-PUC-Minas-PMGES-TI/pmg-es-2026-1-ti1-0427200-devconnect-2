document.addEventListener("DOMContentLoaded", function() {
    
    // --- LÓGICA DE INTERCEPTAÇÃO E TOAST DO PERFIL ---
    var btnPerfil = document.querySelector(".nav-perfil");
    
    if (btnPerfil) {
        btnPerfil.addEventListener("click", function(event) {
            event.preventDefault();

            var tokenUsuario = sessionStorage.getItem("usuarioToken");

            if (tokenUsuario) {
                window.location.href = "../perfil/index.html"; 
            } else {
                exibirToast("⚠️ Você não está logado! Redirecionando para o login...", false);
                
                setTimeout(function() {
                    window.location.href = "../login/login.html"; 
                }, 2500);
            }
        });
    }

    function exibirToast(mensagem, eSucesso) {
        var container = document.getElementById("toast-container");
        if (!container) return;

        container.innerHTML = '';

        var toast = document.createElement("div");
        toast.className = "custom-toast";
        if (eSucesso) toast.classList.add("success");
        
        toast.textContent = mensagem; 
        container.appendChild(toast);

        container.classList.add("mostrar-fundo");

        setTimeout(function() {
            toast.classList.add("mostrar-card");
        }, 50);

        setTimeout(function() {
            toast.classList.remove("mostrar-card");
            container.classList.remove("mostrar-fundo");
            setTimeout(function() {
                toast.remove();
            }, 250);
        }, 2200);
    }


    // --- LÓGICA DE FILTRAGEM COMBINADA (ABAS, CATEGORIAS E BUSCA) ---
    
    var todasAsCampanhas = []; // Armazenará os dados extraídos das 'criacoes' de todos os usuários
    var abaAtiva = "Vaquinha"; // Começa mostrando Vaquinhas por padrão
    var categoriaAtiva = "todos";
    var termoBusca = "";

    // Elementos da tela
    var lista = document.getElementById('lista-campanhas');
    var inputBusca = document.getElementById('busca');
    var botoesAbas = document.querySelectorAll('.filtro-aba');
    var chipsFiltros = document.querySelectorAll('.filtro-chip');
    var sidebarBotoes = document.querySelectorAll('#categorias-sidebar .cat-item');

    // Inicializa os escutadores das Abas (Vaquinhas / ONGs) com correção de estilo visual
    botoesAbas.forEach(function(botao) {
        botao.addEventListener('click', function() {
            // Limpa o estilo de TODOS os botões de aba
            botoesAbas.forEach(b => {
                b.classList.remove('ativo');
                b.style.borderBottomColor = 'transparent';
                b.style.color = 'var(--cinza-texto)';
                b.style.fontWeight = '600';
            });
            
            // Aplica o estilo ativo no botão clicado
            botao.classList.add('ativo');
            botao.style.borderBottomColor = 'var(--verde-medio)';
            botao.style.color = 'var(--verde-medio)';
            botao.style.fontWeight = '700';

            // Captura o tipo (Vaquinha ou ONG) e filtra
            abaAtiva = botao.getAttribute('data-tipo');
            aplicarFiltros();
        });
    });

    // Inicializa escutadores dos chips de categorias superiores
    chipsFiltros.forEach(function(chip) {
        chip.addEventListener('click', function() {
            chipsFiltros.forEach(c => c.classList.remove('ativo'));
            chip.classList.add('ativo');
            
            categoriaAtiva = chip.getAttribute('data-cat');
            sincronizarSidebar(categoriaAtiva);
            aplicarFiltros();
        });
    });

    // Inicializa escutadores da Sidebar de categorias
    sidebarBotoes.forEach(function(btn) {
        btn.addEventListener('click', function() {
            sidebarBotoes.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            categoriaAtiva = btn.getAttribute('data-cat');
            sincronizarChips(categoriaAtiva);
            aplicarFiltros();
        });
    });

    // Escutador da Barra de Pesquisa
    if (inputBusca) {
        inputBusca.addEventListener('input', function(e) {
            termoBusca = e.target.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }

    // Auxiliares para manter os filtros de cima e do lado iguais
    function sincronizarSidebar(cat) {
        sidebarBotoes.forEach(b => {
            if(b.getAttribute('data-cat') === cat) b.classList.add('ativo');
            else b.classList.remove('ativo');
        });
    }
    function sincronizarChips(cat) {
        chipsFiltros.forEach(c => {
            if(c.getAttribute('data-cat') === cat) c.classList.add('ativo');
            else c.classList.remove('ativo');
        });
    }

    // Função central que filtra e renderiza de acordo com o estado atual das abas/busca
    function aplicarFiltros() {
        if (!lista) return;

        // 1. Filtra pelo Tipo da Aba (compara com a propriedade tipo)
        var filtrados = todasAsCampanhas.filter(function(v) {
            var tipoCampanha = v.tipo ? v.tipo : "Vaquinha"; 
            return tipoCampanha.toLowerCase() === abaAtiva.toLowerCase();
        });

        // 2. Filtra pela Categoria selecionada
        if (categoriaAtiva !== "todos") {
            filtrados = filtrados.filter(function(v) {
                return v.categoria && v.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
            });
        }

        // 3. Filtra pelo termo digitado na pesquisa (busca no título ou na descrição)
        if (termoBusca !== "") {
            filtrados = filtrados.filter(function(v) {
                var tituloMatch = v.titulo && v.titulo.toLowerCase().includes(termoBusca);
                var descMatch = v.descricao && v.descricao.toLowerCase().includes(termoBusca);
                return tituloMatch || descMatch;
            });
        }

        renderizarCards(filtrados);
    }

    // Função responsável apenas por desenhar os itens filtrados na tela
    function renderizarCards(campanhas) {
        lista.innerHTML = '';

        if (campanhas.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-emoji">🔍</div>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente mudar os filtros ou o termo digitado na busca.</p>
                </div>`;
            return;
        }

        for (var i = 0; i < campanhas.length; i++) {
            var v = campanhas[i];

            var porcentagem = 0;
            var metaTexto = 'Meta não definida';
            if (v.meta > 0) {
                porcentagem = Math.round((v.arrecadado / v.meta) * 100);
                if (porcentagem > 100) porcentagem = 100;
                metaTexto = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR');
            }

            var idVaquinha = v.id ? v.id.toString() : '';
            var saibaMais = '<a href="../vaquinha/detalhes-vaquinha.html?id=' + idVaquinha + '" class="card-saiba">Saiba mais →</a>';

            var dataTexto = '';
            if (v.dataLimite) {
                dataTexto = 'Até ' + v.dataLimite;
            }

            var imagemHtml = '<div class="card-imagem-placeholder">🤝</div>';
            if (v.imagem && (v.imagem.indexOf('data:image') == 0 || v.imagem.indexOf('http') == 0)) {
                imagemHtml = '<img class="card-imagem" src="' + v.imagem + '" alt="' + v.titulo + '">';
            }

            var card = document.createElement('div');
            card.className = 'card';

            card.innerHTML =
                imagemHtml +
                '<div class="card-corpo">' +
                '<div class="card-topo">' +
                '<span class="card-categoria">' + v.categoria + '</span>' +
                '<span class="card-data">' + dataTexto + '</span>' +
                '</div>' +
                '<h3 class="card-titulo">' + v.titulo + '</h3>' +
                '<p class="card-descricao">' + v.descricao + '</p>' +
                '<div class="card-meta-wrapper">' +
                '<div class="card-meta-label">' +
                '<span>Arrecadado</span>' +
                '<strong>R$ ' + (v.arrecadado || 0).toLocaleString('pt-BR') + '</strong>' +
                '</div>' +
                '<div class="card-barra-fundo">' +
                '<div class="card-barra-fill" style="width: ' + porcentagem + '%"></div>' +
                '</div>' +
                '<div class="card-rodape">' +
                saibaMais +
                '<span class="card-meta-texto">' + metaTexto + '</span>' +
                '</div>' +
                '</div>' +
                '</div>';

            lista.appendChild(card);
        }
    }

    // --- REQUISIÇÃO AJAX ATUALIZADA (BUSCANDO AS CRIAÇÕES DE DENTRO DOS USUÁRIOS) ---
    fetch('http://localhost:3000/usuarios')
    .then(function(response) {
        if (!response.ok) throw new Error("Erro de comunicação com o servidor.");
        return response.json();
    })
    .then(function(usuarios) {
        var mapeamentoCampanhas = [];
        
        // Itera sobre todos os usuários cadastrados no banco
        usuarios.forEach(function(usuario) {
            // Se o usuário possuir um array de criações preenchido, concatena na nossa lista global
            if (usuario.criacoes && Array.isArray(usuario.criacoes)) {
                mapeamentoCampanhas = mapeamentoCampanhas.concat(usuario.criacoes);
            }
        });

        todasAsCampanhas = mapeamentoCampanhas; // Alimenta nossa lista global com todas as criações
        aplicarFiltros();                      // Executa a primeira renderização filtrada por "Vaquinha"
    })
    .catch(function(error) {
        console.error("Erro ao carregar dados do banco json-server:", error);
        if (lista) {
            lista.innerHTML = `<div class="text-center py-5 text-danger">Falha ao sincronizar as campanhas ativas.</div>`;
        }
    });
});