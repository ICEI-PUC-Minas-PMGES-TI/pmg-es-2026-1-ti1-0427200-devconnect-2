var nome = "Usuário";
var ranking = "Bronze";


var doacoes = [];


var vaquinhas = [];

document.getElementById("username").textContent =
  "Olá, " + nome + "!";

document.getElementById("ranking").textContent =
  ranking;


function criarCard(titulo, imagem = "") {

  var imagemHTML = imagem
    ? '<img src="' + imagem + '" class="card-img">'
    : '<div class="card-img-placeholder"></div>';

  return `
    <div class="donation-card">
      ${imagemHTML}
      <div class="card-label">${titulo}</div>
    </div>
  `;
}



var doacoesContainer =
  document.getElementById("doacoes-container");

if (doacoes.length > 0) {

  for (var i = 0; i < doacoes.length; i++) {

    doacoesContainer.innerHTML +=
      criarCard(doacoes[i]);
  }

} else {

  doacoesContainer.innerHTML = `
    <div class="empty-box">
      <svg width="52" height="52"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#aaa"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round">

        <path d="M12 21s-7-4.35-9-8.28C1 9 3.5 5 7.5 5c2 0 3.5 1 4.5 2.3C13 6 14.5 5 16.5 5 20.5 5 23 9 21 12.72 19 16.65 12 21 12 21z"/>
      </svg>

      <span>Nenhuma doação realizada</span>
    </div>
  `;
}



if (vaquinhas.length > 0) {

  var vaqContainer =
    document.getElementById("vaquinhas-container");

  vaqContainer.innerHTML =
    '<div class="donations-grid">';

  for (var i = 0; i < vaquinhas.length; i++) {

    vaqContainer.innerHTML +=
      criarCard(vaquinhas[i]);
  }

  vaqContainer.innerHTML += '</div>';
}