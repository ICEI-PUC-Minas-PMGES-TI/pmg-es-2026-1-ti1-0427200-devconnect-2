document.addEventListener("DOMContentLoaded", function() {

    // --- 1. TRAVA DE SEGURANÇA: VERIFICAÇÃO DE USUÁRIO LOGADO ---
    var tokenUsuario = sessionStorage.getItem("usuarioToken");
    
    if (!tokenUsuario) {
        alert("⚠️ Você precisa estar logado para criar uma Vaquinha ou cadastrar uma ONG!");
        window.location.href = "../login/login.html";
        return; // Interrompe o restante do script
    }


    // --- 2. GERENCIAMENTO DAS ABAS DINÂMICAS ---
    var tipoCadastroAtivo = "Vaquinha"; // Define o tipo atual

    var abaVaquinha = document.getElementById("aba-vaquinha");
    var abaOng = document.getElementById("aba-ong");
    
    // Campos específicos de ONG
    var blocoRazao = document.getElementById("bloco-razao");
    var blocoCnpj = document.getElementById("bloco-cnpj");
    var blocoSite = document.getElementById("bloco-site");
    
    // Labels e placeholders mutáveis
    var labelTitulo = document.getElementById("label-titulo");
    var inputTitulo = document.getElementById("titulo");
    var btnSubmit = document.getElementById("btn-submit");

    function alternarAba(tipo) {
        tipoCadastroAtivo = tipo;

        if (tipo === "Vaquinha") {
            abaVaquinha.classList.add("ativo");
            abaVaquinha.style.borderBottomColor = "var(--verde-medio)";
            abaVaquinha.style.color = "var(--verde-medio)";
            
            abaOng.classList.remove("ativo");
            abaOng.style.borderBottomColor = "transparent";
            abaOng.style.color = "var(--cinza-texto)";

            // Oculta campos de ONG
            blocoRazao.classList.add("oculto");
            blocoCnpj.classList.add("oculto");
            blocoSite.classList.add("oculto");

            // Adapta textos
            labelTitulo.textContent = "Título da Vaquinha *";
            inputTitulo.placeholder = "Ex: Ajuda para cirurgia do Totó";
            btnSubmit.textContent = "Salvar e Visualizar Vaquinha";
        } else {
            abaOng.classList.add("ativo");
            abaOng.style.borderBottomColor = "var(--verde-medio)";
            abaOng.style.color = "var(--verde-medio)";
            
            abaVaquinha.classList.remove("ativo");
            abaVaquinha.style.borderBottomColor = "transparent";
            abaVaquinha.style.color = "var(--cinza-texto)";

            // Mostra campos de ONG
            blocoRazao.classList.remove("oculto");
            blocoCnpj.classList.remove("oculto");
            blocoSite.classList.remove("oculto");

            // Adapta textos
            labelTitulo.textContent = "Nome da Campanha da ONG *";
            inputTitulo.placeholder = "Ex: Arrecadação de Agasalhos de Inverno";
            btnSubmit.textContent = "Cadastrar e Visualizar ONG";
        }
    }

    abaVaquinha.addEventListener("click", function() { alternarAba("Vaquinha"); });
    abaOng.addEventListener("click", function() { alternarAba("ONG"); });


    // --- 3. COMPRESSÃO E PREVIEW DA IMAGEM ---
    document.getElementById("imagem").addEventListener("change", function () {
        var arquivo = this.files[0];
        if (!arquivo) return;

        var leitor = new FileReader();
        leitor.onload = function (e) {
            var imgElement = new Image();
            imgElement.src = e.target.result;

            imgElement.onload = function () {
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");

                var MAX_WIDTH = 600;
                var scale = MAX_WIDTH / imgElement.width;
                
                if (imgElement.width > MAX_WIDTH) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = imgElement.height * scale;
                } else {
                    canvas.width = imgElement.width;
                    canvas.height = imgElement.height;
                }

                ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
                var base64Compactado = canvas.toDataURL("image/jpeg", 0.6);

                var preview = document.getElementById("preview");
                var placeholder = document.getElementById("placeholder-upload");

                preview.src = base64Compactado;
                preview.style.display = "block";
                placeholder.style.display = "none";
            };
        };
        leitor.readAsDataURL(arquivo);
    });


    // --- 4. VALIDAÇÃO E ENVIO DO FORMULÁRIO ---
    document.getElementById("form-vaquinha").addEventListener("submit", function (e) {
        e.preventDefault();

        var titulo      = document.getElementById("titulo").value.trim();
        var descricao   = document.getElementById("descricao").value.trim();
        var categoria   = document.getElementById("categoria").value;
        var tipoDoacao  = document.getElementById("tipo").value;
        var meta        = document.getElementById("meta").value.trim();
        var informacoes = document.getElementById("informacoes").value.trim();
        
        // Novos campos
        var razaoSocial = document.getElementById("razao-social").value.trim();
        var cnpj        = document.getElementById("cnpj").value.trim();
        var site        = document.getElementById("site").value.trim();

        var imagemInput = document.getElementById("imagem");
        var imagemSrc = "";
        
        if (imagemInput.files && imagemInput.files[0]) {
            imagemSrc = document.getElementById("preview").src;
        } else {
            imagemSrc = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop";
        }

        // Limpa erros anteriores
        document.getElementById("erro-titulo").textContent = "";
        document.getElementById("erro-descricao").textContent = "";
        document.getElementById("erro-categoria").textContent = "";
        document.getElementById("erro-tipo").textContent = "";
        document.getElementById("erro-meta").textContent = "";
        if(document.getElementById("erro-razao")) document.getElementById("erro-razao").textContent = "";
        if(document.getElementById("erro-cnpj")) document.getElementById("erro-cnpj").textContent = "";

        var temErro = false;
        
        // Validações padrões comuns
        if (titulo === "") {
            document.getElementById("erro-titulo").textContent = "O título é obrigatório.";
            temErro = true;
        }
        if (descricao === "") {
            document.getElementById("erro-descricao").textContent = "A descrição é obrigatória.";
            temErro = true;
        }
        if (categoria === "") {
            document.getElementById("erro-categoria").textContent = "Selecione a categoria.";
            temErro = true;
        }
        if (tipoDoacao === "") {
            document.getElementById("erro-tipo").textContent = "Selecione o tipo de doação.";
            temErro = true;
        }
        if (meta === "") {
            document.getElementById("erro-meta").textContent = "A meta é obrigatória.";
            temErro = true;
        }

        // Validações exclusivas para o fluxo de ONG
        if (tipoCadastroAtivo === "ONG") {
            if (razaoSocial === "") {
                document.getElementById("erro-razao").textContent = "A Razão Social é obrigatória para ONGs.";
                temErro = true;
            }
            if (cnpj === "") {
                document.getElementById("erro-cnpj").textContent = "O CNPJ é obrigatório para cadastrar uma ONG.";
                temErro = true;
            }
        }

        if (temErro) return;

        var metaNumero = Number(meta);
        if (isNaN(metaNumero)) metaNumero = 0;

        // Montagem estruturada do objeto unificado enviando o parâmetro "tipo"
        var novaCampanha = {
            tipo: tipoCadastroAtivo, // Salva se é "Vaquinha" ou "ONG"
            titulo: titulo,
            descricao: descricao,
            categoria: categoria,
            tipoDoacao: tipoDoacao.toLowerCase(),
            meta: metaNumero,
            arrecadado: 0,
            informacoes: informacoes,
            imagem: imagemSrc,
            emergencial: false,
            dataCriacao: new Date().toISOString().split('T')[0],
            dataLimite: ""
        };

        // Incrementa atributos de ONG se for o caso
        if (tipoCadastroAtivo === "ONG") {
            novaCampanha.razaoSocial = razaoSocial;
            novaCampanha.cnpj = cnpj;
            novaCampanha.site = site;
        }

        salvarCampanha(novaCampanha);
    });

    // --- 5. SALVAMENTO DIRETO NO ARRAY DE CRIAÇÕES DO USUÁRIO ---
    async function salvarCampanha(campanha) {
        const API_URL = "http://localhost:3000/usuarios";

        try {
            // 1. Busca o registro do usuário logado via token
            const respostaBusca = await fetch(`${API_URL}?token=${tokenUsuario}`);
            if (!respostaBusca.ok) throw new Error("Erro ao consultar o servidor de usuários.");

            const usuarios = await respostaBusca.json();
            if (usuarios.length === 0) throw new Error("Usuário correspondente ao token não foi encontrado.");

            const usuarioAtual = usuarios[0];

            // 2. Garante a existência do array 'criacoes' no objeto do usuário
            if (!usuarioAtual.criacoes) {
                usuarioAtual.criacoes = [];
            }

            // Atribui ID local baseado no tamanho atual e o status padrão
            campanha.id = usuarioAtual.criacoes.length + 1;
            campanha.status = "Ativa";

            // 3. Adiciona a nova vaquinha/ong dentro da conta do usuário
            usuarioAtual.criacoes.push(campanha);

            // 4. Envia o objeto modificado por completo atualizando o endpoint dele
            const respostaAtualizacao = await fetch(`${API_URL}/${usuarioAtual.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioAtual)
            });

            if (!respostaAtualizacao.ok) throw new Error("Erro ao injetar os novos dados cadastrais.");

            alert(`🎉 ${campanha.tipo} cadastrada com sucesso no seu perfil!`);
            
            // Redireciona de volta para a aba "Minhas criações" recém configurada no perfil
            window.location.href = "../home-page/home_page.html";

        } catch (error) {
            console.error("Falha na operação de sincronização do banco:", error);
            alert("Não foi possível salvar o formulário no banco de dados.");
        }
    }
});