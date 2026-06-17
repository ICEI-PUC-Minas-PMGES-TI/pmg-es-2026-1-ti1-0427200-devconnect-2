const API_URL = 'http://localhost:3000/usuarios';

// Função para exibir o Toast centralizado com fundo escuro (Overlay) - Apenas para Erros
function mostrarToast(mensagem, tipo = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.innerHTML = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'toast-backdrop-modal';

    const toast = document.createElement('div');
    toast.className = `toast-modal toast-${tipo}`;
    
    const icone = tipo === 'success' ? '💚' : '⚠️';
    toast.innerHTML = `<span>${icone}</span> <span class="toast-text">${mensagem}</span>`;

    backdrop.appendChild(toast);
    container.appendChild(backdrop);

    setTimeout(() => {
        backdrop.classList.add('show');
    }, 10);

    setTimeout(() => {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 300);
    }, 2000); 
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

    if (!tabs.length || !btnSubmit) return;

    tabs.forEach(tab => tab.classList.remove('active'));
    sessionStorage.setItem('abaAtual', mode);

    if (mode === 'login') {
        if (tabs[1]) tabs[1].classList.add('active');
        if (groupName) groupName.style.display = 'none';
        if (groupCpf) groupCpf.style.display = 'none';
        if (groupConfirm) groupConfirm.style.display = 'none';
        if (groupTerms) groupTerms.style.display = 'none';
        
        if (inputName) inputName.required = false;
        if (inputCpf) inputCpf.required = false;
        if (inputConfirm) inputConfirm.required = false;
        if (inputTerms) inputTerms.required = false;

        if (forgotPassword) forgotPassword.style.display = 'block';

        formTitle.innerText = 'Bem-vindo de volta';
        formSubtitle.innerText = 'Que bom ver você por aqui de novo!';
        btnSubmit.innerText = 'Entrar na Conta';
        btnSubmit.style.backgroundColor = 'var(--verde-medio)';
        btnSubmit.style.boxShadow = '0 4px 12px rgba(45, 122, 69, 0.2)';
        btnSubmit.dataset.mode = 'login';
    } else {
        if (tabs[0]) tabs[0].classList.add('active');
        if (groupName) groupName.style.display = 'block';
        if (groupCpf) groupCpf.style.display = 'block';
        if (groupConfirm) groupConfirm.style.display = 'block';
        if (groupTerms) groupTerms.style.display = 'flex';
        
        if (inputName) inputName.required = true;
        if (inputCpf) inputCpf.required = true;
        if (inputConfirm) inputConfirm.required = true;
        if (inputTerms) inputTerms.required = true;

        if (forgotPassword) forgotPassword.style.display = 'none';

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

    const btnSubmit = document.getElementById('btn-submit');
    const mode = btnSubmit.dataset.mode || 'cadastro';
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    btnSubmit.disabled = true;
    const textoOriginalBotao = btnSubmit.innerText;
    btnSubmit.innerText = "Processando...";

    if (mode === 'cadastro') {
        const nome = document.getElementById('name').value;
        const cpf = document.getElementById('cpf').value;
        const confirmarSenha = document.getElementById('confirm-password').value;

        if (senha !== confirmarSenha) {
            mostrarToast('As senhas não coincidem!', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerText = textoOriginalBotao;
            return;
        }

        try {
            const verificarEmail = await fetch(`${API_URL}?email=${email}`);
            const emailExistente = await verificarEmail.json();

            const verificarCpf = await fetch(`${API_URL}?cpf=${cpf}`);
            const cpfExistente = await verificarCpf.json();

            if (emailExistente.length > 0) {
                mostrarToast('Este e-mail já está cadastrado!', 'error');
                btnSubmit.disabled = false;
                btnSubmit.innerText = textoOriginalBotao;
                return;
            }

            if (cpfExistente.length > 0) {
                mostrarToast('Este CPF já está cadastrado!', 'error');
                btnSubmit.disabled = false;
                btnSubmit.innerText = textoOriginalBotao;
                return;
            }

            const novoUsuario = { nome, cpf, email, senha, token: "", doacoes: [], criacoes: [] };

            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoUsuario)
            });

            if (resposta.ok) {
                sessionStorage.setItem('toastAgendadoMsg', 'Cadastro realizado com sucesso!');
                sessionStorage.setItem('toastAgendadoTipo', 'success');
                sessionStorage.setItem('abaAtual', 'login');

                document.getElementById('auth-form').reset();
                
                mostrarToast('Cadastro realizado com sucesso!', 'success');
                setTimeout(() => {
                    btnSubmit.disabled = false;
                    switchTab('login');
                }, 2000);
            } else {
                mostrarToast('Erro ao realizar cadastro.', 'error');
                btnSubmit.disabled = false;
                btnSubmit.innerText = textoOriginalBotao;
            }
        } catch (error) {
            mostrarToast('Não foi possível conectar ao servidor backend.', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerText = textoOriginalBotao;
        }
    } else {
        // --- FLUXO DE LOGIN ---
        try {
            const resposta = await fetch(`${API_URL}?email=${email}&senha=${senha}`);
            const usuariosEncontrados = await resposta.json();

            if (usuariosEncontrados.length > 0) {
                const usuarioLogado = usuariosEncontrados[0];
                const tokenGerado = crypto.randomUUID();

                const atualizacaoToken = await fetch(`${API_URL}/${usuarioLogado.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenGerado })
                });

                if (atualizacaoToken.ok) {
                    // Define as variáveis de sessão necessárias
                    sessionStorage.setItem('usuarioToken', tokenGerado);
                    sessionStorage.setItem('abaAtual', 'login');
                    
                    // Limpa os campos do formulário imediatamente
                    document.getElementById('email').value = '';
                    document.getElementById('password').value = '';
                    btnSubmit.disabled = false;

                    // Redireciona diretamente e sem delay para a home page
                    window.location.href = "../home-page/home_page.html"; 

                } else {
                    mostrarToast('Erro ao gerar sessão de segurança.', 'error');
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = textoOriginalBotao;
                }
            } else {
                mostrarToast('E-mail ou senha incorretos.', 'error');
                btnSubmit.disabled = false;
                btnSubmit.innerText = textoOriginalBotao;
            }
        } catch (error) {
            mostrarToast('Não foi possível conectar ao servidor backend.', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerText = textoOriginalBotao;
        }
    }
});

// Quando o DOM carregar, verifica status e executa agendamentos pendentes (ex: Sucesso do cadastro)
document.addEventListener('DOMContentLoaded', () => {
    const msgAgendada = sessionStorage.getItem('toastAgendadoMsg');
    const tipoAgendado = sessionStorage.getItem('toastAgendadoTipo') || 'success';
    const ultimaAba = sessionStorage.getItem('abaAtual') || 'cadastro';
    
    switchTab(ultimaAba);

    if (msgAgendada && window.location.href.includes('login')) {
        mostrarToast(msgAgendada, tipoAgendado);
        sessionStorage.removeItem('toastAgendadoMsg');
        sessionStorage.removeItem('toastAgendadoTipo');
    }
});