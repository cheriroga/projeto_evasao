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
    // Agora contamos as linhas em vez de somar uma coluna QTDE
    // Consideramos "Evadido" quem tem uma FORMA_EVASAO preenchida e diferente de algo que indique conclusão
    // Ajuste o filtro abaixo conforme os nomes exatos no seu CSV (ex: "Formatura", "Conclusão")
    const evadidos = dadosFiltrados.filter(d => d.FORMA_EVASAO_limpo !== "Formado" && d.FORMA_EVASAO_limpo !== "Sem Evasão");
    const formados = dadosFiltrados.filter(d => d.FORMA_EVASAO_limpo === "Formado");
    
    const totalE = evadidos.length;
    const totalF = formados.length;
    const total = dadosFiltrados.length; // Total de registros no período selecionado

    const anoIni = +document.getElementById("anoInicialSelect").value;
    const anoFim = +document.getElementById("anoFinalSelect").value;

    document.getElementById("totalEvadidos").textContent = totalE;
    document.getElementById("evadidosPeriodo").textContent =
        anoIni === anoFim ? `No ano de ${anoIni}` : `Entre os anos de ${anoIni} e ${anoFim}`;
    document.getElementById("totalFormados").textContent = totalF;
    document.getElementById("formadosPeriodo").textContent =
      anoIni === anoFim ? `No ano de ${anoIni}` : `Entre os anos de ${anoIni} e ${anoFim}`;

    // Cálculo das taxas
    document.getElementById("taxaEvasao").textContent = total === 0 ? "0%" :
        ((totalE / total) * 100).toFixed(1) + "%";
    document.getElementById("taxaEvasaoObs").textContent =
        `${totalE} evadidos de ${total} alunos registrados.`;

    document.getElementById("taxaFormacao").textContent = total === 0 ? "0%" :
        ((totalF / total) * 100).toFixed(1) + "%";
    document.getElementById("taxaFormacaoObs").textContent =
        `${totalF} formados de ${total} alunos registrados.`;

	const rel = totalF > 0 ? (totalE / totalF).toFixed(2) : "0";
	document.getElementById("relacao").textContent = rel;
	document.getElementById("relacaoObs").textContent =
		`A cada 1 formado, aprox. ${Math.round(rel)} evadem.`;
}

// Variáveis globais para manter as instâncias dos gráficos
let graficoAnos = null;
let graficoTipos = null;
let graficoSexo = null;


function inicializarGraficos() {
	const elementoAnos = document.getElementById('graficoAnos');
	const elementoTipos = document.getElementById('graficoTipos');
	const elementoSexo = document.getElementById('graficoSexo');


	if (!elementoAnos || !elementoTipos || !elementoSexo) return;

	// Verificar se os gráficos já existem, se não, criar
	if (!graficoAnos) {
		graficoAnos = echarts.init(elementoAnos);
	}
	if (!graficoTipos) {
		graficoTipos = echarts.init(elementoTipos);
	}	
    if (!graficoSexo) {
		graficoSexo = echarts.init(elementoSexo);
	}
    
}

