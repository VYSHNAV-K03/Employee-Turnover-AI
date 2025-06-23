import React, { useState } from 'react';
import { trainModel } from '../services/api';

const UploadDataset = ({ onTrain }) => {
  const [file, setFile] = useState(null);

  const handleFileUpload = async (e) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const jsonData = csvToJson(csvData);
    //   console.log(csvToJson(csv));
      await trainModel(jsonData);
      onTrain(true);
    };
    reader.readAsText(file);
  };

  const csvToJson = (csv) => {
    const lines = csv.split('\n').filter((line) => line.trim() !== ''); // Filter out empty lines
    const headers = lines[0].split(',').map((header) => header.trim()); // Clean headers
  
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim());
      
      // Check if number of values matches number of headers
      if (values.length !== headers.length) {
        console.warn('Skipping malformed line:', line);
        return null; // Skip malformed rows
      }
  
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || ''; // Handle empty or undefined values
        return obj;
      }, {});
    }).filter((row) => row !== null); // Remove null (malformed) rows
  };
  

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleFileUpload}>Upload and Train Model</button>
    </div>
  );
};

export default UploadDataset;
