//preview da imagem
//A imagem é convertida para base64 (um texto longo que representa a imagem) e esse texto é enviado junto com os outros dados.
document.getElementById("imagem").addEventListener("change", function () {
  var arquivo = this.files[0] //guardara os arquivos escolhidos

  if (!arquivo) return  //verificando se existe imagem

  var leitor = new FileReader() // Ferramenta do navegador para ler arquivos


  leitor.onload = function (e) {
    var preview = document.getElementById("preview")
    var placeholder = document.getElementById("placeholder-upload")

    
    preview.src = e.target.result
    preview.style.display = "block"
    placeholder.style.display = "none"
  }

  leitor.readAsDataURL(arquivo)
})

//envio do formulario
document.getElementById("form-vaquinha").addEventListener("submit", function (e) {
  e.preventDefault() //cancelar o comportamento padrao da pagina para nao recarregar

  //.value pega o valor digitado e trim remove espaços extras " oi  " -> "oi"
  var titulo      = document.getElementById("titulo").value.trim()
  var descricao   = document.getElementById("descricao").value.trim()
  var categoria   = document.getElementById("categoria").value
  var tipo        = document.getElementById("tipo").value
  var meta        = document.getElementById("meta").value.trim()
  var informacoes = document.getElementById("informacoes").value.trim()
  var imagemSrc   = document.getElementById("preview").src

  // Limpa os erros anteriores antes de validar de novo
  document.getElementById("erro-titulo").textContent    = ""
  document.getElementById("erro-descricao").textContent = ""
  document.getElementById("erro-categoria").textContent = ""
  document.getElementById("erro-tipo").textContent      = ""
  document.getElementById("erro-meta").textContent      = ""

  var temErro = false
  // verificando espaços vazios
  if (titulo === "") {
    document.getElementById("erro-titulo").textContent = "O título é obrigatório."
    temErro = true
  }

  if (descricao === "") {
    document.getElementById("erro-descricao").textContent = "A descrição é obrigatória."
    temErro = true
  }

  if (categoria === "") {
    document.getElementById("erro-categoria").textContent = "Selecione a categoria."
    temErro = true
  }

  if (tipo === "") {
    document.getElementById("erro-tipo").textContent = "Selecione o tipo de doação."
    temErro = true
  }

  if (meta === "") {
    document.getElementById("erro-meta").textContent = "A meta é obrigatória."
    temErro = true
  }

  // impedir salvamento se houver erro
  if (temErro) return

  // criação do objeto
  var metaNumero = Number(meta)
  if (isNaN(metaNumero)) {
    metaNumero = 0
  }

  var novaVaquinha = {
    titulo: titulo,
    descricao: descricao,
    categoria: categoria,
    tipoDoacao: tipo.toLowerCase(),
    meta: metaNumero,
    arrecadado: 0,
    informacoes: informacoes,
    imagem: imagemSrc,  //imagem em texto
    emergencial: false,
    dataCriacao: new Date().toISOString().split('T')[0],
    dataLimite: ""
  }

  salvarVaquinha(novaVaquinha) //envia o objeto para o json-server
})

// envia a vaquinha para o json-server
function salvarVaquinha(vaquinha) {
  fetch('http://localhost:3000/vaquinhas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vaquinha)
  })
  .then(function (response) {
    return response.json()
  })
  .then(function (data) {
    document.getElementById("form-vaquinha").classList.add("oculto")
    document.getElementById("mensagem-sucesso").classList.remove("oculto")
  })
  .catch(function (error) {
    console.log(error)
    alert("Erro ao salvar a vaquinha. Verifique se o servidor esta rodando.")
  })
}

//reseta tudo
function novaVaquinha() {
  
  document.getElementById("titulo").value      = ""
  document.getElementById("descricao").value   = ""
  document.getElementById("categoria").value   = ""
  document.getElementById("tipo").value        = ""
  document.getElementById("meta").value        = ""
  document.getElementById("informacoes").value = ""

  
  var preview = document.getElementById("preview")
  preview.src = ""
  preview.style.display = "none"
  document.getElementById("placeholder-upload").style.display = "flex"
  document.getElementById("imagem").value = ""

  document.getElementById("erro-titulo").textContent    = ""
  document.getElementById("erro-descricao").textContent = ""
  document.getElementById("erro-categoria").textContent = ""
  document.getElementById("erro-tipo").textContent      = ""
  document.getElementById("erro-meta").textContent      = ""


  document.getElementById("form-vaquinha").classList.remove("oculto")
  document.getElementById("mensagem-sucesso").classList.add("oculto")
}