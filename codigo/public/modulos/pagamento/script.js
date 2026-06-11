document.addEventListener('DOMContentLoaded', () => {
    const donationInput = document.getElementById('donation-amount');
    const txtSubtotal = document.getElementById('txt-subtotal');
    const txtTotal = document.getElementById('txt-total');
    const txtTituloResumo = document.getElementById('resumo-titulo');
    const txtTagResumo = document.getElementById('resumo-tag');
    
    const inputUserName = document.getElementById('user-name');
    const inputUserCpf = document.getElementById('user-cpf');
    const inputUserEmail = document.getElementById('user-email');

    const btnPix = document.getElementById('btn-gerar-pix');
    const formCartao = document.getElementById('form-cartao');

    const API_URL = 'http://localhost:3000';

    const urlParams = new URLSearchParams(window.location.search);
    const tipoItem = urlParams.get('tipo'); 
    const idItem = urlParams.get('id');     

    let itemAtual = null;

    async function verificarDestino() {
        if (!tipoItem || !idItem) return;
        try {
            const response = await fetch(`${API_URL}/${tipoItem}/${idItem}`);
            if (!response.ok) throw new Error();
            
            itemAtual = await response.json();

            const nomeDestino = itemAtual.titulo || itemAtual.nome || "Instituição";
            const tagDestino = itemAtual.tag || itemAtual.categoria || itemAtual.causa || "Geral";

            txtTituloResumo.textContent = nomeDestino;
            txtTagResumo.textContent = tagDestino;
        } catch (error) {
            alert("⚠️ Erro: Este destino (Vaquinha ou ONG) não foi encontrado no banco de dados.");
        }
    }

    function atualizarValoresNaTela() {
        let valor = parseFloat(donationInput.value);
        if (isNaN(valor) || valor < 0) valor = 0;
        const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        txtSubtotal.textContent = valorFormatado;
        txtTotal.textContent = valorFormatado;
    }

    function validarDadosUsuario() {
        const nome = inputUserName.value.trim();
        const cpf = inputUserCpf.value.trim();
        const email = inputUserEmail.value.trim();

        if (!nome || !cpf || !email) {
            alert("Por favor, preencha Nome, CPF e E-mail no topo da página.");
            return null;
        }
        return { nome, cpf, email };
    }

    async function processarTransacaoCompleta(dadosFormaPagamento) {
        const valorDoacao = parseFloat(donationInput.value);
        const dadosUsuario = validarDadosUsuario();

        if (!dadosUsuario) return false;
        if (isNaN(valorDoacao) || valorDoacao < 5) {
            alert('O valor mínimo para doação é R$ 5,00');
            return false;
        }
        if (!itemAtual) {
            alert("Não é possível processar a doação para um destino inexistente.");
            return false;
        }

        const saldoAnterior = parseFloat(itemAtual.valor_arrecadado) || 0;
        const novoSaldo = saldoAnterior + valorDoacao;
        
        let dadosAtualizacao = { valor_arrecadado: novoSaldo };
        if (itemAtual.meta) {
            const novoProgresso = Math.min(Math.round((novoSaldo / itemAtual.meta) * 100), 100);
            dadosAtualizacao.progresso_porcentagem = novoProgresso;
        }

        const idPagamentoUnico = "PAG-" + Math.floor(100000 + Math.random() * 900000);
        const nomeDestino = itemAtual.titulo || itemAtual.nome || "Não identificado";
        
        const registroDoacao = {
            idPagamento: idPagamentoUnico,
            destinoTipo: tipoItem,       
            destinoId: idItem,           
            destinoTitulo: nomeDestino,
            valorDoado: valorDoacao,
            formaPagamento: dadosFormaPagamento,
            doadorNome: dadosUsuario.nome,   
            doadorCpf: dadosUsuario.cpf,     
            doadorEmail: dadosUsuario.email, 
            dataHora: new Date().toISOString()
        };

        try {
            const atualizaSaldo = await fetch(`${API_URL}/${tipoItem}/${idItem}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizacao)
            });

            const criaDoacao = await fetch(`${API_URL}/doacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registroDoacao)
            });

            if (atualizaSaldo.ok && criaDoacao.ok) {
                itemAtual.valor_arrecadado = novoSaldo;
                return idPagamentoUnico; 
            } else {
                alert("Erro ao gravar os dados no servidor.");
                return false;
            }
        } catch (error) {
            alert("Erro de conexão com o banco de dados.");
            return false;
        }
    }

    donationInput.addEventListener('input', atualizarValoresNaTela);

    if (btnPix) {
        btnPix.addEventListener('click', async () => {
            const idSucesso = await processarTransacaoCompleta("Pix");
            if (idSucesso) {
                alert(`✅ Pix Gerado!\n\nID do Pagamento: ${idSucesso}`);
                inputUserName.value = ""; inputUserCpf.value = ""; inputUserEmail.value = "";
            }
        });
    }

    if (formCartao) {
        formCartao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idSucesso = await processarTransacaoCompleta("Cartão de Crédito");
            if (idSucesso) {
                alert(`🎉 Sucesso!\n\nDoação aprovada!\nID do Pagamento: ${idSucesso}`);
                formCartao.reset();
                inputUserName.value = ""; inputUserCpf.value = ""; inputUserEmail.value = "";
            }
        });
    }

    verificarDestino();
});