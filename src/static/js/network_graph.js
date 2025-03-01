document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    Highcharts.chart('graph-container', {
        chart: {
            type: 'networkgraph',
            plotBorderWidth: 1,
            backgroundColor: '#2e3440',
        },
       
        title: {
            text: null // Disable the title
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                marker: {
                    radius: 6 // Set the default node size
                },
                events: {
                    click: function (event) {
                        const nodeName = event.point.name;
                        console.log('Node clicked:', nodeName);
                        window.location.href = '/device/' + nodeName;
                    }
                }
            }
        },
        series: [{
            layoutAlgorithm: {
                enableSimulation: true,
                initialPositions: function () {
                    const chart = this.series[0].chart,
                        width = chart.plotWidth,
                        height = chart.plotHeight;

                    this.nodes.forEach(function (node) {
                        // If initial positions were set previously, use that
                        // positions. Otherwise use random position:
                        node.plotX = node.plotX === undefined ?
                            Math.random() * width : node.plotX;
                        node.plotY = node.plotY === undefined ?
                            Math.random() * height : node.plotY;
                    });
                }
            },
            name: 'K8',
            data: [
                ['Kannur', 'Iritty'],
                ['Kannur', 'Kannur'],
                ['Kannur', 'Payyannur'],
                ['Kannur', 'Taliparamba'],
                ['Kannur', 'Thalasseri'],
                ['Iritty', 'Aralam'],
                ['Iritty', 'Ayyankunnu'],
                ['Iritty', 'Chavassery'],
                ['Iritty', 'Kalliad'],
                ['Iritty', 'Kanichar'],
                ['Iritty', 'Keezhur'],
                ['Iritty', 'Kelakam'],
                ['Iritty', 'Kolari'],
                ['Iritty', 'Kottiyoor'],
                ['Iritty', 'Manathana'],
                ['Iritty', 'Muzhakkunnu'],
                ['Iritty', 'Nuchiyad'],
                ['Iritty', 'Padiyoor'],
                ['Iritty', 'Payam'],
                ['Iritty', 'Pazhassi'],
                ['Iritty', 'Thillenkeri'],
                ['Iritty', 'Vayathur'],
                ['Iritty', 'Vellarvelly'],
                ['Iritty', 'Vilamana'],
                ['Kannur', 'Ancharakandy'],
                ['Kannur', 'Azhikode North'],
                ['Kannur', 'Azhikode South'],
                ['Kannur', 'Chelora'],
                ['Kannur', 'Chembilode'],
                ['Kannur', 'Cherukunnu'],
                ['Kannur', 'Chirakkal'],
                ['Kannur', 'Edakkad'],
                ['Kannur', 'Elayavoor'],
                ['Kannur', 'Iriveri'],
                ['Kannur', 'Kadambur'],
                ['Kannur', 'Kalliasseri'],
                ['Kannur', 'Kanhirode'],
                ['Kannur', 'Kannadiparamba'],
                ['Kannur', 'Kannapuram'],
                ['Kannur', 'Kannur I'],
                ['Kannur', 'Kannur II'],
                ['Kannur', 'Makreri'],
                ['Kannur', 'Mattool'],
                ['Kannur', 'Mavilayi'],
                ['Kannur', 'Munderi'],
                ['Kannur', 'Muzhappilangad'],
                ['Kannur', 'Narath'],
                ['Kannur', 'Pallikkunnu'],
                ['Kannur', 'Pappinisseri'],
                ['Kannur', 'Puzhathi'],
                ['Kannur', 'Valapattanam'],
                ['Kannur', 'Valiyannur'],
                ['Thalasseri','Kuthuparamba'],
                ['Thalasseri','Panoor'],
                ['Payyannur','Taliparamba'],

            ],
            nodes: [{
                id: 'Kannur',
                color: 'green', // Change the color to green
                marker: {
                    radius: 15 // Increase the size of the Kannur node
                }
            }, {
                id: 'Iritty',
                color: 'red', // Change the color to red
                marker: {
                    radius: 10 // Set the size of the Iritty node
                }
            }, {
                id: 'Thalasseri',
                color: 'red',   
                marker: {
                    radius: 10 
                }
            },
            {

                id: 'Payyannur',
                color: 'red',
                marker: {
                    radius: 10
                }
            
            },
            {

                id: 'Taliparamba',
                color: 'red',
                marker: {
                    radius: 10
                }
            
            },
            

        ],
            dataLabels: {
                enabled: true,
                linkFormat: '',
                // allowOverlap: true,
                style: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--nord8')
                }
            }
        }]
    });
    console.log('Highcharts chart initialized');
});