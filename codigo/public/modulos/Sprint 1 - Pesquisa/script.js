const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const API_URL = 'http://localhost:3000/vaquinhas';

let vaquinhas = [];

async function carregarVaquinhas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error();
        
        vaquinhas = await response.json();
        exibirVaquinhas(vaquinhas);
    } catch (error) {
        console.error("Erro ao buscar dados do json-server:", error);
        cardsContainer.innerHTML = '<p class="error-msg">Não foi possível carregar as vaquinhas do banco de dados.</p>';
    }
}

function exibirVaquinhas(listaDeVaquinhas) {
    cardsContainer.innerHTML = "";

    if (listaDeVaquinhas.length === 0) {
        cardsContainer.innerHTML = '<p class="no-results">Nenhuma vaquinha encontrada para essa busca.</p>';
        return;
    }

    listaDeVaquinhas.forEach(vaquinha => {
        const arrecadado = vaquinha.valor_arrecadado || 0;
        const meta = vaquinha.meta || 5000;
        const tag = vaquinha.tag || vaquinha.categoria || 'Geral';
        const imagem = vaquinha.imagem || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?w=500&auto=format&fit=crop&q=60'; // Imagem padrão para novos cadastros

        const porcentagem = vaquinha.progresso_porcentagem || Math.min(Math.round((arrecadado / meta) * 100), 100);

        const valorFormatado = arrecadado.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const metaFormatada = meta.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const cardHtml = `
            <div class="card">
                <img src="${imagem}" alt="${vaquinha.titulo}">
                <div class="card-content">
                    <span class="tag">${tag}</span>
                    <h3>${vaquinha.titulo}</h3>
                    <p>${vaquinha.descricao}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${porcentagem}%;"></div>
                    </div>
                    <div class="card-footer">
                        <div><strong>${valorFormatado}</strong> arrecadados</div>
                        <small style="color: #64748b; display: block; margin-top: 4px;">Meta: ${metaFormatada}</small>
                    </div>
                </div>
            </div>
        `;
        
        cardsContainer.innerHTML += cardHtml;
    });
}

function filtrarVaquinhas() {
    const termoBusca = searchInput.value.toLowerCase().trim();

    const vaquinhasFiltradas = vaquinhas.filter(vaquinha => {
        const titulo = vaquinha.titulo ? vaquinha.titulo.toLowerCase() : '';
        const descricao = vaquinha.descricao ? vaquinha.descricao.toLowerCase() : '';
        const tag = vaquinha.tag ? vaquinha.tag.toLowerCase() : '';
        const categoria = vaquinha.categoria ? vaquinha.categoria.toLowerCase() : '';

        return titulo.includes(termoBusca) ||
               descricao.includes(termoBusca) ||
               tag.includes(termoBusca) ||
               categoria.includes(termoBusca);
    });

    exibirVaquinhas(vaquinhasFiltradas);
}

searchInput.addEventListener('input', filtrarVaquinhas);
if (searchButton) {
    searchButton.addEventListener('click', filtrarVaquinhas);
}

carregarVaquinhas();