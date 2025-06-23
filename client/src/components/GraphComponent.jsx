// src/components/GraphComponent.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const GraphComponent = () => {
    const data = {
        labels: ['Satisfied', 'At Risk', 'Likely to Leave'],
        datasets: [
            {
                label: 'Employee Count',
                data: [300, 120, 50],
                backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default GraphComponent;
