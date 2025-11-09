// Controle do dropdown de filtros
document.addEventListener('DOMContentLoaded', function() {
const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownContent = document.querySelector('.dropdown-content');

// Abrir/fechar dropdown
dropdownBtn.addEventListener('click', function(e) {
e.stopPropagation();
dropdownContent.classList.toggle('show');
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', function() {
dropdownContent.classList.remove('show');
});

// Prevenir fechamento ao clicar dentro do dropdown
dropdownContent.addEventListener('click', function(e) {
e.stopPropagation();
});
});