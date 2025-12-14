import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ textAlign: "center", marginTop: 40 }}>
      <h1>Where are you right now?</h1>
      <p style={{ color: "#5f6368" }}>
        This helps us send help faster and more accurately
      </p>


      <div style={{ marginTop: 30 }}>
        <button
          className="primary"
          style={{ width: "100%", marginBottom: 12 }}
          onClick={() => navigate("/sos/hostel")}
        >
          🏠 Inside Hostel
        </button>

        <button
          className="secondary"
          style={{ width: "100%" }}
          onClick={() => navigate("/sos/campus")}
        >
          🌳 Outside Hostel (Campus)
        </button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
  <h3>🔗 Connected Safety Devices</h3>

  <ul style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
    <li>📱 Mobile App — Primary SOS trigger</li>
    <li>⌚ Wearable (Smartwatch/Fitness Band)</li>
    <li>🔑 Keychain SOS Button</li>
    <li>🎧 Earbuds Case Emergency Tap</li>
  </ul>

  <p style={{ color: "#555", fontSize: "0.85rem" }}>
    SOS can be triggered from any connected device if the phone is unavailable.
  </p>
</div>

    </div>
  );
}
