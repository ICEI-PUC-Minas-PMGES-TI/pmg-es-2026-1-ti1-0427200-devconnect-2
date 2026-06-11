// pega o id da URL (ex: detalhes-ong.html?id=1)
var params = new URLSearchParams(window.location.search)
var id = params.get('id')

if (id == null) {
    document.getElementById('nomeOng').textContent = 'ONG nao encontrada.'
    document.getElementById('listaEmergencias').innerHTML = ''
} else {

    // busca os dados da ONG
    fetch('http://localhost:3000/ongs/' + id)
    .then(function(response) {
        return response.json()
    })
    .then(function(ong) {
        document.getElementById('nomeOng').textContent = ong.nome
        document.getElementById('descricao').textContent = ong.descricao
        document.getElementById('missao').textContent = ong.missao
        document.getElementById('email').textContent = ong.email
        document.getElementById('telefone').textContent = ong.telefone
        document.getElementById('endereco').textContent = ong.endereco
        document.getElementById('dataCadastro').textContent = ong.dataCadastro
        document.getElementById('categoria').textContent = ong.categoria

        if (ong.verificada) {
            document.getElementById('verificada').textContent = '✔ ONG Verificada'
        }
    })
    .catch(function(error) {
        document.getElementById('nomeOng').textContent = 'Erro ao carregar ONG.'
        console.log(error)
    })

    // busca as emergencias da ONG
    fetch('http://localhost:3000/emergencias?ongId=' + id)
    .then(function(response) {
        return response.json()
    })
    .then(function(emergencias) {
        var lista = document.getElementById('listaEmergencias')
        lista.innerHTML = ''

        if (emergencias.length == 0) {
            lista.innerHTML = '<p class="text-muted">Nenhuma emergencia cadastrada.</p>'
            return
        }

        for (var i = 0; i < emergencias.length; i++) {
            var e = emergencias[i]

            var porcentagem = Math.round((e.arrecadado / e.meta) * 100)
            if (porcentagem > 100) {
                porcentagem = 100
            }

            var card = document.createElement('div')
            card.className = 'card mb-3 shadow-sm'

            card.innerHTML =
                '<div class="card-body">' +
                '<div class="d-flex justify-content-between align-items-start mb-2">' +
                '<h6 class="card-title mb-0 titulo-card">' + e.titulo + '</h6>' +
                '<span class="badge-urgencia urgencia-' + e.urgencia + '">' + e.urgencia + '</span>' +
                '</div>' +
                '<p class="text-muted small mb-2">' + e.descricao + '</p>' +
                '<p class="mb-1 small"><strong>Categoria:</strong> ' + e.categoria + '</p>' +
                '<p class="mb-1 small"><strong>Tipo de doacao:</strong> ' + e.tipoDoacao + '</p>' +
                '<p class="mb-1 small"><strong>Data limite:</strong> ' + e.dataLimite + '</p>' +
                '<div class="mt-3">' +
                '<div class="d-flex justify-content-between mb-1">' +
                '<span class="small"><strong>Arrecadado:</strong> R$ ' + e.arrecadado.toLocaleString('pt-BR') + '</span>' +
                '<span class="small text-muted">Meta: R$ ' + e.meta.toLocaleString('pt-BR') + '</span>' +
                '</div>' +
                '<div class="progress" style="height: 10px;">' +
                '<div class="progress-bar barra-progresso" style="width: ' + porcentagem + '%"></div>' +
                '</div>' +
                '<span class="small text-muted">' + porcentagem + '% da meta atingida</span>' +
                '</div>' +
                '</div>'

            lista.appendChild(card)
        }
    })
    .catch(function(error) {
        console.log(error)
    })

}
