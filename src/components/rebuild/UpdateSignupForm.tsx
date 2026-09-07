import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

// Client-side validation is UX only. The Edge Function performs the
// authoritative server-side validation and sets the source identifier itself.
const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Please enter your email address.' })
  .max(254, { message: 'Please enter a valid email address.' })
  .email({ message: 'Please enter a valid email address.' });

const UpdateSignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setStatus('submitting');
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'rebuild-update-signup',
        { body: { email: parsed.data } },
      );

      if (fnError || !data?.ok) {
        setError(
          data?.error ??
            "We couldn't save your request. Please try again.",
        );
        setStatus('idle');
        return;
      }

      setStatus('done');
    } catch {
      setError("We couldn't save your request. Please try again.");
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div
        role="status"
        className="rounded-lg border border-brand-blue/25 bg-brand-blue/5 px-6 py-8 text-center"
      >
        <p className="text-lg font-medium text-brand-blue">
          You're on the list.
        </p>
        <p className="mt-2 text-base text-gray-600">
          We'll keep you informed as Asset Safe moves forward.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="update-email" className="sr-only">
          Email address
        </label>
        <Input
          id="update-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          maxLength={254}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'update-email-error' : undefined}
          className="h-12 flex-1 bg-white text-base"
        />
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="h-12 whitespace-nowrap bg-brand-orange px-6 text-base font-semibold text-white hover:bg-brand-orange/90 sm:w-auto"
        >
          {status === 'submitting' ? 'Adding you…' : 'Keep Me Updated'}
        </Button>
      </div>

      {error && (
        <p
          id="update-email-error"
          role="alert"
          className="mt-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Occasional updates only. No spam. Unsubscribe anytime.
      </p>
    </form>
  );
};

export default UpdateSignupForm;
