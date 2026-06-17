document.addEventListener("DOMContentLoaded", async () => {
    // Endpoints do seu JSON Server
    const API_USUARIOS = "http://localhost:3000/usuarios"; 
    const API_VAQUINHAS = "http://localhost:3000/vaquinhas"; 

    // 1. Recupera os IDs necessários (Sessão e URL)
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");
    const urlParams = new URLSearchParams(window.location.search);
    const idDaVaquinha = urlParams.get('id') || "12312"; 

    // Elementos do DOM - Resumo da Vaquinha
    const resumoTag = document.getElementById("resumo-tag");
    const resumoTitulo = document.getElementById("resumo-titulo");

    // Elementos do DOM - Formulário e Valores
    const donationAmountInput = document.getElementById("donation-amount");
    const txtSubtotal = document.getElementById("txt-subtotal");
    const txtTotal = document.getElementById("txt-total");
    const userNameInput = document.getElementById("user-name");
    const userCpfInput = document.getElementById("user-cpf");
    const userEmailInput = document.getElementById("user-email");
    const btnGerarPix = document.getElementById("btn-gerar-pix");
    const formCartao = document.getElementById("form-cartao");

    // Variável para guardar os dados da vaquinha em memória temporária
    let dadosDaVaquinhaGlobal = null;

    // --- PASSO 1: BUSCAR E EXIBIR AS INFORMAÇÕES DA VAQUINHA ---
    async function carregarDadosDaVaquinha() {
        try {
            const resposta = await fetch(`${API_VAQUINHAS}/${idDaVaquinha}`);
            if (!resposta.ok) throw new Error("Vaquinha não encontrada no banco de dados.");
            
            dadosDaVaquinhaGlobal = await resposta.json();

            // Atualiza os textos do lado direito (Resumo) com os dados vindos do db.json
            if (resumoTitulo) resumoTitulo.textContent = dadosDaVaquinhaGlobal.titulo || dadosDaVaquinhaGlobal.vaquinha_titulo;
            if (resumoTag) resumoTag.textContent = dadosDaVaquinhaGlobal.tag || dadosDaVaquinhaGlobal.vaquinha_tag;
            
        } catch (erro) {
            console.error("Erro ao carregar dados da vaquinha:", erro);
        }
    }

    // Executa a busca inicial ao abrir a página
    await carregarDadosDaVaquinha();


    // --- PASSO 2: ATUALIZAÇÃO DINÂMICA DOS VALORES EM TELA ---
    donationAmountInput.addEventListener("input", (e) => {
        let valor = parseFloat(e.target.value);
        if (isNaN(valor) || valor < 0) valor = 0;
        
        const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        txtSubtotal.textContent = valorFormatado;
        txtTotal.textContent = valorFormatado;
    });


    // --- PASSO 3: PROCESSAR A DOAÇÃO (SALVA NO USUÁRIO E ATUALIZA A VAQUINHA) ---
    async function processarDoacao(e, metodoPagamento) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!TOKEN_USUARIO) {
            alert("Usuário não identificado. Por favor, faça login para continuar.");
            return;
        }

        const nome = userNameInput.value.trim();
        const cpf = userCpfInput.value.trim();
        const email = userEmailInput.value.trim();
        const valorDoacao = parseFloat(donationAmountInput.value);

        if (!nome || !cpf || !email) {
            alert("Por favor, preencha todos os dados de identificação.");
            return;
        }

        if (isNaN(valorDoacao) || valorDoacao < 5) {
            alert("O valor mínimo de contribuição é R$ 5,00.");
            return;
        }

        try {
            // A) Busca o usuário logado filtrando pelo token do sessionStorage
            const respostaUserGet = await fetch(`${API_USUARIOS}?token=${TOKEN_USUARIO}`);
            if (!respostaUserGet.ok) throw new Error("Erro ao buscar dados do usuário.");
            
            const usuariosEncontrados = await respostaUserGet.json();
            if (usuariosEncontrados.length === 0) throw new Error("Usuário não localizado.");

            const usuarioAtual = usuariosEncontrados[0];
            const ID_REAL_DO_USUARIO = usuarioAtual.id; 

            // Gera o ID único desta transação específica
            const idTransacaoDoacao = "doc_" + Math.random().toString(36).substr(2, 9);

            // Monta o objeto da nova doação
            const novaDoacao = {
                id_doacao: idTransacaoDoacao,
                vaquinha_id: idDaVaquinha, 
                vaquinha_titulo: resumoTitulo.textContent,
                vaquinha_tag: resumoTag.textContent,
                valor: valorDoacao,
                metodo: metodoPagamento,
                data: new Date().toISOString(),
                status: metodoPagamento === 'Pix' ? 'Aguardando Pagamento' : 'Aprovado'
            };

            // Junta as doações antigas do usuário com a nova
            const listaDoacoesAtualizada = [...(usuarioAtual.doacoes || []), novaDoacao];

            // B) REQUISIÇÃO 1: Atualiza a lista de doações do Usuário
            const respostaPatchUsuario = await fetch(`${API_USUARIOS}/${ID_REAL_DO_USUARIO}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doacoes: listaDoacoesAtualizada })
            });

            if (!respostaPatchUsuario.ok) throw new Error("Falha ao salvar a doação no perfil do usuário.");

            // C) CALCULO DO NOVO TOTAL DA VAQUINHA:
            // Pega o valor que já estava arrecadado no banco (se não existir, assume 0) e soma a nova doação
            const arrecadadoAtual = parseFloat(dadosDaVaquinhaGlobal.arrecadado || 0);
            const novoTotalArrecadado = arrecadadoAtual + valorDoacao;

            // D) REQUISIÇÃO 2: Atualiza o montante acumulado direto na rota da Vaquinha
            const respostaPatchVaquinha = await fetch(`${API_VAQUINHAS}/${idDaVaquinha}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    arrecadado: novoTotalArrecadado // Altere aqui se o nome do campo no seu JSON for diferente
                })
            });

            if (respostaPatchVaquinha.ok) {
                // Redireciona para a página de sucesso/pesquisa levando o ID gerado
                window.location.href = `sucesso.html?id=${idTransacaoDoacao}`;
            } else {
                throw new Error("Falha ao atualizar o saldo da vaquinha.");
            }

        } catch (erro) {
            console.error("Erro na transação:", erro);
            alert("Falha ao processar doação. Verifique a conexão com o servidor.");
        }
    }

    // Ouvintes de eventos dos botões de pagamento
    btnGerarPix.addEventListener("click", (e) => {
        processarDoacao(e, "Pix");
    });

    formCartao.addEventListener("submit", (e) => {
        processarDoacao(e, "Cartão de Crédito");
    });
});