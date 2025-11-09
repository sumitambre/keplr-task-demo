import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import { mockTaskTypes } from '../../database/mockData';

export function TaskTypes() {
  const [types] = useState(mockTaskTypes);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Required Skill</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.skillRequired}</TableCell>
                  <TableCell>
                    <Badge variant={t.active ? 'default' : 'secondary'}>
                      {t.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
