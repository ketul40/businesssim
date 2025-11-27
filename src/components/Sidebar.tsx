import { useState, ChangeEvent } from 'react';
import { FileText, Target, StickyNote, Upload, X } from 'lucide-react';
import { SIDEBAR_TABS } from '../constants/states';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - rubrics.js doesn't have type definitions
import { RUBRICS } from '../constants/rubrics';
import { SidebarProps } from '../types/props';

export default function Sidebar({ scenario, activeTab, onTabChange, notes, onNotesChange, onFileUpload }: SidebarProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rubric: any = RUBRICS[scenario.rubricId.toUpperCase()] || RUBRICS.PERSUASION_DIRECTOR;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
    if (onFileUpload) {
      files.forEach(file => onFileUpload(file));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-tabs" role="tablist" aria-label="Sidebar navigation">
        <button
          className={`sidebar-tab ${activeTab === SIDEBAR_TABS.CONTEXT ? 'active' : ''}`}
          onClick={() => onTabChange(SIDEBAR_TABS.CONTEXT)}
          role="tab"
          aria-selected={activeTab === SIDEBAR_TABS.CONTEXT}
          aria-controls="sidebar-content"
          aria-label="Context tab"
        >
          <FileText size={18} aria-hidden="true" />
          Context
        </button>
        <button
          className={`sidebar-tab ${activeTab === SIDEBAR_TABS.RUBRIC ? 'active' : ''}`}
          onClick={() => onTabChange(SIDEBAR_TABS.RUBRIC)}
          role="tab"
          aria-selected={activeTab === SIDEBAR_TABS.RUBRIC}
          aria-controls="sidebar-content"
          aria-label="Rubric tab"
        >
          <Target size={18} aria-hidden="true" />
          Rubric
        </button>
        <button
          className={`sidebar-tab ${activeTab === SIDEBAR_TABS.NOTES ? 'active' : ''}`}
          onClick={() => onTabChange(SIDEBAR_TABS.NOTES)}
          role="tab"
          aria-selected={activeTab === SIDEBAR_TABS.NOTES}
          aria-controls="sidebar-content"
          aria-label="Notes tab"
        >
          <StickyNote size={18} aria-hidden="true" />
          Notes
        </button>
      </div>

      <div className="sidebar-content" id="sidebar-content" role="tabpanel" aria-label={`${activeTab} panel`}>
        {activeTab === SIDEBAR_TABS.CONTEXT && (
          <div className="context-panel">
            <h3>Scenario Context</h3>
            
            <div className="context-section">
              <h4>Stakeholders</h4>
              {scenario.stakeholders.map((stakeholder, idx) => (
                <div key={idx} className="stakeholder-card">
                  <div className="stakeholder-header">
                    <strong>{stakeholder.name}</strong>
                    <span className="role-tag">{stakeholder.role}</span>
                  </div>
                  <p className="stakeholder-personality">{stakeholder.personality}</p>
                  <div className="stakeholder-details">
                    <div>
                      <strong>Concerns:</strong>
                      <ul>
                        {stakeholder.concerns.map((concern, i) => (
                          <li key={i}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Motivations:</strong>
                      <ul>
                        {stakeholder.motivations.map((motivation, i) => (
                          <li key={i}>{motivation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="context-section">
              <h4>Constraints</h4>
              <ul className="constraints-list">
                {scenario.constraints.map((constraint, idx) => (
                  <li key={idx}>{constraint}</li>
                ))}
              </ul>
            </div>

            <div className="context-section">
              <h4>Upload Context Files</h4>
              <p className="help-text">Add slides, KPIs, or documents for AI reference</p>
              <label className="file-upload-btn" htmlFor="file-upload-input">
                <Upload size={16} aria-hidden="true" />
                Choose Files
                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept=".pdf,.pptx,.ppt,.csv,.xlsx,.xls,.txt,.md"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  aria-label="Upload context files"
                />
              </label>
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files" role="list" aria-label="Uploaded files">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="uploaded-file" role="listitem">
                      <span>{file.name}</span>
                      <button 
                        onClick={() => removeFile(idx)} 
                        className="btn-icon"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === SIDEBAR_TABS.RUBRIC && (
          <div className="rubric-panel">
            <h3>{rubric.name}</h3>
            <p className="help-text">You'll be evaluated on these criteria after the simulation</p>
            
            {rubric.criteria.map((criterion: any, idx: number) => (
              <div key={idx} className="rubric-criterion">
                <div className="criterion-header">
                  <h4>{criterion.name}</h4>
                  <span className="criterion-weight">{Math.round(criterion.weight * 100)}%</span>
                </div>
                <p className="criterion-description">{criterion.description}</p>
                <div className="criterion-anchors">
                  <div className="anchor">
                    <span className="anchor-score">1</span>
                    <span>{criterion.anchors[1]}</span>
                  </div>
                  <div className="anchor">
                    <span className="anchor-score">3</span>
                    <span>{criterion.anchors[3]}</span>
                  </div>
                  <div className="anchor">
                    <span className="anchor-score">5</span>
                    <span>{criterion.anchors[5]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === SIDEBAR_TABS.NOTES && (
          <div className="notes-panel">
            <h3>Your Notes</h3>
            <p className="help-text">Jot down thoughts, key points, or reminders</p>
            <label htmlFor="notes-textarea" className="visually-hidden">
              Your notes
            </label>
            <textarea
              id="notes-textarea"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Take notes during the simulation..."
              rows={15}
              className="notes-textarea"
              aria-label="Notes textarea"
            />
          </div>
        )}
      </div>
    </div>
  );
}
