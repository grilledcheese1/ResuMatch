import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";

export const meta = () => ([
{ title: 'ResuMatch | Auth' },
{ name: 'description', content: 'Log into your account' },
])

const auth = () => {
  const {isLoading, auth} = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const rawNext = new URLSearchParams(location.search).get('next');
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/';

  useEffect(() => {
    if(auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next, navigate])



  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-[#fafafa] bg-cover min-h-screen flex items-center justify-center">
      <section className="flex flex-col gap-8 bg-white rounded-[12px] shadow-sm border border-[#dfdfdf] p-10 w-full max-w-md">
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
