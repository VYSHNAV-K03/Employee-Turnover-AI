import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

export const trainModel = (data) => axios.post(`${API_URL}/train`, { data });

export const getExplanation = (instance) =>
  axios.post(`${API_URL}/explain`, { instance });
