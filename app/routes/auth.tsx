import { usePuterStore } from "~/lib/puter";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useGSAP } from "@gsap/react";
import { reducedMotion, fadeSlideIn } from "~/lib/animations";

export const meta = () => ([
  { title: 'ResuMatch | Auth' },
  { name: 'description', content: 'Log into your account' },
])

const auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLElement>(null);

  const rawNext = new URLSearchParams(location.search).get('next');
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/';

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next, navigate])

  useGSAP(() => {
    if (reducedMotion()) return;
    fadeSlideIn(cardRef.current, { delay: 0.1 });
  }, { scope: cardRef });

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-[#fafafa] bg-cover min-h-screen flex items-center justify-center">
      <section ref={cardRef} className="flex flex-col gap-8 bg-white rounded-[12px] shadow-sm border border-[#dfdfdf] p-10 w-full max-w-md">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>
          <div>
            {isLoading ? (
                <button className="auth-button animate-pulse">
                  <p>Signing you in...</p>
                </button>
            ) : (
                <>
                  {auth.isAuthenticated ? (
                      <button className="auth-button" onClick={auth.signOut}>
                        <p>Log Out</p>
                      </button>
                  ) : (
                      <button className="auth-button" onClick={auth.signIn}>
                        <p>Log In</p>
                      </button>
                  )}
                </>
            )}
          </div>
      </section>
    </main>
  )
}

export default auth
