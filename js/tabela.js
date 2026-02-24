carregarDados().then(() => {
	inicializarFiltros();
	aplicarFiltros();
	configurarDownload();
});

function aplicarFiltros() {
    aplicarFiltrosComuns();
    atualizarTabela();
}

function atualizarTabela() {
    const tbody = document.getElementById("tableBody");
    const tableCount = document.getElementById("tableCount");

    // O total agora é simplesmente o número de registros filtrados
    tableCount.textContent = dadosFiltrados.length;

    if (dadosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">Nenhum dado encontrado</td></tr>';
        return;
    }

    // Mapeando as novas colunas
    const rows = dadosFiltrados.map(d => `
        <tr>
            <td>${d.NOMEE_CURSO}</td>
            <td>${d.MODALIDADE || 'N/A'}</td>
            <td>${d.ANO_INGRESSO}</td>
            <td>${d.ANO_EVASAO}</td>
            <td>${d.SEXO}</td>
            <td>${d.ETNIA}</td>
            <td>${d.COTISTA}</td>
            <td>${d.FORMA_EVASAO_limpo}</td>
            <td style="font-weight: bold;">${d.CRA.toFixed(2)}</td>
            <td>${d.RETENCAO_PERIODOS}</td>
            <td>${d.RETENCAO_MESES}</td>
        </tr>
    `).join('');

    tbody.innerHTML = rows;
}

function baixarCSV() {
    if (dadosFiltrados.length === 0) {
        alert('Não há dados para exportar!');
        return;
    }

    // Cabeçalhos atualizados para o novo dataset
    const headers = [
        'Curso',
        'Modalidade',
        'Ano Ingresso',
        'Ano Evasão',
        'Sexo',
        'Etnia',
        'Cota',
        'Forma Evasão',
        'CRA',
        'Retencao Semestres',
        'Retencao Meses',
    ];

    let csvContent = headers.join(',') + '\n';

    dadosFiltrados.forEach(d => {
        const row = [
            `"${d.NOMEE_CURSO}"`,
            `"${d.MODALIDADE || 'N/A'}"`,
            d.ANO_INGRESSO,
            d.ANO_EVASAO,
            `"${d.SEXO}"`,
            `"${d.ETNIA}"`,
            `"${d.COTISTA}"`,
            `"${d.FORMA_EVASAO_limpo}"`,
            d.CRA,
            d.RETENCAO_PERIODOS,
            d.RETENCAO_MESES
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const curso = document.querySelector('input[name="curso"]:checked')?.value || 'Todos';
    const filename = `relatorio_detalhado_${curso}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}