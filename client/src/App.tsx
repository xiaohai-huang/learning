import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavButton = ({
  children,
  path,
}: {
  children: React.ReactChild;
  path: string;
}) => {
  const naviagate = useNavigate();

  return (
    <button
      style={{
        display: "block",
        width: "100%",
        height: "50px",
        fontSize: "30px",
      }}
      onClick={() => naviagate(path)}
    >
      {children}
    </button>
  );
};

function App() {
  const [roomId, setRoomId] = useState("HONOR-LAPTOP");

  return (
    <div className="App">
      <label>Room ID: </label>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <div style={{ marginTop: "30px" }} />
      <NavButton path={`/master/${roomId}`}>Master</NavButton>
      <div style={{ marginTop: "30px" }} />
      <NavButton path={`/slave/${roomId}`}>Slave</NavButton>
    </div>
  );
}

export default App;
