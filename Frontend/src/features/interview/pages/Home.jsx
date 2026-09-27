import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

const Home = () => {
    const {loading, generateReport,reports} = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
      const data = await generateReport({resumeFile, selfDescription, jobDescription})
      if (data?._id) {
        navigate(`/interview/${data._id}`)
      }
    }

    if(loading){
        return(
            <main className="loading-screen">
                <p>Generating your interview strategy...</p>
            </main>
        )
    }

  return (
    <main className="home">
      <div className="home-content">
        <header className="home-heading">
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze the job requirements and your unique profile to
            <br className="desktop-break" /> build a winning strategy.
          </p>
        </header>

        <section className="interview-panel" aria-label="Interview plan details">
          <div className="interview-input-group">
            <div className="left">
              <div className="section-heading">
                <label htmlFor="jobDescription">
                  <span className="section-icon" aria-hidden="true">&#8962;</span>
                  Target Job Description
                </label>
                <span className="field-badge">Required</span>
              </div>
              <textarea
                onChange={(e)=>setJobDescription(e.target.value)}   
                name="jobDescription"
                id="jobDescription"
                maxLength={5000}
                placeholder={'Paste the full job description here...\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."'}
              />
            </div>

            <div className="right">
              <div className="section-heading profile-heading">
                <h2>
                  <span className="section-icon" aria-hidden="true">&#9817;</span>
                  Your Profile
                </h2>
              </div>

              <div className="input-group resume-group">
                <div className="resume-label-row">
                  <label htmlFor="resume">Upload Resume</label>
                  <span className="field-badge">Best results</span>
                </div>
                <input
                ref={resumeInputRef}
                  className="upload-input"
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf,.docx"
                />
                <label className="file-label" htmlFor="resume">
                  <span className="upload-icon" aria-hidden="true">&#8593;</span>
                  <span>Click to upload or drag &amp; drop</span>
                  <small>PDF or DOCX (Max 5 MB)</small>
                </label>
              </div>

              <div className="or-divider"><span>OR</span></div>

              <div className="input-group self-description-group">
                <label htmlFor="selfDescription">Quick Self-Description</label>
                <textarea
                onChange={(e)=>setSelfDescription(e.target.value)}
                  name="selfDescription"
                  id="selfDescription"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                />
              </div>

              <p className="requirement-note">
                <span className="note-icon" aria-hidden="true">i</span>
                <span>
                  Either a <strong>Resume</strong> or a <strong>Self-Description</strong> is
                  required to generate a personalized plan.
                </span>
              </p>
            </div>
          </div>

          <footer className="panel-footer">
            <p>AI-Powered Strategy Generation <span>&middot;</span> Approx. 30 sec</p>
            <button 
            onClick={handleGenerateReport}
            className="button primary-button generate-button" type="button">
              <span aria-hidden="true">&#9733;</span>
              Generate My Interview Strategy
            </button>
          </footer>
        </section>
        
        {/* Recently generated reports section */}

        {reports.length > 0 && (
          <section className="recent-reports" aria-label="Recently generated reports">
            <h2>Recently Generated Reports</h2>
            <ul className="report-list">
              {reports.map((report) => (
                <li key={report._id} className="report-item" onClick={() => navigate(`/interview/${report._id}`)}>
                  <h3>{report.title || "Unnamed Report"}</h3>
                  <p className="report-meta">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                  <p className="match-score">Match Score: {report.matchScore}/100</p>
                </li>
              ))}
            </ul>
          </section>
        )}  

        <nav className="home-footer" aria-label="Information">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help Center</span>
        </nav>
      </div>
    </main>
  );
};

export default Home;
