document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://pmg-es-2026-1-ti1-0427200-devconnect-2-1.onrender.com/usuarios";
    const TOKEN_USUARIO = sessionStorage.getItem("usuarioToken");
    
    // Recuperar ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idProjeto = urlParams.get('id');
    
    const form = document.getElementById("formEditar");
    let usuarioLogado = null;
    let projetoParaEditar = null;

    if (!TOKEN_USUARIO || !idProjeto) {
        window.location.href = "../perfil/perfil.html";
        return;
    }

    // 1. CARREGAR DADOS ATUAIS
    try {
        const res = await fetch(`${API_URL}?token=${TOKEN_USUARIO}`);
        const dados = await res.json();
        usuarioLogado = dados[0];

        // Localiza o projeto em "criacoes" (seja vaquinha ou ong)
        projetoParaEditar = usuarioLogado.criacoes.find(c => String(c.id) === idProjeto);

        if (projetoParaEditar) {
            document.getElementById("editTitulo").value = projetoParaEditar.titulo;
            document.getElementById("editMeta").value = projetoParaEditar.meta;
            document.getElementById("editStatus").value = projetoParaEditar.status;
        }
    } catch (e) {
        console.error("Erro ao carregar projeto:", e);
    }

    // 2. SALVAR ALTERAÇÕES
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Atualiza o objeto no array local
        projetoParaEditar.titulo = document.getElementById("editTitulo").value;
        projetoParaEditar.meta = document.getElementById("editMeta").value;
        projetoParaEditar.status = document.getElementById("editStatus").value;

        try {
            const response = await fetch(`${API_URL}/${usuarioLogado.id}`, {
                method: "PATCH", // Atualiza apenas o que foi alterado
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ criacoes: usuarioLogado.criacoes })
            });

            if (response.ok) {
                alert("Projeto atualizado com sucesso!");
                window.location.href = "../perfil/index.html";
            } else {
                throw new Error("Falha ao salvar");
            }
        } catch (e) {
            alert("Erro ao salvar alterações no banco.");
        }
    });
});