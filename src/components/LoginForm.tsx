'use client';

import Image from 'next/image';
import logo from '../../public/logo.svg';
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import BouncingDots from '@/components/BouncingDots';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// For reCAPTCHA on window object
// This is a workaround to avoid TypeScript errors when using reCAPTCHA in the browser
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  // Setup reCAPTCHA verifier
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('reCAPTCHA expired, please try sending OTP again.');
          window.recaptchaVerifier?.clear();
          window.recaptchaVerifier = undefined;
          setIsOTPSent(false);
          setLoading(false);
        }
      });
      window.recaptchaVerifier.render().catch(() => {});
    }
    return window.recaptchaVerifier;
  };

  useEffect(() => {
    setupRecaptcha();
    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (phoneError) setPhoneError('');
      if (error) setError('');
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    if (phoneNumber.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const checkResponse = await fetch(`${API_URL}/admin/allowed-users/${encodeURIComponent(formattedPhoneNumber)}/check`);
      if (!checkResponse.ok) {
        const errorData = await checkResponse.json().catch(() => ({}));
        throw new Error(errorData?.error || `Server error: ${checkResponse.status}`);
      }
      const checkData = await checkResponse.json();
      localStorage.setItem('token', checkData.data.token);

      if (!checkData.success || !checkData.data?.exists) {
        throw new Error('This phone number is not authorized for login.');
      }

      const appVerifier = setupRecaptcha();
      if (!appVerifier) throw new Error("reCAPTCHA not ready. Please wait or refresh.");

      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      confirmationResultRef.current = confirmation;
      setIsOTPSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      if (errorMessage.includes('auth/too-many-requests')) {
        setError('Too many requests. Please try again later.');
      } else if (errorMessage.includes('auth/invalid-phone-number')) {
        setError('Invalid phone number format.');
      } else {
        setError(errorMessage);
      }
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (verificationCode.length !== 6) {
    setError('Please enter the complete 6-digit OTP.');
    return;
  }
  if (!confirmationResultRef.current) {
    setError('Verification session expired or invalid. Please try sending OTP again.');
    setIsOTPSent(false);
    return;
  }

  setLoading(true);
  try {
    // Keep this part to verify OTP with Firebase
    const credential = await confirmationResultRef.current.confirm(verificationCode);
    if (credential?.user) {
      // Get Firebase ID token and set it in cookies for middleware
      const token = await credential.user.getIdToken();
      document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=86400;`;

      window.location.href = '/dashboard';
    } else {
      throw new Error('Could not verify OTP.');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
    if (errorMessage.includes('auth/invalid-verification-code') || errorMessage.includes('auth/code-expired')) {
      setError('Invalid or expired OTP. Please check the code or request a new one.');
      setVerificationCode('');
    } else if (errorMessage.includes('auth/session-expired')) {
      setError('Verification session expired. Please request a new OTP.');
      setIsOTPSent(false);
      setVerificationCode('');
    } else {
      setError(errorMessage);
    }
    setLoading(false);
  }
};

  const handleOTPChange = (value: string) => {
    setVerificationCode(value);
    if (error) setError('');
  };

  return (
    <div className="w-full max-w-xs rounded-2xl p-6 shadow-xl">
      {/* Logo and Header */}
      <div className="flex flex-col items-center mb-5">
        <div className="mb-3 flex items-center justify-center">
           <div className="flex justify-start items-center gap-2">
                    <Image src={logo} alt="Logo" width={40} height={40} />
                    <div className="w-32 h-8 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="125" height="32" viewBox="0 0 125 32" fill="none">
                            <path d="M89.9497 19.9739H94.4677V20.9999H88.6897V8.4179H89.9497V19.9739Z" fill="#ED4C41" />
                            <path d="M98.4259 8.4179V20.9999H97.1659V8.4179H98.4259Z" fill="#ED4C41" />
                            <path
                                d="M112.151 8.4179L107.381 20.9999H105.941L101.171 8.4179H102.539L106.661 19.6319L110.819 8.4179H112.151Z"
                                fill="#ED4C41"
                            />
                            <path
                                d="M116.204 9.4439V14.1419H120.974V15.1859H116.204V19.9559H121.514V20.9999H114.944V8.3999H121.514V9.4439H116.204Z"
                                fill="#ED4C41"
                            />
                            <path
                                d="M2.72607 14.9058C2.72607 13.6444 2.98274 12.5444 3.49607 11.6058C4.00941 10.6524 4.72074 9.9191 5.63007 9.40577C6.53941 8.87777 7.58074 8.61377 8.75407 8.61377C10.2647 8.61377 11.5114 8.9951 12.4941 9.75777C13.4914 10.5058 14.1587 11.5618 14.4961 12.9258H11.1741C10.9981 12.3978 10.6974 11.9871 10.2721 11.6938C9.86141 11.3858 9.34807 11.2318 8.73207 11.2318C7.85207 11.2318 7.15541 11.5544 6.64207 12.1998C6.12874 12.8304 5.87207 13.7324 5.87207 14.9058C5.87207 16.0644 6.12874 16.9664 6.64207 17.6118C7.15541 18.2424 7.85207 18.5578 8.73207 18.5578C9.97874 18.5578 10.7927 18.0004 11.1741 16.8858H14.4961C14.1587 18.2058 13.4914 19.2544 12.4941 20.0318C11.4967 20.8091 10.2501 21.1978 8.75407 21.1978C7.58074 21.1978 6.53941 20.9411 5.63007 20.4278C4.72074 19.8998 4.00941 19.1664 3.49607 18.2278C2.98274 17.2744 2.72607 16.1671 2.72607 14.9058Z"
                                fill="#363430"
                            />
                            <path
                                d="M15.9604 14.8618C15.9604 13.6298 16.2024 12.5371 16.6864 11.5838C17.1851 10.6304 17.8524 9.8971 18.6884 9.38377C19.5391 8.87044 20.4851 8.61377 21.5264 8.61377C22.4358 8.61377 23.2278 8.7971 23.9025 9.16377C24.5918 9.53044 25.1418 9.99244 25.5525 10.5498V8.81177H28.6544V20.9998H25.5525V19.2178C25.1565 19.7898 24.6065 20.2664 23.9025 20.6478C23.2131 21.0144 22.4138 21.1978 21.5044 21.1978C20.4778 21.1978 19.5391 20.9338 18.6884 20.4058C17.8524 19.8778 17.1851 19.1371 16.6864 18.1838C16.2024 17.2158 15.9604 16.1084 15.9604 14.8618ZM25.5525 14.9058C25.5525 14.1578 25.4058 13.5198 25.1124 12.9918C24.8191 12.4491 24.4231 12.0384 23.9244 11.7598C23.4258 11.4664 22.8904 11.3198 22.3184 11.3198C21.7464 11.3198 21.2185 11.4591 20.7344 11.7378C20.2505 12.0164 19.8545 12.4271 19.5464 12.9698C19.2531 13.4978 19.1064 14.1284 19.1064 14.8618C19.1064 15.5951 19.2531 16.2404 19.5464 16.7978C19.8545 17.3404 20.2505 17.7584 20.7344 18.0518C21.2331 18.3451 21.7611 18.4918 22.3184 18.4918C22.8904 18.4918 23.4258 18.3524 23.9244 18.0738C24.4231 17.7804 24.8191 17.3698 25.1124 16.8418C25.4058 16.2991 25.5525 15.6538 25.5525 14.9058Z"
                                fill="#363430"
                            />
                            <path
                                d="M30.8706 14.8618C30.8706 13.6298 31.1126 12.5371 31.5966 11.5838C32.0953 10.6304 32.7626 9.8971 33.5986 9.38377C34.4493 8.87044 35.3953 8.61377 36.4366 8.61377C37.3459 8.61377 38.1379 8.7971 38.8126 9.16377C39.5019 9.53044 40.0519 9.99244 40.4626 10.5498V8.81177H43.5646V20.9998H40.4626V19.2178C40.0666 19.7898 39.5166 20.2664 38.8126 20.6478C38.1233 21.0144 37.3239 21.1978 36.4146 21.1978C35.3879 21.1978 34.4493 20.9338 33.5986 20.4058C32.7626 19.8778 32.0953 19.1371 31.5966 18.1838C31.1126 17.2158 30.8706 16.1084 30.8706 14.8618ZM40.4626 14.9058C40.4626 14.1578 40.3159 13.5198 40.0226 12.9918C39.7293 12.4491 39.3333 12.0384 38.8346 11.7598C38.3359 11.4664 37.8006 11.3198 37.2286 11.3198C36.6566 11.3198 36.1286 11.4591 35.6446 11.7378C35.1606 12.0164 34.7646 12.4271 34.4566 12.9698C34.1633 13.4978 34.0166 14.1284 34.0166 14.8618C34.0166 15.5951 34.1633 16.2404 34.4566 16.7978C34.7646 17.3404 35.1606 17.7584 35.6446 18.0518C36.1433 18.3451 36.6713 18.4918 37.2286 18.4918C37.8006 18.4918 38.3359 18.3524 38.8346 18.0738C39.3333 17.7804 39.7293 17.3698 40.0226 16.8418C40.3159 16.2991 40.4626 15.6538 40.4626 14.9058Z"
                                fill="#363430"
                            />
                            <path
                                d="M49.6528 10.7038C50.0488 10.0584 50.5621 9.55244 51.1928 9.18577C51.8381 8.8191 52.5714 8.63577 53.3928 8.63577V11.8698H52.5788C51.6108 11.8698 50.8774 12.0971 50.3788 12.5518C49.8948 13.0064 49.6528 13.7984 49.6528 14.9278V20.9998H46.5728V8.81177H49.6528V10.7038Z"
                                fill="#363430"
                            />
                            <path
                                d="M67.1273 8.81177L59.5813 26.7638H56.3033L58.9433 20.6918L54.0593 8.81177H57.5133L60.6593 17.3258L63.8493 8.81177H67.1273Z"
                                fill="#363430"
                            />
                            <path
                                d="M67.9956 14.8618C67.9956 13.6298 68.2376 12.5371 68.7216 11.5838C69.2203 10.6304 69.8876 9.8971 70.7236 9.38377C71.5743 8.87044 72.5203 8.61377 73.5616 8.61377C74.4709 8.61377 75.2629 8.7971 75.9376 9.16377C76.6269 9.53044 77.1769 9.99244 77.5876 10.5498V8.81177H80.6896V20.9998H77.5876V19.2178C77.1916 19.7898 76.6416 20.2664 75.9376 20.6478C75.2483 21.0144 74.4489 21.1978 73.5396 21.1978C72.5129 21.1978 71.5743 20.9338 70.7236 20.4058C69.8876 19.8778 69.2203 19.1371 68.7216 18.1838C68.2376 17.2158 67.9956 16.1084 67.9956 14.8618ZM77.5876 14.9058C77.5876 14.1578 77.4409 13.5198 77.1476 12.9918C76.8543 12.4491 76.4583 12.0384 75.9596 11.7598C75.4609 11.4664 74.9256 11.3198 74.3536 11.3198C73.7816 11.3198 73.2536 11.4591 72.7696 11.7378C72.2856 12.0164 71.8896 12.4271 71.5816 12.9698C71.2883 13.4978 71.1416 14.1284 71.1416 14.8618C71.1416 15.5951 71.2883 16.2404 71.5816 16.7978C71.8896 17.3404 72.2856 17.7584 72.7696 18.0518C73.2683 18.3451 73.7963 18.4918 74.3536 18.4918C74.9256 18.4918 75.4609 18.3524 75.9596 18.0738C76.4583 17.7804 76.8543 17.3698 77.1476 16.8418C77.4409 16.2991 77.5876 15.6538 77.5876 14.9058Z"
                                fill="#363430"
                            />
                        </svg>
                    </div>
                </div>
        </div>
        <div className="space-y-2 w-full">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent w-full"></div>
        </div>
      </div>

      {/* Phone Number Form */}
      {!isOTPSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sm">+91</span>
              </div>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="block w-full pl-12 pr-3 py-2.5 bg-transparent text-black rounded-lg shadow-sm  placeholder:text-black text-sm transition-colors duration-200 disabled:opacity-50"
                placeholder="Enter phone number"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
                disabled={loading}
                aria-describedby={phoneError ? "phone-error" : undefined}
              />
            </div>
            {phoneError && (
              <p id="phone-error" className="mt-1.5 text-sm text-red-400">{phoneError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#363430] text-white rounded-lg hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-[var(--primary)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-karla text-sm group"
          >
            {loading ? (
              <BouncingDots size="sm" color="white" />
            ) : (
              <>
                Send OTP
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>
      ) : (
        // OTP Verification Form
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm  text-center text-black">
              Enter the 6-digit code sent to <br /> +91 {phoneNumber}
            </p>
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={handleOTPChange}
              disabled={loading}
              aria-label="One-Time Password"
              aria-describedby={error ? "otp-error" : undefined}
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-10 h-11 rounded-lg text-black"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error && !phoneError && (
              <p id="otp-error" className="text-red-400 text-sm text-center pt-1">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#363430] text-white rounded-lg hover:bg-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-karla text-sm group"
          >
            {loading ? (
              <BouncingDots size="sm" color="white" />
            ) : (
              <>
                Verify OTP
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setIsOTPSent(false); setError(''); setPhoneError(''); setVerificationCode(''); }}
            disabled={loading}
            className="w-full text-center text-xs hover:text-indigo-100 disabled:opacity-50 transition-colors text-black"
          >
            Change phone number
          </button>
        </form>
      )}

      {/* General Error Display (for phone step) */}
      {error && !isOTPSent && !phoneError && (
        <p className="text-red-400 text-sm text-center mt-3">
          {error}
        </p>
      )}

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" className="mt-4"></div>
    </div>
  );
}