function atualizarGraficos() {
    const colorscheme = ['#054A91', '#3E7CB1', '#81A4CD', '#DBE4EE'];

    inicializarGraficos();
    if (!graficoAnos || !graficoTipos || !graficoSexo) return;



// --- GRÁFICO DE ANOS COM DUAS LINHAS  ---
const dadosPorAno = new Map();

dadosFiltrados.forEach(d => {
    const ano = d.ANO_EVASAO;

    if (!dadosPorAno.has(ano)) {
        dadosPorAno.set(ano, { formados: 0, evadidos: 0 });
    }
    const registro = dadosPorAno.get(ano);
    
    if (d.FORMA_EVASAO_limpo === "Formado") {
        registro.formados++;
    } else if (d.FORMA_EVASAO_limpo !== "Sem Evasão") {
        // Só incrementa evadidos se não for "Sem evasão"
        registro.evadidos++;
    }
    // "Sem evasão" é ignorado completamente
});

// Converter para arrays ordenados
const anos = Array.from(dadosPorAno.keys()).sort((a, b) => a - b);
const formados = anos.map(ano => dadosPorAno.get(ano).formados);
const evadidos = anos.map(ano => dadosPorAno.get(ano).evadidos);

// Configuração do gráfico
const optionAnos = {
    animation: true,
    animationDuration: 1000,
    title: {
        text: 'Evasão por Ano',
        left: 'left',
    },
    toolbox: {
        feature: {
        saveAsImage: {},
        // dataZoom: {},
        }
    },
    tooltip: {
        trigger: 'axis',
		axisPointer: { type: 'shadow' },
		className: 'custom-tooltip',
        confine: true,
        // Opcional: esconder se tiver muitos dados
        hideDelay: 100
    },
    legend: {
        data: ['Formados', 'Evadidos'], 
        left: 'center', 
        top: 0,
        selected: {
        'Formados': false,  // Inicia desmarcado na legenda
        'Evadidos': true
    }
        },
    xAxis: {
        type: 'category',
        data: anos,
        name: 'Ano',
        nameLocation: 'middle',
        nameGap: 25,
        },
         
    yAxis: {
        type: 'value',
        name: 'Quantidade' 
        },
    series: [
        { name: 'Formados', data: formados, type: 'line', color: colorscheme[2] },
        { name: 'Evadidos', data: evadidos, type: 'line', color: colorscheme[0] }
    ],
    grid: { left: '50px', right: '20px', bottom: '12%', top: '60px' }
};


    // --- GRÁFICO DE TIPOS (BARRAS) ---
    const porTipo = d3.rollups(
        dadosFiltrados,
        v => v.length,
        d => d.FORMA_EVASAO_limpo
    )
    .map(([tipo, total]) => ({
        name: tipo || "Não Informado", // Tratamento para valores vazios
        value: total
    }))
    .filter(d => d.value > 0 && d.name !== "Formado" && d.name !== "Sem Evasão") // Removemos formados do gráfico de tipos de evasão
    .sort((a, b) => b.value - a.value);



	const optionTipos = {
        title: {
            text: 'Evasão por Tipo',
            left: 'left',
        },
		animation: true,
		animationDuration: 1000,
		animationEasing: 'elasticOut',
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			className: 'custom-tooltip',
            confine: true,
		},
        toolbox: {
            feature: {
                saveAsImage: {},
            }
        },
		grid: {
			left: '2%',
			right: '10%',
			bottom: '10%',
			top: '15%',
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
				// color: '#13293d',
				 color: colorscheme[0],
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


    // --- GRÁFICO DE SEXO (PIZZA) ---
    const ordemDesejada = ["1º Semestre", "2º Semestre"];
    const counts = d3.rollup(dadosFiltrados, v => v.length, d => d.PERIODO_EVASAO || "Não Informado");
    const porSexo = ordemDesejada.map(sexo => ({
        name: sexo,
        value: counts.get(sexo) || 0
    }));

    const optionSexo = {
        title: {
            text: 'Evasão por Semestre',
            left: 'left',
        },
        animation: true,
		animationDuration: 1000,
		animationEasing: 'cubicInOut',
        toolbox: {
            feature: {
            saveAsImage: {}
            }
        },
        tooltip: {
            trigger: 'item',
            className: 'custom-tooltip',
            confine: true,
        },
        legend: {
            orient: 'horizontal',
            type: 'scroll',
            bottom: 'bottom',
        },
        color: colorscheme,
        series: [{
            name: 'Semestre',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            universalTransition: true,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
                label: {
                    show: false,
                    fontSize: '18',
                    fontWeight: 'bold'
                }
            },
            id: 'porSexo',
            universalTransition: true,
            data: porSexo
        }]
    };

// GRAFICO RETENÇÃO

const anosEvasao = [...new Set(dadosFiltrados.map(d => d.ANO_EVASAO))].sort();
    
const mediaEvadidos = anosEvasao.map(ano => {
    const alunos = dadosFiltrados.filter(d => d.ANO_EVASAO === ano && d.FORMA_EVASAO_limpo !== "Formado");
    return d3.mean(alunos, d => d.RETENCAO_PERIODOS) || 0;
});

const mediaFormados = anosEvasao.map(ano => {
    const alunos = dadosFiltrados.filter(d => d.ANO_EVASAO === ano && d.FORMA_EVASAO_limpo === "Formado");
    return d3.mean(alunos, d => d.RETENCAO_PERIODOS) || 0;
});



// --- RENDERIZAÇÃO ---
    try {
        // Atualiza gráfico de anos
        graficoAnos.setOption(optionAnos, {
			notMerge: false,       // IMPORTANTE: permite transições  
			lazyUpdate: false,
		}); 
        
        // Atualiza gráfico de pizza (o 'true' limpa os eixos do gráfico de barras antigo)
        graficoTipos.setOption(optionTipos, {
			notMerge: false,       // IMPORTANTE: permite transições
			lazyUpdate: false
		});

        graficoSexo.setOption(optionSexo, {
			notMerge: false,       // IMPORTANTE: permite transições  
			lazyUpdate: false,
		});

    } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
    }
}