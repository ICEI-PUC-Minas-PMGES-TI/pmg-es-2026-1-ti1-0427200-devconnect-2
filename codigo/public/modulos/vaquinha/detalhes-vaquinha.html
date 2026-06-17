var params = new URLSearchParams(window.location.search)
var id = params.get('id')

if (id == null) {
    document.getElementById('titulo').textContent = 'Vaquinha nao encontrada.'
} else {
    fetch('http://localhost:3000/vaquinhas/' + id)
    .then(function(response) {
        return response.json()
    })
    .then(function(v) {

        document.getElementById('categoria').textContent = v.categoria
        document.getElementById('titulo').textContent = v.titulo
        document.getElementById('descricao').textContent = v.descricao
        document.getElementById('tipoDoacao').textContent = v.tipoDoacao
        document.getElementById('dataCriacao').textContent = v.dataCriacao
        document.getElementById('arrecadado').textContent = 'R$ ' + v.arrecadado.toLocaleString('pt-BR')

        // ================= ATUALIZAÇÃO DO LINK DE DOAÇÃO =================
        // Atualiza o href enviando o ID e o tipo para o script de pagamento reconhecer
        document.getElementById('btnDoar').href = '../pagamento/index.html?tipo=vaquinhas&id=' + id
        // =================================================================

        var porcentagem = 0
        if (v.meta > 0) {
            porcentagem = Math.round((v.arrecadado / v.meta) * 100)
            if (porcentagem > 100) {
                porcentagem = 100
            }
            document.getElementById('metaTexto').textContent = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR')
        } else {
            document.getElementById('metaTexto').textContent = 'Meta nao definida'
        }

        document.getElementById('barraProgresso').style.width = porcentagem + '%'
        document.getElementById('porcentagem').textContent = porcentagem + '% da meta atingida'

        // so mostra a data limite se ela existir
        if (v.dataLimite) {
            document.getElementById('dataLimite').textContent = v.dataLimite
            document.getElementById('dataLimiteTopo').textContent = 'Ate ' + v.dataLimite
        } else {
            document.getElementById('linhaDataLimite').classList.add('oculto')
        }

        // so mostra o aviso de emergencial se for true
        if (v.emergencial != true) {
            document.getElementById('linhaEmergencial').classList.add('oculto')
        }

        // so mostra a imagem se for um arquivo enviado (base64)
        if (v.imagem && v.imagem.indexOf('data:image') == 0) {
            var img = document.createElement('img')
            img.src = v.imagem
            document.getElementById('imagemVaquinha').innerHTML = ''
            document.getElementById('imagemVaquinha').appendChild(img)
        }

        // so mostra informacoes adicionais se existirem
        if (v.informacoes) {
            document.getElementById('informacoes').textContent = v.informacoes
        } else {
            document.getElementById('blocoInformacoes').classList.add('oculto')
        }

        // so mostra o link da ong se a vaquinha tiver uma vinculada
        if (v.ongId) {
            document.getElementById('linkOng').href = '../detalhes-ong/detalhes-ong.html?id=' + v.ongId
        } else {
            document.getElementById('linkOng').classList.add('oculto')
        }
    })
    .catch(function(error) {
        document.getElementById('titulo').textContent = 'Erro ao carregar a vaquinha.'
        console.log(error)
    })
}