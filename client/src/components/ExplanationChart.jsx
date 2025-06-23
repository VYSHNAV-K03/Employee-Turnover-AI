import React, { useState } from 'react';
import { getExplanation } from '../services/api';
import { Bar } from 'react-chartjs-2';

const ExplanationChart = ({ instance }) => {
  const [explanation, setExplanation] = useState([]);

  const getExplanationData = async () => {
    const response = await getExplanation(instance);
    setExplanation(response.data.explanation);
  };

  const chartData = {
    labels: explanation.map((item) => item[0]),
    datasets: [
      {
        label: 'Feature Importance',
        data: explanation.map((item) => item[1]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <button onClick={getExplanationData}>Get Explanation</button>
      {explanation.length > 0 && <Bar data={chartData} />}
    </div>
  );
};

export default ExplanationChart;
