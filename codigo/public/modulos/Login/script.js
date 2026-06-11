const API_URL = 'http://localhost:3000/usuarios';

function switchTab(mode) {
    const tabs = document.querySelectorAll('.tab-btn');
    const groupName = document.getElementById('group-name');
    const groupCpf = document.getElementById('group-cpf');
    const groupConfirm = document.getElementById('group-confirm');
    const groupTerms = document.getElementById('group-terms');
    const forgotPassword = document.getElementById('forgot-password');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const btnSubmit = document.getElementById('btn-submit');
    
    const inputName = document.getElementById('name');
    const inputCpf = document.getElementById('cpf');
    const inputConfirm = document.getElementById('confirm-password');
    const inputTerms = document.getElementById('terms');

    tabs.forEach(tab => tab.classList.remove('active'));

    if (mode === 'login') {
        tabs[1].classList.add('active');
        
        groupName.style.display = 'none';
        groupCpf.style.display = 'none';
        groupConfirm.style.display = 'none';
        groupTerms.style.display = 'none';
        
        inputName.required = false;
        inputCpf.required = false;
        inputConfirm.required = false;
        inputTerms.required = false;

        forgotPassword.style.display = 'block';

        formTitle.innerText = 'Bem-vindo de volta';
        formSubtitle.innerText = 'Que bom ver você por aqui de novo!';
        btnSubmit.innerText = 'Entrar na Conta';
        
        btnSubmit.style.backgroundColor = 'var(--verde-medio)';
        btnSubmit.style.boxShadow = '0 4px 12px rgba(45, 122, 69, 0.2)';
        btnSubmit.dataset.mode = 'login';
    } else {
        tabs[0].classList.add('active');
        
        groupName.style.display = 'block';
        groupCpf.style.display = 'block';
        groupConfirm.style.display = 'block';
        groupTerms.style.display = 'flex';
        
        inputName.required = true;
        inputCpf.required = true;
        inputConfirm.required = true;
        inputTerms.required = true;

        forgotPassword.style.display = 'none';

        formTitle.innerText = 'Criar Conta';
        formSubtitle.innerText = 'Faça parte dessa corrente de solidariedade.';
        btnSubmit.innerText = 'Cadastrar e Ajudar';
        
        btnSubmit.style.backgroundColor = 'var(--ambar)';
        btnSubmit.style.boxShadow = '0 4px 12px rgba(245, 166, 35, 0.2)';
        btnSubmit.dataset.mode = 'cadastro';
    }
}

document.getElementById('auth-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const mode = document.getElementById('btn-submit').dataset.mode || 'cadastro';
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (mode === 'cadastro') {
        const nome = document.getElementById('name').value;
        const cpf = document.getElementById('cpf').value;
        const confirmarSenha = document.getElementById('confirm-password').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        const novoUsuario = {
            nome: nome,
            cpf: cpf,
            email: email,
            senha: senha,
            token: "",
            doacoes: [],
            criacoes: []
        };

        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoUsuario)
            });

            if (resposta.ok) {
                alert('Cadastro realizado com sucesso!');
                document.getElementById('auth-form').reset();
                switchTab('login');
            } else {
                alert('Erro ao realizar cadastro.');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Não foi possível conectar ao servidor backend (json-server).');
        }
    } else {
        try {
            const resposta = await fetch(`${API_URL}?email=${email}&senha=${senha}`);
            const usuariosEncontrados = await resposta.json();

            if (usuariosEncontrados.length > 0) {
                const usuarioLogado = usuariosEncontrados[0];
                
                const tokenGerado = crypto.randomUUID();

                const atualizacaoToken = await fetch(`${API_URL}/${usuarioLogado.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: tokenGerado })
                });

                if (atualizacaoToken.ok) {
                    sessionStorage.setItem('usuarioToken', tokenGerado);
                    alert(`Login realizado com sucesso! Bem-vindo, ${usuarioLogado.nome}.`);
                } else {
                    alert('Erro ao gerar sessão de segurança. Tente novamente.');
                }
            } else {
                alert('E-mail ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Não foi possível conectar ao servidor backend (json-server).');
        }
    }
});