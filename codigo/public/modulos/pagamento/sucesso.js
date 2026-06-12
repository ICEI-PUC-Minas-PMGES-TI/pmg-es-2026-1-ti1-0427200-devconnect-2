document.addEventListener("DOMContentLoaded", async () => {
    // URL base do seu JSON Server
    const API_URL = "http://localhost:3000/usuarios";

    // 1. Pega o token do usuário logado direto do sessionStorage
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");

    // 2. Pega o ID da doação que veio na URL da página (?id=doc_...)
    const urlParams = new URLSearchParams(window.location.search);
    const idBuscado = urlParams.get('id');

    // Validações de segurança iniciais
    if (!TOKEN_USUARIO) {
        console.error("Erro: 'usuarioToken' não foi encontrado no sessionStorage.");
        alert("Usuário não identificado. Por favor, faça login novamente.");
        return;
    }

    if (!idBuscado) {
        console.error("Erro: Nenhum ID de doação foi passado na URL.");
        alert("Dados da doação não informados na URL.");
        return;
    }

    try {
        // 3. Busca o usuário filtrando pelo campo 'token' (Seguro caso o sessionStorage use o UUID)
        console.log(`Buscando usuário com o token: ${TOKEN_USUARIO}`);
        const resposta = await fetch(`${API_URL}?token=${TOKEN_USUARIO}`);
        
        if (!resposta.ok) {
            throw new Error("Erro ao conectar com o servidor.");
        }
        
        const usuariosEncontrados = await resposta.json();

        // Verifica se a busca retornou algum usuário na lista
        if (usuariosEncontrados.length === 0) {
            throw new Error("Nenhum usuário com esse token foi encontrado no db.json.");
        }

        // Pega o primeiro usuário retornado da busca
        const usuario = usuariosEncontrados[0];
        console.log("Usuário localizado com sucesso:", usuario);

        // 4. Procura a doação exata dentro do array 'doacoes' usando o seu padrão 'id_doacao'
        const doacaoEncontrada = usuario.doacoes.find(d => String(d.id_doacao) === String(idBuscado));

        if (!doacaoEncontrada) {
            console.warn(`A doação ${idBuscado} não foi encontrada na lista deste usuário.`);
            alert("Doação não encontrada no seu histórico.");
            return;
        }

        console.log("Doação encontrada!", doacaoEncontrada);

        // 5. Injeta as informações encontradas nos elementos do seu HTML
        const txtTitulo = document.getElementById('view-titulo');
        const txtMetodo = document.getElementById('view-metodo');
        const txtValor = document.getElementById('view-valor');

        if (txtTitulo) txtTitulo.textContent = doacaoEncontrada.vaquinha_titulo;
        if (txtMetodo) txtMetodo.textContent = doacaoEncontrada.metodo;
        
        if (txtValor) {
            txtValor.textContent = Number(doacaoEncontrada.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }

        // 6. Configura a exibição especial caso o pagamento seja Pix
        const pixSection = document.getElementById('pix-section');
        const mainTitle = document.getElementById('main-title');
        const mainSubtitle = document.getElementById('main-subtitle');

        if (doacaoEncontrada.metodo === 'Pix') {
            if (mainTitle) mainTitle.textContent = 'Pedido de Doação Gerado!';
            if (mainSubtitle) mainSubtitle.textContent = 'Quase lá! Transfira o Pix abaixo para confirmar sua ajuda.';
            if (pixSection) pixSection.style.display = 'block';
        }

    } catch (erro) {
        console.error("Erro crítico ao processar os dados:", erro);
        alert("Não foi possível carregar os detalhes do seu pagamento.");
    }
});