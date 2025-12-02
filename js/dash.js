// Usando as funções do comum.js se necessário, ou código específico
carregarDados().then(() => {
	inicializarFiltros();
	aplicarFiltros();
});


function aplicarFiltros() {
	aplicarFiltrosComuns();
	atualizarCards();
	atualizarGraficos();
}

function atualizarCards() {

	const totalE = d3.sum(dadosFiltrados, d => d.QTDE);
	const totalF = d3.sum(dadosFiltrados, d => d.QTDE_FORMADO);
	const total = totalE + totalF;

	const anoIni = +document.getElementById("anoInicialSelect").value;
	const anoFim = +document.getElementById("anoFinalSelect").value;

	document.getElementById("totalEvadidos").textContent = totalE;
	document.getElementById("evadidosPeriodo").textContent =
		anoIni === anoFim ? `No ano de ${anoIni}` : `Entre os anos de ${anoIni} e ${anoFim}`;

	document.getElementById("totalFormados").textContent = totalF;
	document.getElementById("formadosPeriodo").textContent =
		anoIni === anoFim ? `No ano de ${anoIni}` : `Entre os anos de ${anoIni} e ${anoFim}`;

	document.getElementById("taxaEvasao").textContent = total === 0 ? "0%" :
		((totalE / total) * 100).toFixed(1) + "%";
	document.getElementById("taxaEvasaoObs").textContent =
		`${totalE} evadidos de ${total} alunos.`;

	document.getElementById("taxaFormacao").textContent = total === 0 ? "0%" :
		((totalF / total) * 100).toFixed(1) + "%";
	document.getElementById("taxaFormacaoObs").textContent =
		`${totalF} formados de ${total} alunos.`;

	const rel = totalF > 0 ? (totalE / totalF).toFixed(2) : "0";
	document.getElementById("relacao").textContent = rel;
	document.getElementById("relacaoObs").textContent =
		`A cada 1 formado, aprox. ${Math.round(rel)} evadem.`;
}

// Variáveis globais para manter as instâncias dos gráficos
let graficoAnos = null;
let graficoTipos = null;

function inicializarGraficos() {
	const elementoAnos = document.getElementById('graficoAnos');
	const elementoTipos = document.getElementById('graficoTipos');

	if (!elementoAnos || !elementoTipos) return;

	// Verificar se os gráficos já existem, se não, criar
	if (!graficoAnos) {
		graficoAnos = echarts.init(elementoAnos);
	}
	if (!graficoTipos) {
		graficoTipos = echarts.init(elementoTipos);
	}
}

function atualizarGraficos() {
	// Garantir que os gráficos estão inicializados
	inicializarGraficos();

	if (!graficoAnos || !graficoTipos) return;

	// Dados para gráficos
	const porAno = d3.rollups(
		dadosFiltrados,
		v => d3.sum(v, d => d.QTDE),
		d => d.ANO_EVASAO
	).map(([ANO, QTDE]) => ({ ANO, QTDE }))
		.sort((a, b) => a.ANO - b.ANO);

	// Dados para o gráfico de pizza
	const porTipo = d3.rollups(
		dadosFiltrados,
		v => d3.sum(v, d => d.QTDE),
		d => d.FORMA_EVASAO_
	)
		.map(([tipo, total]) => ({
			name: tipo,
			value: total
		}))
		.filter(d => d.value > 0) // ← Filtra apenas valores maiores que 0
		.sort((a, b) => b.value - a.value);

	// Configuração do gráfico de anos com animação
	const optionAnos = {
		animation: true,
		animationDuration: 1000,
		animationEasing: 'cubicInOut',
		tooltip: {
			trigger: 'axis',
			className: 'custom-tooltip',
		},
		xAxis: {
			type: 'category',
			data: porAno.map(d => d.ANO),
			name: 'Ano',
			nameLocation: 'middle',
			nameGap: 25
		},
		yAxis: {
			type: 'value',
			name: 'Quantidade'
		},
		series: [{
			data: porAno.map(d => d.QTDE),
			type: 'line',
			lineStyle: { color: 'black', width: 2 },
			itemStyle: { color: 'black' },
			smooth: true,
			animation: true,
			animationDuration: 1000,
			animationEasing: 'cubicInOut'
		}],
		grid: {
			left: '60px', right: '20px', bottom: '10%', top: '40px'
		}
	};
	const optionTipos = {
		animation: true,
		animationDuration: 1000,
		animationEasing: 'elasticOut',
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			className: 'custom-tooltip',
		},
		grid: {
			left: '2%',
			right: '10%',
			bottom: '10%',
			top: '10%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			name: 'Quantidade',
			nameLocation: 'middle',
			nameGap: 30
		},
		yAxis: {
			type: 'category',
			data: porTipo.map(d => d.name),
			axisLabel: {
				interval: 0,
				rotate: 0
			},
			animation: true
		},
		series: [{
			name: 'Evadidos',
			type: 'bar',
			data: porTipo.map(d => d.value),
			itemStyle: {
				color: '#13293d',
				// color: function(params) {
				// 	const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
				// 	return colors[params.dataIndex % colors.length];
				// },
				borderRadius: [0, 5, 5, 0]
			},
			label: {
				show: true,
				position: 'right',
				formatter: '{c}'
			},
			animation: true,
			animationDuration: 1200,
			animationEasing: 'elasticOut',
			animationDelay: function(idx) {
				return idx * 100; // Animação em cascata
			}
		}]
	};

	// **CRUCIAL: Usar setOption com as opções corretas**
	try {
		graficoAnos.setOption(optionAnos, {
			notMerge: false,       // IMPORTANTE: permite transições
			lazyUpdate: false
		});

		graficoTipos.setOption(optionTipos, {
			notMerge: false,       // IMPORTANTE: permite transições  
			lazyUpdate: false,
		});
	} catch (error) {
		console.error('Erro ao atualizar gráficos:', error);
	}
}
