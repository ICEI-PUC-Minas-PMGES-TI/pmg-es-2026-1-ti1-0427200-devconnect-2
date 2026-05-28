// pega o id da URL (ex: detalhes-ong.html?id=1)
var params = new URLSearchParams(window.location.search)
var id = params.get('id')

if (id == null) {
    document.getElementById('nomeOng').textContent = 'ONG nao encontrada.'
} else {
    fetch('http://localhost:3000/ongs/' + id)
    .then(function(response) {
        return response.json()
    })
    .then(function(ong) {
        document.getElementById('nomeOng').textContent = ong.nome
        document.getElementById('categoria').textContent = ong.categoria
        document.getElementById('descricao').textContent = ong.descricao
        document.getElementById('missao').textContent = ong.missao
        document.getElementById('email').textContent = ong.email
        document.getElementById('telefone').textContent = ong.telefone
        document.getElementById('endereco').textContent = ong.endereco

        if (ong.verificada) {
            document.getElementById('verificada').textContent = '✔ ONG Verificada'
            document.getElementById('verificada').style.color = 'green'
        }
    })
    .catch(function(error) {
        document.getElementById('nomeOng').textContent = 'Erro ao carregar ONG.'
        console.log(error)
    })
}
