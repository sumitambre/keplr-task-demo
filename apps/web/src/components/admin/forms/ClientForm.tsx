import React from 'react';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Trash2 } from 'lucide-react';

export type Site = {
  id?: number;
  name: string;
  contactNumber?: string;
  address?: string;
  googleMapsLink?: string;
  siteContactPerson?: string;
  siteContactPosition?: string;
};

export type Client = {
  id?: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  sites: Site[];
};

export default function ClientForm({
  value,
  onChange,
  onSave,
  onCancel,
  submitLabel = 'Save'
}: {
  value: Client;
  onChange: (next: Client) => void;
  onSave: () => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const update = (patch: Partial<Client>) => onChange({ ...value, ...patch });

  const updateSite = (index: number, patch: Partial<Site>) => {
    const sites = value.sites.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange({ ...value, sites });
  };

  const addSite = () => onChange({ ...value, sites: [...value.sites, { name: '' }] });
  const removeSite = (i: number) => onChange({ ...value, sites: value.sites.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input id="name" name="name" value={value.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Main Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" value={value.contactPerson || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ contactPerson: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Main Phone</Label>
              <Input id="phone" name="phone" value={value.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ phone: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between p-4">
          <CardTitle className="text-lg">Sites</CardTitle>
          <Button type="button" size="sm" onClick={addSite}>Add Site</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.sites.map((site, index) => (
            <Card key={site.id ?? index}>
              <CardHeader className="flex items-center justify-between py-3 px-4">
                <CardTitle className="text-base">Site #{index + 1}</CardTitle>
                {value.sites.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSite(index)} aria-label={`Remove site ${index + 1}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Site Name</Label>
                  <Input value={site.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { name: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Site Contact Person</Label>
                  <Input value={site.siteContactPerson || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { siteContactPerson: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={site.siteContactPosition || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { siteContactPosition: e.target.value })} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Number</Label>
                  <Input value={site.contactNumber || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { contactNumber: e.target.value })} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Site Address</Label>
                  <Input value={site.address || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { address: e.target.value })} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Google Maps Link</Label>
                  <Input value={site.googleMapsLink || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSite(index, { googleMapsLink: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>{submitLabel}</Button>
      </div>
    </div>
  );
}
