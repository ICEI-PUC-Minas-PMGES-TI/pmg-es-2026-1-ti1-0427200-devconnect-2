const API_URL = 'http://localhost:3000/usuarios';

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
    }, 2000); // 2 segundos cravados em tela
}

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
        
        btnSubmit.setAttribute('data-mode', 'login');
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
        
        btnSubmit.setAttribute('data-mode', 'cadastro');
        btnSubmit.dataset.mode = 'cadastro';
    }
}

document.getElementById('auth-form').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    event.stopPropagation();

    const btnSubmit = document.getElementById('btn-submit');
    const mode = btnSubmit.getAttribute('data-mode') || btnSubmit.dataset.mode || 'cadastro';
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (mode === 'cadastro') {
        const nome = document.getElementById('name').value;
        const cpf = document.getElementById('cpf').value;
        const confirmarSenha = document.getElementById('confirm-password').value;

        if (senha !== confirmarSenha) {
            mostrarToast('As senhas não coincidem!', 'error');
            return;
        }

        try {
            const verificarEmail = await fetch(`${API_URL}?email=${email}`);
            const emailExistente = await verificarEmail.json();

            const verificarCpf = await fetch(`${API_URL}?cpf=${cpf}`);
            const cpfExistente = await verificarCpf.json();

            if (emailExistente.length > 0) {
                mostrarToast('Este e-mail já está cadastrado!', 'error');
                return;
            }

            if (cpfExistente.length > 0) {
                mostrarToast('Este CPF já está cadastrado!', 'error');
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

            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoUsuario)
            });

            if (resposta.ok) {
                mostrarToast('Cadastro realizado com sucesso!', 'success');
                
                // Segura o formulário ativo até a animação acabar
                setTimeout(() => {
                    document.getElementById('auth-form').reset();
                    switchTab('login');
                }, 2200);
            } else {
                mostrarToast('Erro ao realizar cadastro no banco de dados.', 'error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            mostrarToast('Não foi possível conectar ao servidor backend.', 'error');
        }
    } else if (mode === 'login') {
        try {
            const resposta = await fetch(`${API_URL}?email=${email}&senha=${senha}`);
            
            // CORREÇÃO DA LINHA QUEBRADA: Sintaxe limpa sem atribuições duplas fantasmas
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
                    mostrarToast(`Login realizado com sucesso! Bem-vindo, ${usuarioLogado.nome}.`, 'success');
                    
                    // Como você pediu para continuar na tela atual sem redirecionamento,
                    // limpamos apenas os campos de input de forma segura após o Toast sumir
                    setTimeout(() => {
                        document.getElementById('email').value = '';
                        document.getElementById('password').value = '';
                    }, 2200);
                } else {
                    mostrarToast('Erro ao gerar sessão de segurança. Tente novamente.', 'error');
                }
            } else {
                mostrarToast('E-mail ou senha incorretos.', 'error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            mostrarToast('Não foi possível conectar ao servidor backend.', 'error');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    switchTab('cadastro');
});

document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        e.preventDefault();
    }
});