// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldOff } from 'lucide-react';

/**
 * DEPRECATED — Ownership transfer has been retired.
 *
 * Under the Continuity & Preservation framework, Asset Safe no longer offers
 * ownership transfer, inheritance, succession, or estate adjudication. Use
 * Temporary Stewardship, Archive Custodian Access, Memorialization,
 * Preservation Mode, Approved Closure, or Authorized Export instead.
 *
 * This component is retained only to keep historical references intact and
 * renders a clear notice if it is ever surfaced.
 */
const OwnershipTransferForm: React.FC<any> = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <ShieldOff className="h-4 w-4 text-muted-foreground" />
        Ownership Transfer — Retired
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertDescription className="text-sm">
          Ownership transfer is no longer available. Asset Safe focuses on emergency
          access, stewardship, and preservation. Choose Memorialization, Preservation
          Mode, Archive Custodian Access, Temporary Stewardship, Authorized Export, or
          Approved Closure from the Continuity Action selector instead.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);

export default OwnershipTransferForm;
