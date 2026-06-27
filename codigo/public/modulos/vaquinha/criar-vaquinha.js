// preview da imagem com compressão automática (Solução 2)
document.getElementById("imagem").addEventListener("change", function () {
  var arquivo = this.files[0]; // guardará o arquivo escolhido

  if (!arquivo) return; // verificando se existe imagem

  var leitor = new FileReader(); // Ferramenta do navegador para ler arquivos

  leitor.onload = function (e) {
    var imgElement = new Image();
    imgElement.src = e.target.result;

    imgElement.onload = function () {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");

      // Define a resolução máxima da imagem para a vaquinha (largura máxima de 600px)
      var MAX_WIDTH = 600;
      var scale = MAX_WIDTH / imgElement.width;
      
      if (imgElement.width > MAX_WIDTH) {
        canvas.width = MAX_WIDTH;
        canvas.height = imgElement.height * scale;
      } else {
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
      }

      // Desenha a imagem redimensionada no canvas
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      // Converte o canvas de volta para Base64, aplicando compressão (qualidade 0.6 = 60%)
      var base64Compactado = canvas.toDataURL("image/jpeg", 0.6);

      var preview = document.getElementById("preview");
      var placeholder = document.getElementById("placeholder-upload");

      // Salva o resultado compactado e leve no preview
      preview.src = base64Compactado;
      preview.style.display = "block";
      placeholder.style.display = "none";
    };
  };

  leitor.readAsDataURL(arquivo);
});

// envio do formulario
document.getElementById("form-vaquinha").addEventListener("submit", function (e) {
  e.preventDefault(); // cancelar o comportamento padrao da pagina para nao recarregar

  // .value pega o valor digitado e trim remove espaços extras
  var titulo      = document.getElementById("titulo").value.trim();
  var descricao   = document.getElementById("descricao").value.trim();
  var categoria   = document.getElementById("categoria").value;
  var tipo        = document.getElementById("tipo").value;
  var meta        = document.getElementById("meta").value.trim();
  var informacoes = document.getElementById("informacoes").value.trim();
  
  // Captura o src do preview (que já estará compactado em Base64 se houver upload)
  var imagemInput = document.getElementById("imagem");
  var imagemSrc = "";
  
  if (imagemInput.files && imagemInput.files[0]) {
    imagemSrc = document.getElementById("preview").src;
  } else {
    // Imagem padrão caso o usuário não envie nenhum arquivo
    imagemSrc = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop";
  }

  // Limpa os erros anteriores antes de validar de novo
  document.getElementById("erro-titulo").textContent    = "";
  document.getElementById("erro-descricao").textContent = "";
  document.getElementById("erro-categoria").textContent = "";
  document.getElementById("erro-tipo").textContent      = "";
  document.getElementById("erro-meta").textContent      = "";

  var temErro = false;
  
  // verificando espaços vazios
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

  if (tipo === "") {
    document.getElementById("erro-tipo").textContent = "Selecione o tipo de doação.";
    temErro = true;
  }

  if (meta === "") {
    document.getElementById("erro-meta").textContent = "A meta é obrigatória.";
    temErro = true;
  }

  // impedir salvamento se houver erro
  if (temErro) return;

  // criação do objeto
  var metaNumero = Number(meta);
  if (isNaN(metaNumero)) {
    metaNumero = 0;
  }

  var novaVaquinha = {
    titulo: titulo,
    descricao: descricao,
    categoria: categoria,
    tipoDoacao: tipo.toLowerCase(),
    meta: metaNumero,
    arrecadado: 0,
    informacoes: informacoes,
    imagem: imagemSrc,  // string Base64 compactada
    emergencial: false,
    dataCriacao: new Date().toISOString().split('T')[0],
    dataLimite: ""
  };

  salvarVaquinha(novaVaquinha); // envia o objeto para o json-server
});

// envia a vaquinha para o json-server e redireciona para os detalhes
function salvarVaquinha(vaquinha) {
  fetch('http://localhost:3000/vaquinhas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vaquinha)
  })
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Erro de limite ou resposta inválida do servidor.");
    }
    return response.json(); // O json-server retorna o objeto criado com o ID gerado
  })
  .then(function (data) {
    // Redirecionamento simplificado na mesma pasta
    window.location.href = "detalhes-vaquinha.html?id=" + data.id;
  })
  .catch(function (error) {
    console.log(error);
    alert("Erro ao salvar a vaquinha. Verifique se o tamanho da imagem não excedeu o limite do json-server.");
  });
}

// reseta tudo
function novaVaquinha() {
  document.getElementById("titulo").value      = "";
  document.getElementById("descricao").value   = "";
  document.getElementById("categoria").value   = "";
  document.getElementById("tipo").value        = "";
  document.getElementById("meta").value        = "";
  document.getElementById("informacoes").value = "";

  var preview = document.getElementById("preview");
  preview.src = "";
  preview.style.display = "none";
  document.getElementById("placeholder-upload").style.display = "flex";
  document.getElementById("imagem").value = "";

  document.getElementById("erro-titulo").textContent    = "";
  document.getElementById("erro-descricao").textContent = "";
  document.getElementById("erro-categoria").textContent = "";
  document.getElementById("erro-tipo").textContent      = "";
  document.getElementById("erro-meta").textContent      = "";

  document.getElementById("form-vaquinha").classList.remove("oculto");
  document.getElementById("mensagem-sucesso").classList.add("oculto");
}