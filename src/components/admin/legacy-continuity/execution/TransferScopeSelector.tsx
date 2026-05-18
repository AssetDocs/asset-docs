// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SCOPE_LABEL, SCOPE_DESCRIPTION, type TransferScope } from './executionConstants';

const SCOPES: TransferScope[] = ['temporary', 'transfer', 'archive'];

const TransferScopeSelector: React.FC<{ value: TransferScope | null; onChange: (v: TransferScope) => void; readOnly?: boolean }> = ({ value, onChange, readOnly }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Transfer Scope Selection</CardTitle>
    </CardHeader>
    <CardContent>
      <RadioGroup value={value || ''} onValueChange={(v) => onChange(v as TransferScope)} disabled={readOnly} className="space-y-3">
        {SCOPES.map((s) => (
          <Label key={s} htmlFor={`scope-${s}`} className={`flex gap-3 p-3 border rounded-md cursor-pointer ${value === s ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value={s} id={`scope-${s}`} className="mt-1" />
            <div>
              <div className="font-medium text-sm">{SCOPE_LABEL[s]}</div>
              <div className="text-xs text-muted-foreground mt-1">{SCOPE_DESCRIPTION[s]}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
);

export default TransferScopeSelector;
