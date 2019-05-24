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
				/* backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)'
				],
				pointBackgroundColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)'
				], */
				pointHoverBorderWidth: 0,
				pointHoverRadius: 12,
				pointRadius: 10,
				pointStyle: 'triangle'
			}]
		},
		options: {
			aspectRatio: 1.7,
			legend: {
				display: false,
			},
			scale: {
				angleLines:{
					color: 'rgb(69, 77, 85, 1)',
				},
				gridLines: {
					color: 'rgb(69, 77, 85, 1)',
				},
				pointLabels: {
					fontSize: 20,
					fontStyle: '500'
				},
				ticks: {
					backdropColor: 'rgb(52, 58, 64, 1)',
					backdropPaddingX: 4,
					backdropPaddingY: 4,
					beginAtZero: true,
					fontSize: 12,
					max: 20,
					min: 0,
					stepSize: 5
				}
			}
		}
	});

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
	socket.on('screenUpdateChart', function(voteData){

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
});