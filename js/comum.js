// Funções que são usadas em múltiplas páginas
let dados = [];
let dadosFiltrados = [];

function carregarDados() {
    // Mudamos para o novo nome de arquivo, se necessário
    return d3.csv("data/dados.csv").then(df => {
        df.forEach(d => {
            // Conversões numéricas
            d.ANO_EVASAO = +d.ANO_EVASAO;
            d.ANO_INGRESSO = +d.ANO_INGRESSO;
            d.CRA = +d.CRA;
            d.CRN = +d.CRN;
            d.RETENCAO_PERIODOS = +d.RETENCAO_PERIODOS;

            // Padronização para manter compatibilidade com seus filtros antigos:
            d.SEXO = d.SEXO === "F" ? "Feminino" : "Masculino";
            d.COTISTA = d.COTISTA === "S" ? "Cotista" : "Não Cotista";
            
            // Note que não temos mais d.QTDE, pois cada linha agora é 1 pessoa
        });
        dados = df;
        return dados;
    });
}

function preencherRadio(id, values, selectedValue = "Todos") {
	const container = document.getElementById(id);
	container.innerHTML = "";
	values.forEach(v => {
		container.innerHTML += `
			<label class="radio-container">
				<input type="radio" name="curso" value="${v}" ${v === selectedValue ? "checked" : ""}>
				<span class="radio-checkmark"></span>
				${v}
			</label>
		`;
	});
}

function preencherSelect(id, values, selectedIndex = 0) {
	const sel = document.getElementById(id);
	sel.innerHTML = "";
	values.forEach((v, i) => {
		sel.innerHTML += `<option ${i === selectedIndex ? "selected" : ""}>${v}</option>`;
	});
}

function preencherCheckboxes(id, values) {
	const box = document.getElementById(id);
	box.innerHTML = "";
	[...values].forEach(v => {
		box.innerHTML += `
      <label>
        <input type="checkbox" value="${v}"> ${v}
      </label><br>
    `;
	});
}

function inicializarFiltros() {
    // Ajustado para os novos nomes de coluna: NOME_CURSO no lugar de CURSO
    preencherRadio("cursoRadio", ["Todos", ...new Set(dados.map(d => d.NOMEE_CURSO))], "Todos");
    
    // Se você não tiver mais a coluna MODALIDADE no CSV novo, 
    // precisará remover ou adaptar este filtro abaixo:
    preencherSelect("modalidadeSelect", ["Todos", ...new Set(dados.map(d => d.MODALIDADE))]);

    const anos = [...new Set(dados.map(d => d.ANO_EVASAO))].sort((a, b) => a - b);

    preencherSelect("anoInicialSelect", anos);
    preencherSelect("anoFinalSelect", anos, anos.length - 1);

    preencherCheckboxes("sexoBox", new Set(dados.map(d => d.SEXO)));
    preencherCheckboxes("cotaBox", new Set(dados.map(d => d.COTISTA)));
    preencherCheckboxes("etniaBox", new Set(dados.map(d => d.ETNIA)));

	document.querySelectorAll("select, input").forEach(el => {
		el.addEventListener("change", aplicarFiltros);
	});

	document.querySelector(".dropdown-btn").addEventListener("click", (e) => {
		e.stopPropagation(); // Impede que o clique se propague para o documento
		document.querySelector(".dropdown-content").classList.toggle("show");
	});

	// Fecha o dropdown quando clicar em qualquer lugar fora dele
	document.addEventListener("click", (e) => {
		const dropdownContent = document.querySelector(".dropdown-content");
		const dropdownBtn = document.querySelector(".dropdown-btn");

		// Verifica se o clique foi fora do dropdown e do botão
		if (!dropdownContent.contains(e.target) && !dropdownBtn.contains(e.target)) {
			dropdownContent.classList.remove("show");
		}
	});
}

function aplicarFiltrosComuns() {
    const curso = document.querySelector('input[name="curso"]:checked').value;
    const modalidade = document.getElementById("modalidadeSelect").value;
    const anoIni = +document.getElementById("anoInicialSelect").value;
    const anoFim = +document.getElementById("anoFinalSelect").value;

    const sexos = [...document.querySelectorAll("#sexoBox input:checked")].map(d => d.value);
    const etnias = [...document.querySelectorAll("#etniaBox input:checked")].map(d => d.value);
    const cotas = [...document.querySelectorAll("#cotaBox input:checked")].map(d => d.value);

    dadosFiltrados = dados
        .filter(d => curso === "Todos" || d.NOMEE_CURSO === curso)
        .filter(d => modalidade === "Todos" || d.MODALIDADE === modalidade) 
        .filter(d => d.ANO_EVASAO >= anoIni && d.ANO_EVASAO <= anoFim)
        .filter(d => sexos.length === 0 || sexos.includes(d.SEXO))
        .filter(d => etnias.length === 0 || etnias.includes(d.ETNIA))
        .filter(d => cotas.length === 0 || cotas.includes(d.COTISTA));

    return dadosFiltrados;
}