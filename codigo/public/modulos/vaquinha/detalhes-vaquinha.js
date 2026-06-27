var params = new URLSearchParams(window.location.search);
var id = params.get('id');

if (id == null) {
    document.getElementById('titulo').textContent = 'Campanha não encontrada.';
} else {
    // Busca todos os usuários para revirar as 'criacoes'
    fetch('http://localhost:3000/usuarios')
    .then(function(response) {
        if (!response.ok) throw new Error("Erro ao acessar o servidor.");
        return response.json();
    })
    .then(function(usuarios) {
        var campanhaEncontrada = null;
        var donoDaCampanhaId = null;

        // Procura a criação com o ID correspondente em cada usuário
        for (var i = 0; i < usuarios.length; i++) {
            var usuario = usuarios[i];
            if (usuario.criacoes && Array.isArray(usuario.criacoes)) {
                var busca = usuario.criacoes.find(c => c.id.toString() === id.toString());
                if (busca) {
                    campanhaEncontrada = busca;
                    donoDaCampanhaId = usuario.id; // Guarda o ID do usuário dono
                    break;
                }
            }
        }

        // Se não achou em nenhum usuário
        if (!campanhaEncontrada) {
            document.getElementById('titulo').textContent = 'Vaquinha ou ONG não encontrada.';
            return;
        }

        var v = campanhaEncontrada;

        // Preenche os dados básicos na tela
        document.getElementById('categoria').textContent = v.categoria || "Geral";
        document.getElementById('titulo').textContent = v.titulo;
        document.getElementById('descricao').textContent = v.descricao;
        document.getElementById('tipoDoacao').textContent = v.tipoDoacao || "Dinheiro";
        document.getElementById('dataCriacao').textContent = v.dataCriacao || "";
        
        var arrecadado = v.arrecadado || 0;
        document.getElementById('arrecadado').textContent = 'R$ ' + arrecadado.toLocaleString('pt-BR');

        // ================= ATUALIZAÇÃO DO LINK DE DOAÇÃO =================
        // Passa o ID da criação E o ID do usuário dono para o pagamento conseguir atualizar o PUT depois
        var btnDoar = document.getElementById('btnDoar');
        if (btnDoar) {
            var tipoUrl = v.tipo === "ONG" ? "ongs" : "vaquinhas";
            btnDoar.href = `../pagamento/index.html?tipo=${tipoUrl}&id=${id}&usuarioId=${donoDaCampanhaId}`;
        }
        // =================================================================

        var porcentagem = 0;
        if (v.meta > 0) {
            porcentagem = Math.round((arrecadado / v.meta) * 100);
            if (porcentagem > 100) {
                porcentagem = 100;
            }
            document.getElementById('metaTexto').textContent = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR');
        } else {
            document.getElementById('metaTexto').textContent = 'Meta não definida';
        }

        var barraProgresso = document.getElementById('barraProgresso');
        if (barraProgresso) barraProgresso.style.width = porcentagem + '%';
        
        var txtPorcentagem = document.getElementById('porcentagem');
        if (txtPorcentagem) txtPorcentagem.textContent = porcentagem + '% da meta atingida';

        // Só mostra a data limite se ela existir
        if (v.dataLimite) {
            if (document.getElementById('dataLimite')) document.getElementById('dataLimite').textContent = v.dataLimite;
            if (document.getElementById('dataLimiteTopo')) document.getElementById('dataLimiteTopo').textContent = 'Até ' + v.dataLimite;
        } else {
            var linhaData = document.getElementById('linhaDataLimite');
            if (linhaData) linhaData.classList.add('oculto');
        }

        // Só mostra o aviso de emergencial se for true
        if (v.emergencial !== true) {
            var linhaEmergencial = document.getElementById('linhaEmergencial');
            if (linhaEmergencial) linhaEmergencial.classList.add('oculto');
        }

        // Suporta imagens locais (Base64) e links externos (Unsplash/HTTP)
        if (v.imagem && (v.imagem.indexOf('data:image') == 0 || v.imagem.indexOf('http') == 0)) {
            var img = document.createElement('img');
            img.src = v.imagem;
            img.alt = v.titulo;
            var containerImg = document.getElementById('imagemVaquinha');
            if (containerImg) {
                containerImg.innerHTML = '';
                containerImg.appendChild(img);
            }
        }

        // Só mostra informações adicionais se existirem
        if (v.informacoes) {
            if (document.getElementById('informacoes')) document.getElementById('informacoes').textContent = v.informacoes;
        } else {
            var blocoInfo = document.getElementById('blocoInformacoes');
            if (blocoInfo) blocoInfo.classList.add('oculto');
        }

        // Oculta link antigo de ONG avulsa se não fizer sentido no novo escopo estrutural
        var linkOng = document.getElementById('linkOng');
        if (linkOng) {
            if (v.ongId) {
                linkOng.href = '../detalhes-ong/detalhes-ong.html?id=' + v.ongId;
            } else {
                linkOng.classList.add('oculto');
            }
        }
    })
    .catch(function(error) {
        document.getElementById('titulo').textContent = 'Erro ao carregar os detalhes da campanha.';
        console.error("Erro na busca detalhada por usuários:", error);
    });
}