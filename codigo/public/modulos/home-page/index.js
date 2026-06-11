// busca as vaquinhas cadastradas e mostra na home
fetch('http://localhost:3000/vaquinhas')
.then(function(response) {
    return response.json()
})
.then(function(vaquinhas) {
    var lista = document.getElementById('lista-campanhas')
    lista.innerHTML = ''

    for (var i = 0; i < vaquinhas.length; i++) {
        var v = vaquinhas[i]

        // calcula a porcentagem so se a meta for um numero valido
        var porcentagem = 0
        var metaTexto = 'Meta nao definida'
        if (v.meta > 0) {
            porcentagem = Math.round((v.arrecadado / v.meta) * 100)
            if (porcentagem > 100) {
                porcentagem = 100
            }
            metaTexto = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR')
        }

        // "Saiba mais" leva para a pagina com todas as informacoes da vaquinha
        var saibaMais = '<a href="../vaquinha/detalhes-vaquinha.html?id=' + v.id + '" class="card-saiba">Saiba mais →</a>'

        // so mostra a data limite se ela existir
        var dataTexto = ''
        if (v.dataLimite) {
            dataTexto = 'Ate ' + v.dataLimite
        }

        var card = document.createElement('div')
        card.className = 'card'

        card.innerHTML =
            '<div class="card-imagem-placeholder">🤝</div>' +
            '<div class="card-corpo">' +
            '<div class="card-topo">' +
            '<span class="card-categoria">' + v.categoria + '</span>' +
            '<span class="card-data">' + dataTexto + '</span>' +
            '</div>' +
            '<h3 class="card-titulo">' + v.titulo + '</h3>' +
            '<p class="card-descricao">' + v.descricao + '</p>' +
            '<div class="card-meta-wrapper">' +
            '<div class="card-meta-label">' +
            '<span>Arrecadado</span>' +
            '<strong>R$ ' + v.arrecadado.toLocaleString('pt-BR') + '</strong>' +
            '</div>' +
            '<div class="card-barra-fundo">' +
            '<div class="card-barra-fill" style="width: ' + porcentagem + '%"></div>' +
            '</div>' +
            '<div class="card-rodape">' +
            saibaMais +
            '<span class="card-meta-texto">' + metaTexto + '</span>' +
            '</div>' +
            '</div>' +
            '</div>'

        lista.appendChild(card)
    }
})
.catch(function(error) {
    console.log(error)
})
