'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // Check terms
    const acceptedTerms = formData.get('terms');
    if (!acceptedTerms) {
      setError('You must accept the terms entirely before proceeding.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to register');
      }

      window.location.href = body.redirectTo || '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-lg justify-center gap-2 mx-auto my-12">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-sm flex items-center group text-primary hover:bg-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Back
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center text-slate-800" onSubmit={signUp}>
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-serif text-primary font-semibold">Join the Guild</h1>
          <p className="text-sm text-slate-500">Create your account to start hiring or finding jobs.</p>
        </div>

        {error && (
          <p className="mb-6 p-4 bg-red-100 text-red-600 text-sm text-center border-l-4 border-red-500">
            {error}
          </p>
        )}

        <div className="mb-6">
          <label className="text-sm font-semibold mb-3 block">I am joining as a:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('job_seeker')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                role === 'job_seeker' 
                  ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <h3 className="font-bold text-primary">Job Seeker</h3>
              <p className="text-xs text-slate-500 mt-1">I want to browse and apply for jobs.</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                role === 'employer' 
                  ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <h3 className="font-bold text-primary">Employer</h3>
              <p className="text-xs text-slate-500 mt-1">I want to post jobs and hire talent.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="firstName">First Name</label>
            <input
              className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              name="firstName"
              type="text"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="lastName">Last Name</label>
            <input
              className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              name="lastName"
              type="text"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-semibold" htmlFor="email">Email</label>
          <input
            className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold" htmlFor="password">Password</label>
          <input
            className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="mb-8 flex items-start">
          <input type="checkbox" id="terms" name="terms" className="mt-1 w-4 h-4 text-primary rounded ring-accent focus:ring-accent" required />
          <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
            I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </label>
        </div>

        <button 
          disabled={loading}
          className="bg-primary hover:bg-primary-light disabled:bg-slate-400 text-white rounded-md px-4 py-3 font-medium w-full transition-colors flex justify-center items-center"
        >
          {loading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : 'Create Account'}
        </button>
        
        <p className="text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
