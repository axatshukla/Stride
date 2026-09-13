// ============================================================
// Team Page — Multi-Tenant Member Roster & Email Invitations
// ============================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Team.css';

const mailIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 16, height: 16 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const plusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 15, height: 15 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const copyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const trashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function Team() {
  const {
    teams,
    activeTeam,
    teamMembers,
    pendingInvitations,
    tasks,
    currentUser,
    switchTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    setCreateTeamModalOpen,
    addToast
  } = useApp();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [lastInviteResult, setLastInviteResult] = useState<{ inviteUrl?: string; simulated?: boolean; emailSent?: boolean; emailError?: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<typeof teams[0] | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  const isOwnerOrAdmin = activeTeam?.role === 'owner' || activeTeam?.role === 'admin';

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSendingInvite(true);
    setLastInviteResult(null);

    const res = await inviteMember(inviteEmail.trim(), inviteRole);
    setIsSendingInvite(false);

    if (res.success) {
      setLastInviteResult({
        inviteUrl: res.inviteUrl,
        emailSent: res.emailSent,
        emailError: res.emailError,
        simulated: res.simulated,
      });
      setInviteEmail('');
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(id);
    addToast('success', 'Invitation link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team workspace?`)) return;
    await removeMember(memberId);
  };

  const handleSwitchTeam = async (team: typeof teams[0]) => {
    if (activeTeam?.id !== team.id) {
      await switchTeam(team);
    }
  };

  const handleConfirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    setIsDeletingTeam(true);
    await deleteTeam(deletingTeam.id);
    setIsDeletingTeam(false);
    setDeletingTeam(null);
  };

  return (
    <div className="team-page">
      {/* 1. Team Workspaces Section (Card Grid) */}
      <div className="team-section">
        <div className="team-section-header-row">
          <div>
            <h1 className="team-main-title">Team Workspaces ({teams.length})</h1>
            <p className="team-main-desc">Select any team card below to enter that workspace and manage its sprint tasks.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateTeamModalOpen(true)}
          >
            {plusIcon}
            <span>Create New Team</span>
          </button>
        </div>

        <div className="workspace-cards-grid">
          {teams.map((t) => {
            const isActive = activeTeam?.id === t.id;
            return (
              <div
                key={t.id}
                className={`workspace-card-item ${isActive ? 'is-active' : ''}`}
                onClick={() => handleSwitchTeam(t)}
                role="button"
                tabIndex={0}
              >
                <div className="workspace-card-top">
                  <div className="workspace-card-icon">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="workspace-card-details">
                    <span className="workspace-card-title">{t.name}</span>
                    <div className="workspace-card-tags">
                      <span className={`workspace-card-role-badge role-${t.role || 'member'}`}>
                        {t.role || 'Member'}
                      </span>
                      <span className="workspace-card-count">
                        {t.member_count || 1} {t.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                  {t.role === 'owner' && (
                    <button
                      type="button"
                      className="workspace-card-trash-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingTeam(t);
                      }}
                      title={`Delete workspace "${t.name}"`}
                      aria-label={`Delete ${t.name}`}
                    >
                      {trashIcon}
                    </button>
                  )}
                </div>

                <div className="workspace-card-bottom">
                  {isActive ? (
                    <div className="workspace-card-active-pill">
                      {checkIcon}
                      <span>Active Workspace</span>
                    </div>
                  ) : (
                    <div className="workspace-card-enter-btn">
                      <span>Enter Workspace &rarr;</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create Team Card */}
          <div
            className="workspace-card-item workspace-create-card-item"
            onClick={() => setCreateTeamModalOpen(true)}
            role="button"
            tabIndex={0}
          >
            <div className="workspace-create-inner">
              <div className="workspace-create-icon">{plusIcon}</div>
              <span className="workspace-create-title">Create New Team</span>
              <span className="workspace-create-desc">Set up a dedicated workspace for a new project</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Workspace Members Roster */}
      <div className="team-section" style={{ marginTop: 12 }}>
        <div className="team-header">
          <div className="team-header-details">
            <div className="team-title-row">
              <h2>{activeTeam?.name || 'Workspace'} Members ({teamMembers.length})</h2>
              {activeTeam?.role && (
                <span className={`team-role-pill role-${activeTeam.role}`}>
                  Your Role: {activeTeam.role}
                </span>
              )}
            </div>
            <p>Collaborators and real-time deliverable metrics for {activeTeam?.name}.</p>
          </div>

          <div className="team-header-actions">
            {activeTeam?.role === 'owner' && (
              <button
                type="button"
                className="btn btn-secondary btn-danger-action"
                onClick={() => setDeletingTeam(activeTeam)}
                title="Delete this workspace"
              >
                {trashIcon}
                <span>Delete Workspace</span>
              </button>
            )}
            {isOwnerOrAdmin && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setLastInviteResult(null);
                  setIsInviteModalOpen(true);
                }}
              >
                {mailIcon}
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </div>

        <div className="team-grid">
          {teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assignee?.id === member.id);
            const activeTasks = memberTasks.filter(t => t.status === 'in-progress').length;
            const completedTasks = memberTasks.filter(t => t.status === 'done').length;
            const isCurrentUser = member.id === currentUser?.id;
            const canRemove = isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner';

            return (
              <div key={member.id} className="team-card">
                <div className="team-card-top">
                  <div className="team-avatar-lg" style={{ background: member.color || 'var(--accent)' }}>
                    {member.initials}
                  </div>
                  <div className="team-card-info">
                    <div className="team-card-name-row">
                      <span className="team-card-name">{member.name}</span>
                      {isCurrentUser && <span className="team-you-tag">You</span>}
                    </div>
                    <span className={`team-card-member-role role-${member.role || 'member'}`}>
                      {member.role || 'Member'}
                    </span>
                  </div>

                  {canRemove && (
                    <button
                      type="button"
                      className="team-member-remove-btn"
                      onClick={() => handleRemoveMember(member.id, member.name || 'this member')}
                      title="Remove member from workspace"
                    >
                      {trashIcon}
                    </button>
                  )}
                </div>

                <div className="team-card-email">{member.email}</div>

                <div className="team-card-metrics">
                  <div className="team-card-stat">
                    <span className="team-card-stat-val">{memberTasks.length}</span>
                    <span className="team-card-stat-lbl">Assigned</span>
                  </div>
                  <div className="team-card-stat">
                    <span className="team-card-stat-val" style={{ color: 'var(--status-progress)' }}>{activeTasks}</span>
                    <span className="team-card-stat-lbl">In Progress</span>
                  </div>
                  <div className="team-card-stat">
                    <span className="team-card-stat-val" style={{ color: 'var(--status-done)' }}>{completedTasks}</span>
                    <span className="team-card-stat-lbl">Completed</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="team-section">
          <div className="team-section-header">
            <h2>Pending Invitations ({pendingInvitations.length})</h2>
            <span className="team-section-sub">Awaiting registration or invite link acceptance.</span>
          </div>

          <div className="pending-invitations-list">
            {pendingInvitations.map((invite) => {
              const fullInviteUrl = `${window.location.origin}/join?token=${invite.token}`;
              const isCopied = copiedToken === invite.id;

              return (
                <div key={invite.id} className="pending-invite-row">
                  <div className="pending-invite-left">
                    <div className="pending-invite-icon">{mailIcon}</div>
                    <div className="pending-invite-info">
                      <span className="pending-invite-email">{invite.email}</span>
                      <span className="pending-invite-meta">
                        Role: <strong>{invite.role}</strong> &bull; Sent {new Date(invite.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pending-invite-actions">
                    <span className="pending-invite-badge">Pending Delivery / Accept</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopyLink(fullInviteUrl, invite.id)}
                    >
                      {isCopied ? checkIcon : copyIcon}
                      <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div className="modal-card invite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="workspace-modal-header">
              <div className="workspace-modal-header-left">
                <div className="workspace-modal-icon-badge">{mailIcon}</div>
                <div className="workspace-modal-title-group">
                  <h2 className="workspace-modal-title">Invite Team Member</h2>
                  <p className="workspace-modal-subtitle">
                    Send a collaboration invitation to join <strong>{activeTeam?.name}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="workspace-modal-close-btn"
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {lastInviteResult ? (
              <div className="invite-success-box">
                {lastInviteResult.emailSent !== false ? (
                  <div className="invite-success-badge">
                    {checkIcon}
                    <span>Invitation Email Dispatched!</span>
                  </div>
                ) : (
                  <div className="invite-warning-badge" style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠️ Email Provider Notice</span>
                  </div>
                )}

                {lastInviteResult.emailError ? (
                  <div style={{ background: '#FFFDF5', border: '1px solid #FEF08A', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', color: '#854D0E', lineHeight: 1.5 }}>
                    <strong>Resend Sandbox Notice:</strong> {lastInviteResult.emailError}
                  </div>
                ) : (
                  <p className="invite-success-text">
                    An email with join instructions has been sent. You can also share the direct link below:
                  </p>
                )}
                {lastInviteResult.inviteUrl && (
                  <div className="invite-link-preview">
                    <input
                      type="text"
                      className="form-input invite-link-input"
                      readOnly
                      value={lastInviteResult.inviteUrl}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleCopyLink(lastInviteResult.inviteUrl!, 'modal-link')}
                    >
                      {copiedToken === 'modal-link' ? checkIcon : copyIcon}
                      <span>{copiedToken === 'modal-link' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setLastInviteResult(null);
                      setIsInviteModalOpen(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="invite-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="inviteEmailInput">Collaborator's Email Address</label>
                  <input
                    id="inviteEmailInput"
                    type="email"
                    className="form-input"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inviteRoleSelect">Workspace Role</label>
                  <select
                    id="inviteRoleSelect"
                    className="form-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Member — Can create, edit and complete tasks</option>
                    <option value="admin">Admin — Can invite collaborators and manage team settings</option>
                  </select>
                </div>

                <div className="invite-template-preview-info">
                  <div className="invite-template-icon">&#9993;</div>
                  <div className="invite-template-text">
                    <strong>Production Email Delivery:</strong> Recipient will receive an official branded invitation email with an instant 1-click access token.
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSendingInvite || !inviteEmail.trim()}
                  >
                    {isSendingInvite ? 'Sending Email...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Workspace Confirmation Modal */}
      {deletingTeam && (
        <div className="modal-overlay" onClick={() => !isDeletingTeam && setDeletingTeam(null)}>
          <div className="modal-card delete-workspace-modal" onClick={(e) => e.stopPropagation()}>
            <div className="workspace-modal-header">
              <div className="workspace-modal-header-left">
                <div className="workspace-modal-icon-badge badge-danger">
                  {trashIcon}
                </div>
                <div className="workspace-modal-title-group">
                  <h2 className="workspace-modal-title">Delete Workspace</h2>
                  <p className="workspace-modal-subtitle">Permanent action. Please review before proceeding.</p>
                </div>
              </div>
              <button
                type="button"
                className="workspace-modal-close-btn"
                onClick={() => !isDeletingTeam && setDeletingTeam(null)}
                aria-label="Close"
                disabled={isDeletingTeam}
              >
                ✕
              </button>
            </div>

            <div className="delete-modal-body">
              <p className="delete-modal-warning-text">
                Are you sure you want to permanently delete workspace <strong>"{deletingTeam.name}"</strong>?
              </p>
              <div className="delete-modal-warning-box">
                <strong>⚠️ Warning:</strong>
                <ul>
                  <li>All sprint tasks in this workspace will be deleted.</li>
                  <li>All member assignments and invitations will be revoked.</li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>
            </div>

            <div className="create-team-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingTeam(null)}
                disabled={isDeletingTeam}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDeleteTeam}
                disabled={isDeletingTeam}
              >
                {isDeletingTeam ? 'Deleting Workspace...' : 'Yes, Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

