$(function(){

    // Initialize Socket.IO instance.
	var socket = io();

	Chart.defaults.global.defaultFontColor = 'rgba(255, 255, 255, 1)';

    var ctx = document.getElementById('ballot-chart');
    var ballotChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Song', 'Performance', 'Staging', 'Wardrobe'],
            datasets: [{
                data: [],
                backgroundColor: [
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
                ],
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
					color: 'rgb(255, 255, 255, .5)',
				},
				gridLines: {
					color: 'rgb(255, 255, 255, .5)',
				},
                pointLabels: {
					fontSize: 20,
					fontStyle: 'bold'
                },
                ticks: {
					backdropColor: 'rgba(0, 0, 0, 0)',
					backdropPaddingX: 4,
					backdropPaddingY: 4,
					beginAtZero: true,
					fontSize: 14,
                    max: 20,
					min: 0,
                    stepSize: 5
                }
            }
        }
    });

    /**
	 * ...
	 */
	socket.on('screenUpdateChart', function(voteData){
        
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