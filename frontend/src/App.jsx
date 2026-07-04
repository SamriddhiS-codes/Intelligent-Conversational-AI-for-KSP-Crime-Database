function App() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#3C2A36]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 shadow-sm bg-white">
        <h1 className="text-2xl font-bold">
          Karnataka Police AI
        </h1>

        <button className="rounded-lg bg-[#3C2A36] px-5 py-2 text-white transition hover:bg-[#936562]">
          Launch Assistant
        </button>
      </nav>

      {/* Hero */}
      <main className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-between px-8">
        {/* Left */}
        <div className="max-w-xl">
          <h2 className="mb-6 text-5xl font-extrabold leading-tight">
            Intelligent AI Assistant
            <br />
            for Karnataka Police
          </h2>

          <p className="mb-8 text-lg text-gray-600">
            Secure, multilingual conversational AI built to assist officers
            with legal guidance, documentation, and operational support.
          </p>

          <div className="flex gap-4">
            <button className="rounded-xl bg-[#3C2A36] px-6 py-3 text-white hover:bg-[#936562]">
              Start Conversation
            </button>

            <button className="rounded-xl border border-[#936562] px-6 py-3 text-[#3C2A36] hover:bg-[#DBDFAC]">
              Learn More
            </button>
          </div>
        </div>

        {/* AI Card */}
        <div className="hidden md:flex h-96 w-96 items-center justify-center rounded-3xl border border-[#DBDFAC] bg-white shadow-xl">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#DBDFAC] text-3xl font-bold">
            AI
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;