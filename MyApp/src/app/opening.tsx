import { useState } from "react";

export default function OpeningPage() {
  const [loading, setLoading] = useState<boolean>(false);

  const handleAuthRedirect = (): void => {
    setLoading(true);
    setTimeout(() => {
      // Direct user to Sign In screen (SCREEN_20)
      window.location.hash = "#signin";
    }, 450);
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-surface pt-safe pb-safe">
      <div className="flex flex-col justify-between min-h-screen w-full relative selection:bg-secondary-fixed-dim">
        <div className="relative w-full h-[52vh] min-h-[340px] overflow-hidden">
          <img
            alt="Clothes collection background"
            className="w-full h-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvGw4zf02uWSf8ZD_ido3laydUCMtYY91BL_S9Qegg_BL64PK2xnV7XfxcM780Fu3F0MpOMz9bFx3ISXLweX8ipXtBD301O8D7XKoPuTVYsesJ1mo6TJrl5Jb4QM9XjMdd-rAIBp9YD3z743nnyKG9GOef269VMCQBQFb5t0Io6XotvoKCAj9IbVWc-EwChtJrgxRJ-3DIja5yfRfUv9WE4t6Uzu2OM9o60_FDyji29m48-jw6iaMSHj5QRP2JFfmflEw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/60 to-surface" />
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
            <div className="w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-1.5 shadow-sm border border-outline-variant/30">
              <img
                alt="Clad Monogram"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WFUkWvcDASghgdWmHXmNGAu7Bj1_USfwWd3KiBmrWT-9RrI9ATP7bFisJYBOvSLsn4G2-ZJ17WjQySMq3kWpuakPONdLWr4t_AStYLA_FnJ43tYFxBhwzdlqkR1JzGnXkRFyuHUvq2Z35QMjYYyF37B-zpLiFeutFMKEXwRcJ_yVSXkfpMkRu0Kip8MYCC5-4EcnIIRXi9Fcf0hL3ISgiNIc-qZXU-J6gcVNtReIlD5frY4hY3bKMCH4j6"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 px-6 pb-8 pt-0 -mt-12 relative z-10 justify-between">
          <div className="flex flex-col items-center text-center space-y-3">
            <h1 className="font-['Hanken_Grotesk',sans-serif] text-5xl font-bold tracking-tight text-primary uppercase">
              CLAD
            </h1>
            <p className="font-label-sm text-label-sm text-secondary tracking-[0.25em] uppercase font-semibold -mt-1">
              Wear it, clad it.
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xs pt-3 leading-relaxed">
              Curate your digital wardrobe and plan daily looks effortlessly.
            </p>
          </div>

          <div className="flex flex-col space-y-3 pt-8 w-full max-w-sm mx-auto">
            <button
              id="btn-get-started"
              type="button"
              onClick={handleAuthRedirect}
              style={loading ? { opacity: 0.85 } : undefined}
              className="w-full bg-primary text-on-primary py-3.5 px-6 rounded-full font-label-lg text-label-lg flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    progress_activity
                  </span>
                  <span>Preparing Atelier...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </>
              )}
            </button>

            <button
              id="btn-sign-in"
              type="button"
              onClick={handleAuthRedirect}
              className="w-full bg-surface-container-low text-on-surface py-3 px-6 rounded-full font-label-lg text-label-lg flex items-center justify-center space-x-1.5 active:scale-95 transition-all duration-200 hover:bg-surface-container-high cursor-pointer"
            >
              <span>Already a member?</span>
              <span className="font-semibold text-secondary">Sign In</span>
            </button>

            <p className="text-center font-label-sm text-label-sm text-outline px-4 leading-normal pt-1">
              By continuing, you agree to Clad’s{" "}
              <a className="underline hover:text-on-surface" href="#">
                Terms of Service
              </a>{" "}
              &amp;{" "}
              <a className="underline hover:text-on-surface" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}