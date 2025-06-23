import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [emailcontent, setemailcontent] = useState("");
  const [loading_email, setloading_email] = useState(false);
  const columnOrder = [
    "Name ",
    "Age",
    "Attrition",
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
  ];

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Failed to fetch employees", err));
  }, []);

  const handleSendEmail = async () => {
    setloading_email(true);
    try {
      const response = await axios.post(
        "http://localhost:7000/api/send-email/dummy_emp",
        { emailcontent }
      );
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    } finally {
      setloading_email(false);
    }
  };

  return (
    <div className=" mt-5">
      <div className="card shadow-lg">
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            data-bs-toggle="modal"
            data-bs-target="#emailModal"
          >
            <i className="bi bi-envelope-fill"></i> Send Email
          </button>
        </div>
        <div className="card-header bg-secondary text-white text-center">
          <h3 className="mb-0">Attrition Employees</h3>
        </div>
        <div className="card-body">
          {employees.length === 0 ? (
            <p className="text-center text-muted">No employee data found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle text-center">
                <thead className="table-dark">
                  <tr>
                    {columnOrder.map((key) => (
                      <th key={key} className="text-capitalize">
                        {key.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={idx}>
                      {columnOrder.map((key) => (
                        <td key={key}>
                          {typeof emp[key] === "boolean" ? (
                            <span
                              className={`badge bg-${
                                emp[key] ? "success" : "danger"
                              }`}
                            >
                              {emp[key] ? "Yes" : "No"}
                            </span>
                          ) : (
                            String(emp[key] ?? "")
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      </div>
    </div>
  );
}
