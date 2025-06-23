import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";

const UploadEmp = () => {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileData, setFileData] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setFileData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user._id);

    try {
      const response = await axios.post(
        "http://localhost:7000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage("✅ File uploaded successfully!");
      setUploadedFile(response.data);
    } catch (error) {
      setMessage("❌ Error uploading file.");
      console.error(error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <a href="/attrition_emp" className="btn btn-outline-primary">
          View Attrition List
        </a>
      </div>

      <div className="card shadow-lg">
        <div className="card-header bg-black text-white text-center">
          <h4 className="mb-0">📤 Upload Employee File</h4>
        </div>

        <div className="card-body">
          {message && <div className="alert alert-info">{message}</div>}

          <form onSubmit={handleUpload} className="mb-4">
            <div className="mb-3">
              <label htmlFor="file" className="form-label fw-semibold">
                Select Excel or CSV File
              </label>
              <input
                type="file"
                className="form-control border-dashed"
                id="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Upload File
            </button>
          </form>

          {uploadedFile && (
            <div className="mt-4">
              <h5 className="text-primary">📁 Uploaded File Info</h5>
              <table className="table table-bordered table-sm shadow-sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>File Path</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>{uploadedFile.filePath}</td>
                    <td>{uploadedFile.userId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {fileData.length > 0 && (
            <div className="mt-4">
              <h5 className="text-secondary">🔍 File Content Preview</h5>
              <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="table table-striped table-hover table-bordered table-sm shadow-sm">
                  <thead className="table-dark sticky-top">
                    <tr>
                      {Object.keys(fileData[0]).map((key, index) => (
                        <th key={index} className="text-capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadEmp;
