
document.getElementById("imagem").addEventListener("change", function () {
  var arquivo = this.files[0]

  if (!arquivo) return

  var leitor = new FileReader()

  leitor.onload = function (e) {
    var preview = document.getElementById("preview")
    var placeholder = document.getElementById("placeholder-upload")

    
    preview.src = e.target.result
    preview.style.display = "block"
    placeholder.style.display = "none"
  }

  leitor.readAsDataURL(arquivo)
})


document.getElementById("form-vaquinha").addEventListener("submit", function (e) {
  e.preventDefault() 

  
  var titulo      = document.getElementById("titulo").value.trim()
  var descricao   = document.getElementById("descricao").value.trim()
  var tipo        = document.getElementById("tipo").value
  var meta        = document.getElementById("meta").value.trim()
  var informacoes = document.getElementById("informacoes").value.trim()
  var imagemSrc   = document.getElementById("preview").src

  
  document.getElementById("erro-titulo").textContent    = ""
  document.getElementById("erro-descricao").textContent = ""
  document.getElementById("erro-tipo").textContent      = ""
  document.getElementById("erro-meta").textContent      = ""

  var temErro = false

  if (titulo === "") {
    document.getElementById("erro-titulo").textContent = "O título é obrigatório."
    temErro = true
  }

  if (descricao === "") {
    document.getElementById("erro-descricao").textContent = "A descrição é obrigatória."
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

  
  if (temErro) return

  
  var novaVaquinha = {
    id: Date.now(), 
    titulo: titulo,
    descricao: descricao,
    tipo: tipo,
    meta: meta,
    informacoes: informacoes,
    imagem: imagemSrc,
    dataCriacao: new Date().toLocaleDateString("pt-BR")
  }

  salvarVaquinha(novaVaquinha)

  
  document.getElementById("form-vaquinha").classList.add("oculto")
  document.getElementById("mensagem-sucesso").classList.remove("oculto")
})


function salvarVaquinha(vaquinha) {
  
  var lista = JSON.parse(localStorage.getItem("vaquinhas") || "[]")

 
  lista.push(vaquinha)

  
  localStorage.setItem("vaquinhas", JSON.stringify(lista))
}


function novaVaquinha() {
  
  document.getElementById("titulo").value      = ""
  document.getElementById("descricao").value   = ""
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
  document.getElementById("erro-tipo").textContent      = ""
  document.getElementById("erro-meta").textContent      = ""

  
  document.getElementById("form-vaquinha").classList.remove("oculto")
  document.getElementById("mensagem-sucesso").classList.add("oculto")
}