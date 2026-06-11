const API_URL_VAQUINHAS = 'http://localhost:3000/vaquinhas';
const API_URL_USUARIOS = 'http://localhost:3000/usuarios';

function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'toast-backdrop';

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const icone = tipo === 'success' ? '💚' : '⚠️';
    toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;

    backdrop.appendChild(toast);
    container.appendChild(backdrop);

    setTimeout(() => {
        backdrop.classList.add('show');
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        backdrop.classList.remove('show');
        toast.classList.remove('show');
        setTimeout(() => backdrop.remove(), 300);
    }, 4000);
}

function verificarAutenticacao(event, destinoSucesso) {
    event.preventDefault(); 
    
    const tokenAtivo = sessionStorage.getItem('usuarioToken');

    if (!tokenAtivo) {
        mostrarToast('Acesso restrito. Por favor, faça login para continuar.', 'error');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 1500);
        return;
    }

    fetch(`${API_URL_USUARIOS}?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(usuarios => {
            if (usuarios.length > 0) {
                window.location.href = destinoSucesso;
            } else {
                mostrarToast('Sessão expirada. Por favor, faça login novamente.', 'error');
                sessionStorage.clear();
                setTimeout(() => {
                    window.location.href = '../login/index.html';
                }, 1500);
            }
        })
        .catch(error => {
            console.error(error);
            mostrarToast('Erro de conexão com o servidor.', 'error');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnPerfil = document.querySelector('.nav-perfil');
    if (btnPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            verificarAutenticacao(e, '../perfil/perfil.html');
        });
    }

    const linksCriarVaquinha = document.querySelectorAll('a[href*="criar-vaquinha.html"]');
    linksCriarVaquinha.forEach(link => {
        link.addEventListener('click', (e) => {
            verificarAutenticacao(e, '../vaquinha/criar-vaquinha.html');
        });
    });
});

fetch(API_URL_VAQUINHAS)
.then(function(response) {
    return response.json();
})
.then(function(vaquinhas) {
    var lista = document.getElementById('lista-campanhas');
    lista.innerHTML = '';

    for (var i = 0; i < vaquinhas.length; i++) {
        var v = vaquinhas[i];

        var porcentagem = 0;
        var metaTexto = 'Meta nao definida';
        if (v.meta > 0) {
            porcentagem = Math.round((v.arrecadado / v.meta) * 100);
            if (porcentagem > 100) {
                porcentagem = 100;
            }
            metaTexto = 'Meta: R$ ' + v.meta.toLocaleString('pt-BR');
        }

        var saibaMais = '<a href="../vaquinha/detalhes-vaquinha.html?id=' + v.id + '" class="card-saiba">Saiba mais →</a>';

        var dataTexto = '';
        if (v.dataLimite) {
            dataTexto = 'Ate ' + v.dataLimite;
        }

        var card = document.createElement('div');
        card.className = 'card';

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
            '</div>';

        lista.appendChild(card);
    }
})
.catch(function(error) {
    console.log(error);
});