document.addEventListener("DOMContentLoaded", function() {
    
    // --- LÓGICA DE INTERCEPTAÇÃO E TOAST DO PERFIL ---
    var btnPerfil = document.querySelector(".nav-perfil");
    
    if (btnPerfil) {
        btnPerfil.addEventListener("click", function(event) {
            event.preventDefault(); // Evita o comportamento padrão da tag <a>

            // Verifica se o token existe no sessionStorage
            var tokenUsuario = sessionStorage.getItem("usuarioToken");

            if (tokenUsuario) {
                // Usuário LOGADO: Redireciona para a página de perfil/histórico
                window.location.href = "../historico/historico.html"; 
            } else {
                // Usuário NÃO LOGADO: Dispara o Toast e envia para o login
                exibirToast("⚠️ Você não está logado! Redirecionando para o login...", false);
                
                setTimeout(function() {
                    window.location.href = "../login/login.html"; 
                }, 2500);
            }
        });
    }

    // Função interna para criar e animar o fundo escuro + toast centralizado
    function exibirToast(mensagem, eSucesso) {
        var container = document.getElementById("toast-container");
        if (!container) return;

        // Limpa qualquer toast antigo que tenha ficado residual
        container.innerHTML = '';

        var toast = document.createElement("div");
        toast.className = "custom-toast";
        if (eSucesso) toast.classList.add("success");
        
        toast.textContent = mensagem;
        container.appendChild(toast);

        // 1. Ativa o fundo escuro primeiro
        container.classList.add("mostrar-fundo");

        // 2. Logo em seguida, faz o card central surgir com efeito de zoom
        setTimeout(function() {
            toast.classList.add("mostrar-card");
        }, 50);

        // 3. Remove o efeito após o tempo do redirecionamento
        setTimeout(function() {
            toast.classList.remove("mostrar-card");
            container.classList.remove("mostrar-fundo");
            setTimeout(function() {
                toast.remove();
            }, 250);
        }, 2200);
    }


    // --- BUSCA AS VAQUINHAS CADASTRADAS E MOSTRA NA HOME ---
    fetch('http://localhost:3000/vaquinhas')
    .then(function(response) {
        return response.json();
    })
    .then(function(vaquinhas) {
        var lista = document.getElementById('lista-campanhas');
        if (!lista) return;
        lista.innerHTML = '';

        for (var i = 0; i < vaquinhas.length; i++) {
            var v = vaquinhas[i];

            // Calcula a porcentagem se a meta for um número válido
            var porcentagem = 0;
            var metaTexto = 'Meta não definida';
            if (v.meta > 0) {
                porcentagem = Math.round((v.arrecadado / v.meta) * 100);
                if (porcentagem > 100) {
                    porcentagem = 100;
                }
                metaTexto = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR');
            }

            // Garante que o id seja tratado como string na URL
            var idVaquinha = v.id ? v.id.toString() : '';
            var saibaMais = '<a href="../vaquinha/detalhes-vaquinha.html?id=' + idVaquinha + '" class="card-saiba">Saiba mais →</a>';

            // Só mostra a data limite se ela existir
            var dataTexto = '';
            if (v.dataLimite) {
                dataTexto = 'Até ' + v.dataLimite;
            }

            var card = document.createElement('div');
            card.className = 'card';

            card.innerHTML =
                '<div class="card-imagem-placeholder">🤝</div>' +
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
                '<strong>R$ ' + v.arrecadado.toLocaleString('pt-BR') + '</strong>' +
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
    })
    .catch(function(error) {
        console.error("Erro ao carregar vaquinhas:", error);
    });
});