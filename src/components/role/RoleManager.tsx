import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const RoleManager: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'client'>('agent');
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingRoles, setExistingRoles] = useState<Array<{ role: string; is_active: boolean }>>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; email: string; full_name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<number | null>(null);

  const findUserByEmail = async (email: string) => {
    const { data, error } = await supabase.from('profiles').select('id,email,full_name').eq('email', email).limit(1).single();
    if (error) throw error;
    return data;
  };

  const searchProfiles = async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name')
        .ilike('email', `%${q}%`)
        .limit(8)
        .order('email');
      if (error) throw error;
      setSuggestions(data || []);
    } catch (err) {
      console.error('Profile search error', err);
    } finally {
      setSearching(false);
    }
  };

  const fetchRolesForUser = async (userId: string) => {
    const { data, error } = await supabase.from('user_roles').select('role,is_active').eq('user_id', userId);
    if (error) throw error;
    setExistingRoles(data || []);
  };

  const handleAssign = async () => {
    if (!email) return toast.error('Enter an email');
    setLoading(true);
    try {
      const target = await findUserByEmail(email);
      if (!target) {
        toast.error('No user found with that email');
        return;
      }

      const { error } = await supabase.from('user_roles').upsert({
        user_id: target.id,
        role: role as 'admin' | 'agent' | 'client',
        is_active: true,
        created_by: authUser?.id || null
      }, { onConflict: 'user_id,role' });

      if (error) throw error;
  toast.success(`Assigned ${role} to ${email}`);
  setEmail('');
  await fetchRolesForUser(target.id);
  onClose?.();
    } catch (err: any) {
      console.error('Role assign error', err);
      toast.error(err.message || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (roleName: 'admin' | 'agent' | 'client', makeActive: boolean) => {
    if (!email) return toast.error('Enter an email first');
    setLoading(true);
    try {

      const target = await findUserByEmail(email);
      if (!target) return toast.error('User not found');

      const { error } = await supabase.from('user_roles').upsert({
        user_id: target.id,
        role: roleName as 'admin' | 'agent' | 'client',
        is_active: makeActive,
        created_by: authUser?.id || null
      }, { onConflict: 'user_id,role' });

      if (error) throw error;
  toast.success(`${makeActive ? 'Activated' : 'Revoked'} ${roleName}`);
  await fetchRolesForUser(target.id);
    } catch (err: any) {
      console.error('Toggle role error', err);
      toast.error(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Email</Label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                // debounced search
                if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
                searchTimeout.current = window.setTimeout(() => searchProfiles(v), 250);
              }}
              placeholder="user@example.com"
              aria-autocomplete="list"
            />
            <Button onClick={async () => {
              if (!email) return toast.error('Enter an email');
              try {
                const target = await findUserByEmail(email);
                if (!target) return toast.error('No user found');
                await fetchRolesForUser(target.id);
                setSuggestions([]);
              } catch (err: any) {
                console.error(err);
                toast.error('Failed to load roles');
              }
            }}>Load roles</Button>
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border rounded shadow max-h-48 overflow-auto">
              {suggestions.map((s) => (
                <li key={s.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer" onClick={async () => {
                  setEmail(s.email);
                  setSuggestions([]);
                  try { await fetchRolesForUser(s.id); } catch (e) { console.error(e); }
                }}>
                  <div className="font-medium">{s.email}</div>
                  {s.full_name && <div className="text-sm text-muted-foreground">{s.full_name}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <Label>Role</Label>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded ${role==='admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setRole('admin')}>Admin</button>
          <button className={`px-3 py-1 rounded ${role==='agent' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setRole('agent')}>Agent</button>
          <button className={`px-3 py-1 rounded ${role==='client' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setRole('client')}>Client</button>
        </div>
      </div>

      <div>
        {existingRoles.length > 0 && (
          <div className="space-y-2">
            <Label>Existing Roles</Label>
            <div className="space-y-1">
              {existingRoles.map((r) => (
                <div key={r.role} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{r.role}</div>
                    <div className="text-sm text-muted-foreground">{r.is_active ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleToggleRole(r.role as 'admin' | 'agent' | 'client', true)} disabled={loading || !!r.is_active}>Activate</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleRole(r.role as 'admin' | 'agent' | 'client', false)} disabled={loading || !r.is_active}>Revoke</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <Button onClick={handleAssign} disabled={loading}>{loading ? 'Saving...' : 'Assign Role'}</Button>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
