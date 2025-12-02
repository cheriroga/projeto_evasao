carregarDados().then(() => {
	inicializarFiltros();
	aplicarFiltros();
	configurarDownload();
});

function inicializarFiltros() {
	preencherRadio("cursoRadio", ["Todos", ...new Set(dados.map(d => d.CURSO))], "Todos");
	// preencherSelect("cursoSelect", ["Todos", ...new Set(dados.map(d => d.CURSO))]);
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

function aplicarFiltros() {
	aplicarFiltrosComuns();
	atualizarTabela();
}

function atualizarTabela() {
	const tbody = document.getElementById("tableBody");
	const tableCount = document.getElementById("tableCount");

	tableCount.textContent = dadosFiltrados.length;

	if (dadosFiltrados.length === 0) {
		tbody.innerHTML = '<tr><td colspan="9">Nenhum dado encontrado</td></tr>';
		return;
	}

	const rows = dadosFiltrados.map(d => `
        <tr>
            <td>${d.CURSO}</td>
            <td>${d.MODALIDADE}</td>
            <td>${d.ANO_EVASAO}</td>
            <td>${d.SEXO}</td>
            <td>${d.ETNIA}</td>
            <td>${d.COTISTA}</td>
            <td>${d.FORMA_EVASAO}</td>
            <td>${d.QTDE}</td>
            <td>${d.QTDE_FORMADO}</td>
        </tr>
    `).join('');

	tbody.innerHTML = rows;
}

function configurarDownload() {
	const downloadBtn = document.getElementById('downloadBtn');

	if (downloadBtn) {
		downloadBtn.addEventListener('click', baixarCSV);
	}
}

function baixarCSV() {
	if (dadosFiltrados.length === 0) {
		alert('Não há dados para exportar!');
		return;
	}

	// Definir cabeçalhos
	const headers = [
		'Curso',
		'Modalidade',
		'Ano Evasão',
		'Sexo',
		'Etnia',
		'Cota',
		'Forma Evasão',
		'Qtde Evadidos',
		'Qtde Formados'
	];

	// Criar conteúdo CSV
	let csvContent = headers.join(',') + '\n';

	dadosFiltrados.forEach(d => {
		const row = [
			`"${d.CURSO}"`,
			`"${d.MODALIDADE}"`,
			d.ANO_EVASAO,
			`"${d.SEXO}"`,
			`"${d.ETNIA}"`,
			`"${d.COTISTA}"`,
			`"${d.FORMA_EVASAO}"`,
			d.QTDE,
			d.QTDE_FORMADO
		];
		csvContent += row.join(',') + '\n';
	});

	// Criar blob e link de download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	// Gerar nome do arquivo com data e filtros
	const curso = document.querySelector('input[name="curso"]:checked')?.value || 'Todos';
	const data = new Date().toISOString().split('T')[0];
	const filename = `evasao_${curso}_${data}.csv`;

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
