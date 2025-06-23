import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles

export default function AttritionExplainer() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading_send, setLoading_send] = useState(false);
  const [loading_email, setloading_email] = useState(false);

  const [htmlContent, setHtmlContent] = useState("");
  const [graphHTML, setGraphHTML] = useState(null);
  const [connections, setConnections] = useState([]);
  const [index, setIndex] = useState("");
  const [reasons, setReasons] = useState([]);
  const [similarEmployees, setSimilarEmployees] = useState([]);
  const [Attrition, setAttrition] = useState();
  const [showDetails, setShowDetails] = useState(false); // Control showing details
  const [employeeDetails, setEmployeeDetails] = useState(null); // New state
  const [showReasons, setShowReasons] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [filesender, setfilesender] = useState(null);
  const [emailcontent, setemailcontent] = useState("");
  const orderedKeys = [
    "Name ",
    "Age",
    "BusinessTravel",
    "DailyRate",
    "Department",
    "DistanceFromHome",
    "Education",
    "EducationField",
    "EmployeeNumber",
    "EnvironmentSatisfaction",
    "Gender",
    "HourlyRate",
    "JobInvolvement",
    "JobLevel",
    "JobRole",
    "JobSatisfaction",
    "MaritalStatus",
    "MonthlyIncome",
    "MonthlyRate",
    "NumCompaniesWorked",
    "OverTime",
    "PercentSalaryHike",
    "PerformanceRating",
    "RelationshipSatisfaction",
    "StockOptionLevel",
    "TotalWorkingYears",
    "TrainingTimesLastYear",
    "WorkLifeBalance",
    "YearsAtCompany",
    "YearsInCurrentRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
    "Attrition_Predicted",
  ];

  console.log(employeeDetails);

  const fetchLatestFile = async () => {
    try {
      const response = await axios.get(`http://localhost:7000/api/latest`);
      console.log(response.data);

      const { name, type, size, data, lastModified, userId } = response.data;

      // Convert base64 to binary
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type });

      // Create a File object
      const file = new File([fileBlob], name, { type, lastModified });

      setFile(file);
      setfilesender(userId);

      console.log(file);

      // setLatestFile(response.data);
    } catch (error) {
      console.log("Error fetching latest file:", error);
    }
  };

  const handleUpload = async () => {
    if (!file || index === "") {
      alert("Please select a file and enter an employee index");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("index", index);

    console.log(file);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(response.data);

      setImage(`data:image/png;base64,${response.data.explanation_image}`);
      setHtmlContent(response.data.explanation_html);
      setGraphHTML(response.data.graph_html);
      setConnections(response.data.connections || []);
      setSimilarEmployees(response.data.similar_employees || []);
      setAttrition(response.data.attrition);
      setReasons(response.data.reasons);
      setEmployeeDetails(response.data.employee_data || null); // Set employee data
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the file");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmployeeDetails = async () => {
    setLoading_send(true);
    try {
      const response = await axios.post(
        "http://localhost:7000/api/store-employee",
        { employeeDetails, filesender, index }
      );
      alert("Employee details sent successfully!");
    } catch (error) {
      console.error("Error sending employee details:", error);
      alert("Failed to send employee details.");
    } finally {
      setLoading_send(false);
    }
  };

  const handleSendEmail = async () => {
    setloading_email(true);
    try {
      const response = await axios.post(
        "http://localhost:7000/api/send-email",
        { emailcontent, filesender }
      );
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    } finally {
      setloading_email(false);
    }
  };

  console.log(employeeDetails);

  useEffect(() => {
    fetchLatestFile();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">
        <i className="bi bi-bar-chart-line-fill me-2 text-primary"></i>
        Employee Attrition Explainer
      </h1>

      {/* Upload Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3 shadow-sm">
            <span className="input-group-text">
              <i className="bi bi-person-badge-fill"></i>
            </span>
            <input
              type="number"
              placeholder="Enter Employee Index"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            onClick={handleUpload}
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-upload"></i> Upload and Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Attrition Message */}
      {Attrition !== undefined && (
        <div
          className={`alert text-center mt-3 fw-bold ${
            Attrition ? "alert-danger" : "alert-success"
          } animate__animated animate__fadeIn`}
        >
          <i
            className={`bi ${
              Attrition
                ? "bi-exclamation-triangle-fill"
                : "bi-check-circle-fill"
            } me-2`}
          ></i>
          {Attrition
            ? "Attrition Detected! Click below to view details."
            : "No Attrition Detected."}
        </div>
      )}

      {/* Toggle Details Button */}
      {Attrition && (
        <div className="text-center mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`btn ${
              showDetails ? "btn-secondary" : "btn-info"
            } d-flex align-items-center gap-2 mx-auto`}
          >
            <i className={`bi ${showDetails ? "bi-eye-slash" : "bi-eye"}`}></i>
            {showDetails ? "Hide Reasons & Details" : "Show Reasons & Details"}
          </button>
        </div>
      )}

      {/* Tabbed Details Section */}
      {showDetails && (
        <div className="mt-5">
          {/* Add icons to tab headers */}
          <ul className="nav nav-tabs" id="detailsTabs" role="tablist">
            {htmlContent && (
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="lime-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#lime"
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-lightbulb-fill me-1 text-warning"></i>
                  LIME Explanation
                </button>
              </li>
            )}
            {graphHTML && (
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${!htmlContent ? "active" : ""}`}
                  id="graph-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#graph"
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-graph-up-arrow me-1 text-success"></i>
                  Temporal Graph
                </button>
              </li>
            )}
            {employeeDetails && (
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="details-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#details"
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-person-lines-fill me-1 text-info"></i>
                  Employee Details
                </button>
              </li>
            )}
          </ul>

          <div
            className="tab-content p-3 border border-top-0 shadow"
            id="detailsTabsContent"
          >
            {htmlContent && (
              <div
                className="tab-pane fade show active"
                id="lime"
                role="tabpanel"
              >
                <iframe
                  style={{ width: "100%", height: "400px" }}
                  srcDoc={htmlContent}
                  className="w-100 border rounded"
                  title="LIME Explanation"
                />
                {reasons.length > 0 && (
                  <div className="mt-3">
                    <button
                      className="btn btn-outline-primary mb-2"
                      onClick={() => setShowReasons(!showReasons)}
                    >
                      {showReasons ? "Hide Reasons" : "Show Reasons"}
                    </button>

                    {showReasons && (
                      <ul className="list-group">
                        {reasons.map((item, index) => (
                          <li key={index} className="list-group-item">
                            <strong>{index + 1} :</strong> {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {graphHTML && (
              <div
                className={`tab-pane fade ${!htmlContent ? "show active" : ""}`}
                id="graph"
                role="tabpanel"
              >
                <iframe
                  style={{ width: "100%", height: "800px" }}
                  srcDoc={graphHTML}
                  className="w-100 border rounded"
                  title="Temporal Graph"
                />
                {connections.length > 0 && (
                  <div className="mt-3">
                    <button
                      className="btn btn-outline-primary mb-2"
                      onClick={() => setShowConnections(!showConnections)}
                    >
                      {showConnections
                        ? "Hide Connections"
                        : "Show Connections"}
                    </button>

                    {showConnections && (
                      <table className="table table-bordered table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Connected Index</th>
                            <th>Employee Number</th>
                            <th>Similarity Score</th>
                            <th>Shared Features</th>
                          </tr>
                        </thead>
                        <tbody>
                          {connections.map((conn, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>{conn["Name"]}</td>
                              <td>{conn["Connected Index"]}</td>
                              <td>{conn["Connected EmployeeNumber"]}</td>
                              <td>{conn["Similarity Score"]}</td>
                              <td>{conn["Shared Features"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}

            {connections.length > 0 && (
              <div className="tab-pane fade" id="connections" role="tabpanel">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Connected Index</th>
                      <th>Employee Number</th>
                      <th>Similarity Score</th>
                      <th>Shared Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((conn, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{conn["Name"]}</td>
                        <td>{conn["Connected Index"]}</td>
                        <td>{conn["Connected EmployeeNumber"]}</td>
                        <td>{conn["Similarity Score"]}</td>
                        <td>{conn["Shared Features"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reasons.length > 0 && (
              <div className="tab-pane fade" id="reasons" role="tabpanel">
                <ul className="list-group">
                  {reasons.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{index + 1} :</strong> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {similarEmployees.length > 0 && (
              <div className="tab-pane fade" id="similar" role="tabpanel">
                <div className="row">
                  {similarEmployees.map((emp, index) => (
                    <div key={index} className="col-md-4 mb-3">
                      <div className="card shadow h-100">
                        <div className="card-body">
                          <h6 className="card-title text-center">
                            Employee {index + 1}
                          </h6>
                          <p>
                            <strong>Age:</strong>{" "}
                            {Math.round(Number(emp.Age) * 100)}
                          </p>
                          <p>
                            <strong>Monthly Income:</strong> ₹
                            {Math.round(Number(emp.MonthlyIncome) * 100000)}
                          </p>
                          <p>
                            <strong>Similarity:</strong>{" "}
                            {Math.round(Number(emp.similarity) * 100)}%
                          </p>
                          <p>
                            <strong>Attrition Status:</strong>{" "}
                            {Math.round(Number(emp.Attrition_Yes) * 100) ===
                            0 ? (
                              <span className="badge bg-success">No</span>
                            ) : (
                              <span className="badge bg-danger">Yes</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employeeDetails && (
              <div className="tab-pane fade " id="details" role="tabpanel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    <i className="bi bi-file-earmark-person-fill me-2"></i>
                    Employee Details
                  </h5>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-success d-flex align-items-center gap-2 ${
                        loading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSendEmployeeDetails}
                      disabled={loading_send}
                    >
                      {loading_send ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill"></i> Send to Backend
                        </>
                      )}
                    </button>

                    <button
                      className="btn btn-primary d-flex align-items-center gap-2"
                      data-bs-toggle="modal"
                      data-bs-target="#emailModal"
                    >
                      <i className="bi bi-envelope-fill"></i> Send Email
                    </button>
                  </div>
                </div>

                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Column</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedKeys.map((key, idx) => (
                      <tr key={idx}>
                        <th>{key}</th>
                        <td>{employeeDetails[key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Email Modal */}
                <div
                  className="modal fade"
                  id="emailModal"
                  tabIndex="-1"
                  aria-labelledby="emailModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="emailModalLabel">
                          Send Email
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <textarea
                          className="form-control"
                          placeholder="Enter email content here..."
                          rows="5"
                          value={emailcontent}
                          onChange={(e) => setemailcontent(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Close
                        </button>

                        <button
                          type="button"
                          onClick={handleSendEmail}
                          className="btn btn-primary"
                        >
                          {loading_email ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending...
                            </>
                          ) : (
                            <>Send</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
