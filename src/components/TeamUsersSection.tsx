'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2, UserPlus, Users } from 'lucide-react';
import { usersApi, UserProfile } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ui/ConfirmModal';
import { FormModal } from './ui/FormModal';
import { Spinner, TeamSectionSkeleton } from './ui/loading';

type Toast = { kind: 'success' | 'error'; message: string } | null;

function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-lg border py-2 pl-3 pr-10 text-sm focus:outline-none"
        style={{ borderColor: '#E7E5E4', backgroundColor: '#FFFFFF', color: '#1C1917' }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 hover:opacity-70"
        style={{ color: '#A8A29E' }}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

interface TeamUsersSectionProps {
  onToast?: (feedback: Toast) => void;
}

export const TeamUsersSection: React.FC<TeamUsersSectionProps> = ({ onToast }) => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<UserProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const canDeleteUsers = Boolean(me?.isProtected);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.listUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load team.';
      onToast?.({ kind: 'error', message });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const activeCount = users.filter((u) => u.isActive).length;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
  };

  const openAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAdd = () => {
    if (creating) return;
    setShowAddModal(false);
    resetForm();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();
    if (!nextName) {
      setFormError('Name is required.');
      return;
    }
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setFormError('Enter a valid email.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Password needs 8+ characters with a letter and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Password and confirmation do not match.');
      return;
    }

    setCreating(true);
    setFormError(null);
    try {
      const res = await usersApi.createUser({
        name: nextName,
        email: nextEmail,
        password,
        confirmPassword,
      });
      if (res.data) {
        setUsers((prev) =>
          [...prev, res.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        );
      } else {
        await loadUsers();
      }
      setShowAddModal(false);
      resetForm();
      onToast?.({
        kind: 'success',
        message: `Added ${nextName}. Share the temporary password securely.`,
      });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not create user.');
    } finally {
      setCreating(false);
    }
  };

  const applyToggle = async () => {
    if (!confirmToggle) return;
    const target = confirmToggle;
    const nextActive = !target.isActive;
    setTogglingId(target.id);
    try {
      const res = await usersApi.setUserActive(target.id, nextActive);
      if (res.data) {
        setUsers((prev) => prev.map((u) => (u.id === target.id ? res.data : u)));
      }
      setConfirmToggle(null);
      onToast?.({
        kind: 'success',
        message: nextActive
          ? `${target.name} reactivated.`
          : `${target.name} deactivated.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update user.';
      onToast?.({ kind: 'error', message });
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setTogglingId(null);
    }
  };

  const applyDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setDeletingId(target.id);
    try {
      await usersApi.deleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setConfirmDelete(null);
      onToast?.({
        kind: 'success',
        message: `${target.name} permanently deleted.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not delete user.';
      onToast?.({ kind: 'error', message });
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {loading ? (
        <TeamSectionSkeleton />
      ) : (
      <section
        className="overflow-hidden rounded-2xl border"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <div
          className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: '#F5F5F4', backgroundColor: '#FAFAF9' }}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: '#78716C' }} />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
                Team
              </h3>
              <p className="text-xs" style={{ color: '#A8A29E' }}>
                Admin accounts only · {activeCount} active
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white cursor-pointer sm:self-auto"
            style={{ backgroundColor: '#E02126' }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add admin
          </button>
        </div>

        <div className="px-5 py-4">
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#F5F5F4' }}>
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr
                    className="border-b text-xs"
                    style={{ borderColor: '#F5F5F4', color: '#A8A29E' }}
                  >
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isMe = u.id === me?.id;
                    const isProtected = Boolean(u.isProtected);
                    const busy = togglingId === u.id || deletingId === u.id;
                    const canToggle = !isMe && !isProtected;
                    const canDelete = canDeleteUsers && !isMe && !isProtected;
                    return (
                      <tr
                        key={u.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: '#F5F5F4' }}
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-medium" style={{ color: '#1C1917' }}>
                            {u.name}
                            {isMe ? (
                              <span className="ml-1.5 text-[11px]" style={{ color: '#A8A29E' }}>
                                you
                              </span>
                            ) : null}
                            {isProtected ? (
                              <span
                                className="ml-1.5 inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
                                style={{
                                  color: '#57534E',
                                  backgroundColor: '#F5F5F4',
                                  borderColor: '#E7E5E4',
                                }}
                              >
                                Protected
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm" style={{ color: '#78716C' }}>
                            {u.email}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                            style={
                              u.isActive
                                ? {
                                    color: '#15803D',
                                    backgroundColor: '#DCFCE7',
                                    borderColor: '#BBF7D0',
                                  }
                                : {
                                    color: '#78716C',
                                    backgroundColor: '#F5F5F4',
                                    borderColor: '#E7E5E4',
                                  }
                            }
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {isProtected && !canDelete ? (
                            <span className="text-[11px]" style={{ color: '#A8A29E' }}>
                              —
                            </span>
                          ) : (
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {!isProtected ? (
                                <button
                                  type="button"
                                  disabled={busy || !canToggle}
                                  onClick={() => setConfirmToggle(u)}
                                  title={
                                    isMe
                                      ? 'You cannot deactivate your own account'
                                      : u.isActive
                                        ? 'Deactivate'
                                        : 'Reactivate'
                                  }
                                  className="rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                  style={{
                                    borderColor: '#E7E5E4',
                                    color: u.isActive ? '#B91C1C' : '#15803D',
                                    backgroundColor: '#FFFFFF',
                                  }}
                                >
                                  {togglingId === u.id
                                    ? '…'
                                    : u.isActive
                                      ? 'Deactivate'
                                      : 'Reactivate'}
                                </button>
                              ) : null}
                              {canDelete ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setConfirmDelete(u)}
                                  title="Permanently delete"
                                  aria-label={`Delete ${u.name}`}
                                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                  style={{
                                    borderColor: '#FECACA',
                                    color: '#B91C1C',
                                    backgroundColor: '#FEF2F2',
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {deletingId === u.id ? '…' : 'Delete'}
                                </button>
                              ) : null}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      </section>
      )}

      <FormModal
        isOpen={showAddModal}
        onClose={closeAdd}
        title="Add admin"
        description="Creates an ADMIN account. Share the temporary password securely."
        busy={creating}
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          {formError ? (
            <p className="text-xs" style={{ color: '#B91C1C' }} role="alert">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 sm:col-span-1">
              <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#E7E5E4', backgroundColor: '#FFFFFF', color: '#1C1917' }}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: '#E7E5E4', backgroundColor: '#FFFFFF', color: '#1C1917' }}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
                Temporary password
              </span>
              <PasswordField
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-medium" style={{ color: '#A8A29E' }}>
                Confirm password
              </span>
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeAdd}
              disabled={creating}
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-40"
              style={{ color: '#78716C' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                creating || !name.trim() || !email.trim() || !password || !confirmPassword
              }
              className="inline-flex min-w-[6.5rem] items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: '#E02126' }}
            >
              {creating ? (
                <>
                  <Spinner size="xs" color="#FFFFFF" />
                  Creating…
                </>
              ) : (
                'Create admin'
              )}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        isOpen={!!confirmToggle}
        onClose={() => {
          if (!togglingId) setConfirmToggle(null);
        }}
        onConfirm={applyToggle}
        title={confirmToggle?.isActive ? 'Deactivate admin?' : 'Reactivate admin?'}
        message={
          confirmToggle?.isActive
            ? `${confirmToggle.name} will not be able to sign in until reactivated.`
            : `${confirmToggle?.name || 'This admin'} will be able to sign in again.`
        }
        confirmText={confirmToggle?.isActive ? 'Deactivate' : 'Reactivate'}
        variant={confirmToggle?.isActive ? 'danger' : 'info'}
      />

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => {
          if (!deletingId) setConfirmDelete(null);
        }}
        onConfirm={applyDelete}
        title="Delete admin permanently?"
        message={
          confirmDelete
            ? `${confirmDelete.name} (${confirmDelete.email}) will be permanently removed. This cannot be undone.`
            : 'This admin will be permanently removed. This cannot be undone.'
        }
        confirmText="Delete permanently"
        variant="danger"
      />
    </>
  );
};
