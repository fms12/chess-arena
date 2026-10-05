import GameModeSelection from "./GameModeSelection";

type LobbyProps = {
  gameId: string | null;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onCreateGame: () => Promise<void>;
  onJoinGame: (gameId: string) => Promise<void>;
};

export default function Lobby({
  gameId,
  playerName,
  onPlayerNameChange,
  onCreateGame,
  onJoinGame,
}: LobbyProps) {
  return (
    <GameModeSelection
      gameId={gameId}
      playerName={playerName}
      onPlayerNameChange={onPlayerNameChange}
      onCreateGame={onCreateGame}
      onJoinGame={onJoinGame}
    />
  );
}
