$(function(){

	// Initialize Socket.IO instance.
	var socket = io();

	// Set chart default properties.
	Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 1)';

	// Get chart element.
	var chartElement = document.getElementById('ballot-chart');

	// Set chart options and initialize chart.
	var ballotChart = new Chart(chartElement, {
		type: 'radar',
		data: {
			labels: ['Song', 'Performance', 'Staging', 'Wardrobe'],
			datasets: [{
				data: [0, 0, 0, 0],
				pointHoverRadius: 12,
				pointRadius: 10,
				pointStyle: 'triangle'
			}]
		},
		options: {
			aspectRatio: 1.125,
			legend: {
				display: false
			},
			plugins: {
				colorschemes: {
					scheme: 'brewer.PuOr3'
				}
			},
			scale: {
				angleLines:{
					color: 'rgb(69, 77, 85, 1)'
				},
				gridLines: {
					color: 'rgb(69, 77, 85, 1)'
				},
				pointLabels: {
					fontSize: 28,
					fontStyle: '500'
				},
				ticks: {
					backdropColor: 'rgb(52, 58, 64, 1)',
					backdropPaddingX: 4,
					backdropPaddingY: 4,
					beginAtZero: true,
					fontColor: 'rgb(108, 117, 125, 1)',
					fontSize: 16,
					max: 40,
					min: 0,
					stepSize: 10
				}
			}
		}
	});

	/*----------------------------------------------------------
	# Screen functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function initScreen(){

		// Send app event.
		socket.emit('screenRegister');
	}

	/*----------------------------------------------------------
	# Screen events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('ballotOpen', function(contestant){

		// ...
		$('#stats-ballot').text(contestant.country);
	});

	/**
	 * ...
	 */
	socket.on('ballotClose', function(){

		// ...
		$('#stats-ballot').text('--');

		// ...
		$('#stats-votes').text(0);

		// Reset chart data.
		ballotChart.data.datasets[0].data = [0, 0, 0, 0];

		// Update chart.
		ballotChart.update();
	});

	/**
	 * ...
	 */
	socket.on('screenUpdateDisplay', function(voteData){

		// ...
		$('#stats-votes').text(voteData[0].votes);
		
		// Set updated chart data.
		ballotChart.data.datasets[0].data = [
			voteData[0].cat1,
			voteData[0].cat2,
			voteData[0].cat3,
			voteData[0].cat4
		];

		// Update chart.
		ballotChart.update();
	});

	initScreen();
});