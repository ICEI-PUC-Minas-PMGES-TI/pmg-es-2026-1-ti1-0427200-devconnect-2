document.addEventListener("DOMContentLoaded", async () => {
    const API_USUARIOS = "http://localhost:3000/usuarios";
    const API_ANONIMOS = "http://localhost:3000/anonimos";

    // 1. Pega os parâmetros da URL e da sessão
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");
    const urlParams = new URLSearchParams(window.location.search);
    const idBuscado = urlParams.get('id');

    // Validação de segurança inicial do ID do comprovante
    if (!idBuscado) {
        console.error("Erro: Nenhum ID de doação foi passado na URL.");
        mostrarToast("Dados da doação não informados na URL.", "error");
        return;
    }

    // Função para exibir o Toast centralizado com o padrão visual do projeto
    function mostrarToast(mensagem, tipo = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        container.innerHTML = '';

        const backdrop = document.createElement('div');
        backdrop.className = 'toast-backdrop-modal';

        const toast = document.createElement('div');
        toast.className = `toast-modal toast-${tipo}`;
        
        const icone = tipo === 'success' ? '💚' : '⚠️';
        toast.innerHTML = `<span>${icone}</span> <span class="toast-text">${mensagem}</span>`;

        backdrop.appendChild(toast);
        container.appendChild(backdrop);

        setTimeout(() => {
            backdrop.classList.add('show');
        }, 10);

        setTimeout(() => {
            backdrop.classList.remove('show');
            setTimeout(() => backdrop.remove(), 300);
        }, 2500); 
    }

    // Função auxiliar para renderizar os dados encontrados no HTML
    function preencherDadosTela(doacao) {
        const txtTitulo = document.getElementById('view-titulo');
        const txtMetodo = document.getElementById('view-metodo');
        const txtValor = document.getElementById('view-valor');

        if (txtTitulo) txtTitulo.textContent = doacao.vaquinha_titulo;
        if (txtMetodo) txtMetodo.textContent = doacao.metodo;
        
        if (txtValor) {
            txtValor.textContent = Number(doacao.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }

        // Elementos da seção Pix
        const pixSection = document.getElementById('pix-section');
        const mainTitle = document.getElementById('main-title');
        const mainSubtitle = document.getElementById('main-subtitle');

        if (doacao.metodo === 'Pix') {
            if (mainTitle) mainTitle.textContent = 'Pedido de Doação Gerado!';
            if (mainSubtitle) mainSubtitle.textContent = 'Quase lá! Transfira o Pix abaixo para confirmar sua ajuda.';
            if (pixSection) pixSection.style.display = 'block';

            // === GERADOR DO GRÁFICO DO QR CODE ===
            // Busca a tag <img> dentro da sua seção do Pix
            const imgQrCode = document.getElementById('img-qrcode') || pixSection.querySelector('img');
            
            // Monta a string estruturada com os dados reais vindos da rota do db.json
            const dadosPixCopiaECola = `00020101021226830014br.gov.bcb.pix0136ajuda@vaquinhasolidaria.com.br5204000053039865405${Number(doacao.valor).toFixed(2)}5802BR5920Vaquinha_Solidaria6009Belo_Horizonte62250521${doacao.id_doacao}6304`;

            if (imgQrCode) {
                // Substitui o source da imagem pela chamada da API pública gerando o QR Code quadrado
                imgQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(dadosPixCopiaECola)}`;
                imgQrCode.alt = "QR Code para Pagamento Pix";
                imgQrCode.style.display = "block";
                imgQrCode.style.margin = "20px auto"; // Garante centralização e espaçamento limpo
            }

        } else {
            if (mainTitle) mainTitle.textContent = 'Doação Confirmada com Sucesso!';
            if (mainSubtitle) mainSubtitle.textContent = 'Obrigado por fazer a diferença!';
            if (pixSection) pixSection.style.display = 'none';
        }
    }

    try {
        let doacaoEncontrada = null;

        // TENTATIVA A: Se houver token, tenta buscar no histórico do usuário logado
        if (TOKEN_USUARIO) {
            console.log(`Buscando transação no usuário logado...`);
            const resposta = await fetch(`${API_USUARIOS}?token=${TOKEN_USUARIO}`);
            
            if (resposta.ok) {
                const usuariosEncontrados = await resposta.json();
                if (usuariosEncontrados.length > 0) {
                    const usuario = usuariosEncontrados[0];
                    doacaoEncontrada = usuario.doacoes.find(d => String(d.id_doacao) === String(idBuscado));
                }
            }
        }

        // TENTATIVA B: Se não achou no usuário (ou se era anônimo), busca na tabela de 'anonimos'
        if (!doacaoEncontrada) {
            console.log(`Buscando transação na base de dados de anônimos...`);
            const respostaAnonimo = await fetch(`${API_ANONIMOS}?id_doacao=${idBuscado}`);
            
            if (respostaAnonimo.ok) {
                const anonimosEncontrados = await respostaAnonimo.json();
                if (anonimosEncontrados.length > 0) {
                    doacaoEncontrada = anonimosEncontrados[0];
                }
            }
        }

        // Se encontrou a doação em qualquer uma das bases de dados, exibe com sucesso!
        if (doacaoEncontrada) {
            console.log("Doação localizada:", doacaoEncontrada);
            preencherDadosTela(doacaoEncontrada);
            
            // Exibe o Toast informando o sucesso da transação
            mostrarToast("Doação registrada com sucesso!", "success");
        } else {
            // Caso rode os dois bancos e não ache esse ID
            console.warn(`A doação ${idBuscado} não foi localizada no sistema.`);
            mostrarToast("Doação não encontrada no histórico do sistema.", "error");
        }

    } catch (erro) {
        console.error("Erro crítico ao processar os dados:", erro);
        mostrarToast("Não foi possível carregar os detalhes do seu pagamento.", "error");
    }
});