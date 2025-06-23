import React from 'react';
import backgroundImage from '../assets/img2.jpg'; // Ensure this path is correct
import GraphComponent from '../components/GraphComponent';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}
    >
      <div className="container py-5 " style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center mb-5" >
          <h1 className="display-4 fw-bold">Employee Turnover AI</h1>
          <p className="lead">
            Your trusted platform for predicting employee attrition using advanced AI and explainable insights.
          </p>
        </div>
      </div>

      {/* Additional Section - How It Works */}
      <section className="bg-dark bg-opacity-75 py-5">
        <div className="container text-white">
          <div className="text-center mb-4">
            <h2 className="fw-bold">How It Works</h2>
            <p>Explore the AI workflow from data to prediction</p>
          </div>

          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <div className="card bg-transparent border-light h-100 text-white">
                <div className="card-body">
                  <h5 className="card-title">AI-Powered Insights</h5>
                  <p className="card-text">Uses Explainable AI to understand key drivers of employee attrition.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card bg-transparent border-light h-100 text-white">
                <div className="card-body">
                  <h5 className="card-title">Graph-Based Analysis</h5>
                  <p className="card-text">Knowledge graphs and embeddings power deeper workforce analytics.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card bg-transparent border-light h-100 text-white">
                <div className="card-body">
                  <h5 className="card-title">Actionable Results</h5>
                  <p className="card-text">Support HR decisions with predictions and visual explanations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
