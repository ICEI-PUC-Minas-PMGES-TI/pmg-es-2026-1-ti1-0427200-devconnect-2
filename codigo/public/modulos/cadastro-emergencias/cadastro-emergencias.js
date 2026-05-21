// pega o formulario
var form = document.getElementById('formEmergencia')

form.addEventListener('submit', function(event) {
    event.preventDefault()

    // pega os valores dos campos
    var titulo = document.getElementById('titulo').value
    var descricao = document.getElementById('descricao').value
    var categoria = document.getElementById('categoria').value
    var tipoDoacao = document.getElementById('tipoDoacao').value
    var meta = document.getElementById('meta').value
    var urgencia = document.getElementById('urgencia').value
    var dataLimite = document.getElementById('dataLimite').value

    // verifica se os campos estao preenchidos
    if (titulo == '' || descricao == '' || categoria == '' || meta == '') {
        alert('Preencha todos os campos obrigatorios!')
        return
    }

    // monta o objeto
    var emergencia = {
        titulo: titulo,
        descricao: descricao,
        categoria: categoria,
        tipoDoacao: tipoDoacao,
        meta: Number(meta),
        arrecadado: 0,
        urgencia: urgencia,
        dataLimite: dataLimite,
        dataCriacao: new Date().toISOString().split('T')[0]
    }

    // envia pro json-server
    fetch('http://localhost:3000/emergencias', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emergencia)
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        alert('Emergencia cadastrada com sucesso!')
        form.reset()
    })
    .catch(function(error) {
        alert('Erro ao cadastrar. Verifique se o servidor esta rodando.')
        console.log(error)
    })
})
