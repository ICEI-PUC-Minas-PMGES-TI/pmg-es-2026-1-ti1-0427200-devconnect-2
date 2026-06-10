document.addEventListener('DOMContentLoaded', () => {
    const formVaquinha = document.querySelector('.content-vaquinha form');
    const formOng = document.querySelector('.content-ong form');

    const API_URL = 'http://localhost:3000'; 

    if (!formVaquinha || !formOng) {
        console.error("Erro crítico: Os formulários não foram encontrados. Verifique as classes no HTML.");
        return;
    }

    formVaquinha.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dadosVaquinha = {
            nomeResponsavel: document.getElementById('nome-criador').value.trim(),
            email: document.getElementById('email-vaquinha').value.trim(),
            titulo: document.getElementById('titulo-vaquinha').value.trim(),
            meta: parseFloat(document.getElementById('meta-valor').value),
            categoria: document.getElementById('categoria-vaquinha').value,
            descricao: document.getElementById('descricao-vaquinha').value.trim(),
            dataCriacao: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_URL}/vaquinhas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosVaquinha)
            });
            
            if (response.ok) {
                alert('🎉 Vaquinha lançada com sucesso!');
                formVaquinha.reset(); 
            } else {
                console.error("Resposta do servidor não foi OK:", response.status, response.statusText);
                alert(`Erro do servidor (${response.status}): Não foi possível salvar a vaquinha.`);
            }
        } catch (error) {
            console.error('Erro de conexão/rede:', error);
            alert('Não foi possível conectar ao banco de dados. O json-server está ligado de verdade no terminal?');
        }
    });

    formOng.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const dadosOng = {
            nomeOrganizacao: document.getElementById('nome-ong').value.trim(),
            cnpj: document.getElementById('cnpj-ong').value.trim(),
            telefone: document.getElementById('telefone-ong').value.trim(),
            email: document.getElementById('email-ong').value.trim(),
            site: document.getElementById('site-ong').value.trim() || null,
            causaAtuacao: document.getElementById('causa-ong').value,
            dataCadastro: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_URL}/ongs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosOng)
            });
            
            if (response.ok) {
                alert('🏢 ONG cadastrada com sucesso!');
                formOng.reset();
            } else {
                console.error("Resposta do servidor não foi OK:", response.status, response.statusText);
                alert(`Erro do servidor (${response.status}): Não foi possível salvar a ONG.`);
            }
        } catch (error) {
            console.error('Erro de conexão/rede:', error);
            alert('Não foi possível conectar ao banco de dados. O json-server está ligado de verdade no terminal?');
        }
    });
});