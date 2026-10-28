import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  GitBranch,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TopBar } from '../components/layout/TopBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api, getCachedData, setCachedData } from '../services/api';

export const StudentProfile = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const cachedProfile = getCachedData('student_my_profile');
  const [loading, setLoading] = useState(() => !cachedProfile);
  const [student, setStudent] = useState(() => cachedProfile?.student || null);
  const [projects, setProjects] = useState(() => cachedProfile?.projects || []);
  const [certifications, setCertifications] = useState(() => cachedProfile?.certifications || []);
  const [internships, setInternships] = useState(() => cachedProfile?.internships || []);
  const [mentorNotes, setMentorNotes] = useState(() => cachedProfile?.mentorNotes || []);
  const [documents, setDocuments] = useState(() => getCachedData('student_documents') || []);
  const [documentRequests, setDocumentRequests] = useState(() => getCachedData('student_doc_requests') || []);

  // Modal states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', techStack: '', githubUrl: '' });

  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', credentialId: '', issueDate: '' });

  // Fetch real data from MongoDB with cache support
  const fetchProfile = async () => {
    try {
      if (!getCachedData('student_my_profile')) {
        setLoading(true);
      }
      const [res, docsRes, reqsRes] = await Promise.all([
        api.students.getMyProfile(),
        api.documents.getAll(),
        api.documentRequests.getAll()
      ]);

      if (res.success) {
        setStudent(res.student);
        setProjects(res.projects || []);
        setCertifications(res.certifications || []);
        setInternships(res.internships || []);
        setMentorNotes(res.mentorNotes || []);
      }
      if (docsRes.success) {
        setDocuments(docsRes.documents || []);
        setCachedData('student_documents', docsRes.documents || []);
      }
      if (reqsRes.success) {
        setDocumentRequests(reqsRes.documentRequests || []);
        setCachedData('student_doc_requests', reqsRes.documentRequests || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      addToast(err.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.projects.create({
        title: projectForm.title,
        description: projectForm.description,
        techStack: projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
        githubUrl: projectForm.githubUrl
      });
      if (res.success) {
        setProjects([res.project, ...projects]);
        addToast('Project saved to MongoDB!');
        setShowAddProjectModal(false);
        setProjectForm({ title: '', description: '', techStack: '', githubUrl: '' });
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.projects.delete(id);
      setProjects(projects.filter(p => p._id !== id));
      addToast('Project removed');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateCert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.certifications.create(certForm);
      if (res.success) {
        setCertifications([res.certification, ...certifications]);
        addToast('Certification saved to MongoDB!');
        setShowAddCertModal(false);
        setCertForm({ name: '', issuer: '', credentialId: '', issueDate: '' });
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Bio' },
    { id: 'projects', label: `Projects & Code (${projects.length})` },
    { id: 'certifications', label: `Certifications (${certifications.length})` },
    { id: 'documents', label: `Documents Vault (${documents.length})` },
    { id: 'mentoring', label: `Mentoring Notes (${mentorNotes.length})` }
  ];

  if (loading && !student) {
    return (
      <DashboardShell>
        <TopBar title="My 360° Profile" />
        <div className="space-y-6 animate-pulse">
          {/* Hero Header Skeleton */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 h-44 flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-surface" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-brand-surface rounded-lg" />
              <div className="h-4 w-32 bg-brand-surface rounded-full" />
            </div>
          </div>
          {/* Tabs Skeleton */}
          <div className="h-11 w-full bg-brand-surface rounded-2xl" />
          {/* Content Card Skeleton */}
          <div className="bg-white rounded-3xl p-6 h-64 border border-brand-gray-light/60" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <TopBar title="My 360° Profile" />

      {/* Hero Header Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={student?.user?.avatar || currentUser?.avatar}
            alt={currentUser?.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-brand-surface shadow-md"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-dark">
                {currentUser?.name}
              </h2>
              <Badge variant="red">{student?.studentId || 'STUDENT'}</Badge>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-surface text-brand-dark">
                Semester {student?.semester || 1}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-brand-gray mt-1">
              {student?.department || currentUser?.department} • Batch {student?.batch || '2023-2027'}
            </p>

            <div className="flex items-center gap-4 mt-3 text-xs text-brand-dark/70 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-brand-gray" /> {currentUser?.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-gray" /> Campus Enrolled</span>
            </div>
          </div>
        </div>

        {/* Profile Completion Widget */}
        <div className="flex flex-col items-end gap-1.5 self-stretch md:self-auto justify-between md:justify-center p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Profile Completion</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-dark">{student?.profileCompletion || 50}%</span>
            <span className="text-xs font-semibold text-emerald-600">Active</span>
          </div>
          <div className="w-36 h-2 bg-brand-gray-light rounded-full overflow-hidden mt-1">
            <div className="h-full bg-brand-red rounded-full" style={{ width: `${student?.profileCompletion || 50}%` }} />
          </div>
        </div>
      </section>

      {/* Tab Navigation Pill Bar */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Profile Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchParams({ tab: tab.id });
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-white text-brand-gray hover:text-brand-dark border border-brand-gray-light/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial">
              <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-red" />
                Career Goal & Professional Trajectory
              </h3>
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-gray-light/40 mb-5">
                <span className="text-xs font-bold uppercase text-brand-gray block">Primary Objective</span>
                <p className="text-sm font-semibold text-brand-dark mt-1">{student?.career?.goal || 'Software Engineering & Cloud Architecture'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-brand-gray-light/60">
                  <span className="text-brand-gray block text-[11px] font-bold">Preferred Domain</span>
                  <span className="font-semibold text-brand-dark text-sm">{student?.career?.preferredDomain || 'Full-Stack Development'}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-brand-gray-light/60">
                  <span className="text-brand-gray block text-[11px] font-bold">Target Job Role</span>
                  <span className="font-semibold text-brand-dark text-sm">{student?.career?.preferredRole || 'Software Engineer'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="bg-brand-dark text-white rounded-3xl p-6 shadow-dark-float">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-peach block mb-3">
                Assigned Faculty Mentor
              </span>
              {student?.mentor ? (
                <div className="flex items-center gap-4">
                  <img
                    src={student.mentor.avatar}
                    alt={student.mentor.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20"
                  />
                  <div>
                    <h4 className="text-base font-bold text-white">{student.mentor.name}</h4>
                    <p className="text-xs text-[#ACB2BD]">{student.mentor.designation}</p>
                    <p className="text-[11px] text-brand-peach mt-1">{student.mentor.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brand-gray">No faculty mentor assigned yet. Contact your department HOD.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Projects */}
      {activeTab === 'projects' && (
        <section className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-brand-dark">Technical Projects & Architecture</h3>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-brand-dark text-white hover:bg-brand-dark-surface transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-brand-gray-light/60 space-y-3">
              <p className="text-sm font-semibold text-brand-dark">No projects recorded yet in your MongoDB profile.</p>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-brand-red text-white hover:bg-brand-red-hover"
              >
                + Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {projects.map(p => (
                <div key={p._id} className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="dark">{p.tag || 'Project'}</Badge>
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        className="text-brand-gray hover:text-brand-red p-1"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-base font-bold text-brand-dark mt-3">{p.title}</h4>
                    <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">{p.description}</p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.techStack?.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-surface text-brand-dark border border-brand-gray-light/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {p.githubUrl && (
                    <div className="pt-4 mt-6 border-t border-brand-gray-light/60 flex items-center justify-end text-xs font-semibold text-brand-dark">
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="hover:text-brand-red flex items-center gap-1">
                        Repository <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Certifications */}
      {activeTab === 'certifications' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-brand-dark">Industry Credentials & Certifications</h3>
            <button
              onClick={() => setShowAddCertModal(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-brand-dark text-white hover:bg-brand-dark-surface transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-xs text-brand-gray py-4">No certifications added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {certifications.map(c => (
                <div key={c._id} className="p-5 rounded-2xl bg-brand-surface border border-brand-gray-light/70 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-brand-gray block mb-1">{c.issuer}</span>
                    <h4 className="text-sm font-bold text-brand-dark">{c.name}</h4>
                    {c.credentialId && <p className="text-xs text-brand-dark/70 mt-1">ID: {c.credentialId}</p>}
                  </div>
                  <div className="pt-3 mt-4 border-t border-brand-gray-light/60 text-[11px] font-semibold text-brand-gray flex items-center justify-between">
                    <span>{c.issueDate || 'Verified'}</span>
                    <span className="text-emerald-600">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Mentoring Notes */}
      {activeTab === 'mentoring' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-gray-light/60 shadow-editorial space-y-4 animate-fadeIn">
          <h3 className="text-xl font-bold text-brand-dark">Faculty Mentoring Feedback & Notes</h3>
          {mentorNotes.length === 0 ? (
            <p className="text-xs text-brand-gray py-4">No mentor notes logged for your profile yet.</p>
          ) : (
            <div className="space-y-4 pt-2">
              {mentorNotes.map(n => (
                <div key={n._id} className="p-5 rounded-2xl bg-brand-surface border border-brand-gray-light/70">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-bold text-brand-dark">{n.title}</h4>
                    <span className="text-xs text-brand-gray">{n.date}</span>
                  </div>
                  <p className="text-xs text-brand-dark/70 mt-2 leading-relaxed">
                    <strong>Discussion:</strong> {n.discussion}
                  </p>
                  {n.actionRequired && (
                    <p className="text-xs text-brand-red mt-1">
                      <strong>Action Required:</strong> {n.actionRequired}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 5: Documents Vault */}
      {activeTab === 'documents' && (
        <section className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-brand-dark">Official Documents & Records</h3>
              <p className="text-xs text-brand-gray">Marks cards, certifications, resumes and verification reports</p>
            </div>
            <a
              href="/documents"
              className="px-4 py-2 rounded-full text-xs font-bold bg-brand-red text-white hover:bg-brand-red-hover transition-all flex items-center gap-1.5"
            >
              Manage & Upload in Vault →
            </a>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-brand-gray-light/60 space-y-3">
              <p className="text-sm font-semibold text-brand-dark">No documents uploaded yet in your profile vault.</p>
              <a
                href="/documents"
                className="inline-block px-5 py-2.5 rounded-full text-xs font-bold bg-brand-dark text-white hover:bg-brand-red"
              >
                Go to Document Vault
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="dark">{doc.documentType}</Badge>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        doc.reviewStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {doc.reviewStatus}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-brand-dark mt-3">{doc.displayName}</h4>
                    <p className="text-xs text-brand-gray mt-1">{doc.originalFilename}</p>
                    {doc.description && <p className="text-xs text-brand-dark/70 mt-2">{doc.description}</p>}
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-gray-light/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-brand-gray">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={api.documents.getDownloadUrl(doc._id, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-dark hover:text-brand-red flex items-center gap-1 transition-colors"
                        title="Preview in new tab"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </a>
                      <a
                        href={api.documents.getDownloadUrl(doc._id, false)}
                        className="font-bold text-brand-red hover:underline flex items-center gap-1"
                        title="Download to computer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal: Add Project */}
      <Modal isOpen={showAddProjectModal} onClose={() => setShowAddProjectModal(false)} title="Add New Project">
        <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Project Title</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g. Microservices Telemetry Engine"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Description</label>
            <textarea
              rows="3"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="System architecture, problem solved, etc..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={projectForm.techStack}
              onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
              placeholder="e.g. React, Node.js, MongoDB, Docker"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">GitHub / Code URL</label>
            <input
              type="url"
              value={projectForm.githubUrl}
              onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddProjectModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Save Project to MongoDB
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Certification */}
      <Modal isOpen={showAddCertModal} onClose={() => setShowAddCertModal(false)} title="Add Industry Certification">
        <form onSubmit={handleCreateCert} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-brand-dark block mb-1">Certification Name</label>
            <input
              type="text"
              required
              value={certForm.name}
              onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Issuing Organization</label>
            <input
              type="text"
              required
              value={certForm.issuer}
              onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
              placeholder="e.g. Amazon Web Services, Google Cloud, CNCF"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-brand-dark block mb-1">Credential ID (optional)</label>
            <input
              type="text"
              value={certForm.credentialId}
              onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
              placeholder="e.g. AWS-SAA-102934"
              className="w-full p-2.5 rounded-xl border border-brand-gray-light bg-brand-surface outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddCertModal(false)}
              className="px-4 py-2 rounded-full font-semibold bg-brand-gray-light text-brand-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full font-semibold bg-brand-red text-white"
            >
              Save Certification
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
};
