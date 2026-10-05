import { GameController } from "./components/GameController";
import Navbar from "./components/shared/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-[#312e2b] text-[#c3c1be] flex flex-col font-sans antialiased selection:bg-[#81b64c] selection:text-white">
      <Navbar variant="lobby" />
      <main className="flex-1 flex flex-col">
        <GameController />
      </main>
    </div>
  );
}

export default App;
