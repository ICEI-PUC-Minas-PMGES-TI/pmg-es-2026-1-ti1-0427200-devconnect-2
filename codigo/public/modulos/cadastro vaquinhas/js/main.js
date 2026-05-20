// Dados da plataforma

const plataforma = {
    nome: "ConectaPlus",

    mensagemPrincipal: "Vaquinhas que precisam de você 💜",

    subtitulo:
        "Ajude histórias reais a se tornarem possíveis.",

    campanhas: [

        {
            titulo: "Tratamento da Ana",
            categoria: "Saúde",
            meta: 15000
        },

        {
            titulo: "Campanha do Agasalho",
            categoria: "Social",
            meta: 5000
        },

        {
            titulo: "Ajuda aos animais",
            categoria: "ONG",
            meta: 3000
        }

    ]
};


// Alterar textos automaticamente

document.querySelector(".navbar-brand").textContent =
plataforma.nome;

document.querySelector("h1").textContent =
plataforma.mensagemPrincipal;

document.querySelector(".lead").textContent =
plataforma.subtitulo;



// Criar cards das campanhas

const hero = document.querySelector(".container");

const novaLinha = document.createElement("div");

novaLinha.className = "row mt-5 g-4";

plataforma.campanhas.forEach(campanha => {

    novaLinha.innerHTML += `

    <div class="col-md-4">

        <div class="card shadow p-3 h-100">

            <h5>
                ${campanha.titulo}
            </h5>

            <p class="text-muted">

                ${campanha.categoria}

            </p>

            <strong>

                Meta:
                R$ ${campanha.meta}

            </strong>

        </div>

    </div>

    `;

});

hero.appendChild(novaLinha);



// Buscar campanha

const formulario =
document.querySelector("form");

const inputBusca =
document.querySelector("input");

formulario.addEventListener(
"submit",

function(event){

    event.preventDefault();

    const busca =
    inputBusca.value.toLowerCase();

    const resultado =
    plataforma.campanhas.filter(campanha =>

        campanha.titulo
        .toLowerCase()
        .includes(busca)

    );

    if(resultado.length > 0){

        alert(
            "Encontrado: " +
            resultado
            .map(c=>c.titulo)
            .join(", ")
        );

    }

    else{

        alert(
            "Nenhuma vaquinha encontrada"
        );

    }

});