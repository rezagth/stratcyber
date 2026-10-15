'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const SEVERITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'];
const STATUSES = ['Ouverte', 'Atténuée', 'Corrigée'];

type Vulnerability = {
  id: string; title: string; description: string | null; severity: string; cvssScore: number | null;
  status: string; discoveredAt: string;
};

export function VulnerabilitiesTab({ organizationId }: { organizationId: string }) {
  const [vulns, setVulns] = useState<Vulnerability[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newVuln, setNewVuln] = useState({ title: '', severity: 'Moyenne', cvssScore: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/vulnerabilities`).then((r) => r.json()).then(setVulns);
  };
  useEffect(load, [organizationId]);

  async function addVuln() {
    const res = await fetch(`/api/organizations/${organizationId}/vulnerabilities`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newVuln.title, severity: newVuln.severity, cvssScore: newVuln.cvssScore ? Number(newVuln.cvssScore) : undefined }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewVuln({ title: '', severity: 'Moyenne', cvssScore: '' });
    load();
  }

  async function updateVuln(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/vulnerabilities/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteVuln(id: string) {
    await fetch(`/api/vulnerabilities/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}
      <ul className="space-y-3">
        {vulns?.map((vuln) => (
          <li key={vuln.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{vuln.title}</CardTitle>
                    <Badge variant={vuln.severity === 'Critique' || vuln.severity === 'Haute' ? 'destructive' : 'secondary'}>{vuln.severity}</Badge>
                    {vuln.cvssScore != null && <span className="text-xs text-muted-foreground">CVSS {vuln.cvssScore}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteVuln(vuln.id)}>Supprimer</Button>
                </div>
                <p className="text-xs text-muted-foreground">Découverte le {new Date(vuln.discoveredAt).toLocaleDateString('fr-FR')}</p>
              </CardHeader>
              <CardContent>
                <Label htmlFor={`vuln-status-${vuln.id}`}>Statut</Label>
                <Select value={vuln.status} onValueChange={(status) => updateVuln(vuln.id, { status })}>
                  <SelectTrigger id={`vuln-status-${vuln.id}`} className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          </li>
        ))}
        {vulns?.length === 0 && <p className="text-sm text-muted-foreground">Aucune vulnérabilité pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Déclarer une vulnérabilité</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="new-vuln-title">Titre</Label>
            <Input id="new-vuln-title" value={newVuln.title} onChange={(e) => setNewVuln((v) => ({ ...v, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="new-vuln-severity">Sévérité</Label>
            <Select value={newVuln.severity} onValueChange={(severity) => setNewVuln((v) => ({ ...v, severity }))}>
              <SelectTrigger id="new-vuln-severity"><SelectValue /></SelectTrigger>
              <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-vuln-cvss">Score CVSS (0-10)</Label>
            <Input id="new-vuln-cvss" type="number" min={0} max={10} step={0.1} value={newVuln.cvssScore}
              onChange={(e) => setNewVuln((v) => ({ ...v, cvssScore: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={addVuln} disabled={!newVuln.title.trim()}>Ajouter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
