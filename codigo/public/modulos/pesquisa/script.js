const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

let vaquinhas = [];

async function carregarVaquinhas() {
    try {
        const response = await fetch('vaquinhas.json');
        if (!response.ok) throw new Error();
        
        vaquinhas = await response.json();
        exibirVaquinhas(vaquinhas);
    } catch (error) {
        cardsContainer.innerHTML = '<p class="error-msg">Não foi possível carregar as vaquinhas.</p>';
    }
}

function exibirVaquinhas(listaDeVaquinhas) {
    cardsContainer.innerHTML = "";

    if (listaDeVaquinhas.length === 0) {
        cardsContainer.innerHTML = '<p class="no-results">Nenhuma vaquinha encontrada para essa busca.</p>';
        return;
    }

    listaDeVaquinhas.forEach(vaquinha => {
        const valorFormatado = vaquinha.valor_arrecadado.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const cardHtml = `
            <div class="card">
                <img src="${vaquinha.imagem}" alt="${vaquinha.titulo}">
                <div class="card-content">
                    <span class="tag">${vaquinha.tag}</span>
                    <h3>${vaquinha.titulo}</h3>
                    <p>${vaquinha.descricao}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${vaquinha.progresso_porcentagem}%;"></div>
                    </div>
                    <div class="card-footer">
                        <strong>${valorFormatado}</strong> arrecadados
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
        return vaquinha.titulo.toLowerCase().includes(termoBusca) ||
               vaquinha.descricao.toLowerCase().includes(termoBusca) ||
               vaquinha.tag.toLowerCase().includes(termoBusca);
    });

    exibirVaquinhas(vaquinhasFiltradas);
}

searchInput.addEventListener('input', filtrarVaquinhas);
searchButton.addEventListener('click', filtrarVaquinhas);

carregarVaquinhas();