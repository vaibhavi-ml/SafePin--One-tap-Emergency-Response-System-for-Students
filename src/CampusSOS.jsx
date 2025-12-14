// src/CampusSOS.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

const EMERGENCY_TYPES = [
  "Medical",
  "Harassment",
  "Fire",
  "Security Threat",
  "Other",
];

export default function CampusSOS() {
  const navigate = useNavigate();

  // =========================
  // FORM STATE
  // =========================
  const [studentId, setStudentId] = useState("");
  const [digipin, setDigipin] = useState("");
  const [emergencyType, setEmergencyType] = useState("Medical");

  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [resolving, setResolving] = useState(false);

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locStatus, setLocStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // =========================
  // RESOLVE DIGIPIN
  // =========================
  const handleResolveDigiPin = async () => {
    if (digipin.length !== 10) {
      alert("Please enter a valid 10-character DigiPIN");
      return;
    }

    setResolving(true);
    setResolvedLocation(null);

    try {
      const res = await fetch("http://localhost:5000/resolve-digipin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digipin }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setResolvedLocation({
        lat: data.lat,
        lng: data.lng,
      });
    } catch (err) {
      alert("Failed to resolve DigiPIN");
    } finally {
      setResolving(false);
    }
  };

  // =========================
  // GPS FALLBACK
  // =========================
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation not supported");
      return;
    }

    setLocStatus("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("GPS SUCCESS:", pos.coords);

        const { latitude, longitude } = pos.coords;

        setLocation({ lat: latitude, lng: longitude });
        setLocStatus(`GPS: ${latitude}, ${longitude}`);

        const detectedBlock = detectHostelBlock(latitude, longitude);
        console.log("Detected block:", detectedBlock);

        if (detectedBlock) {
          setBlock(detectedBlock);
          setLocStatus(`Block ${detectedBlock} auto-detected`);
        } else {
          setLocStatus("GPS OK, but outside hostel radius");
        }
      },
      (err) => {
        console.error("GPS ERROR:", err);
        setLocStatus("GPS permission denied or unavailable");
      }
    );
  };



  // =========================
  // SUBMIT SOS
  // =========================
  const handleSubmit = async (e, triggerSource = "mobile") => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage("");

    try {
      const finalLat = resolvedLocation?.lat || location.lat;
      const finalLng = resolvedLocation?.lng || location.lng;

      if (!finalLat || !finalLng) {
        alert("Please resolve DigiPIN or enable GPS");
        setLoading(false);
        return;
      }

      const payload = {
        studentId,
        emergencyType,

        locationType: "campus",
        digipin,

        lat: finalLat,
        lng: finalLng,
        locationSource: resolvedLocation ? "digipin" : "gps_fallback",
        triggeredBy: triggerSource,


        status: "open",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "incidents"), payload);

      setSubmitMessage("🚨 SOS sent successfully. Help is on the way.");
    } catch (err) {
      console.error(err);
      setSubmitMessage("❌ Failed to send SOS.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>
      <div className="page-title">
        <h2>Campus Emergency SOS</h2>
        <p className="page-subtitle">
          Your location will be shared with hostel authorities.
        </p>
      </div>


      <div className="card">
        <form onSubmit={handleSubmit} className="sos-form">

          {/* STUDENT ID */}
          <label>
            Student ID / Name
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </label>

          {/* DIGIPIN */}
          <label>
            DigiPIN
            <input
              type="text"
              value={digipin}
              onChange={(e) => setDigipin(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="Enter 10-character DigiPIN"
            />
          </label>

          <button
            type="button"
            className="secondary"
            onClick={handleResolveDigiPin}
          >
            {resolving ? "Resolving DigiPIN..." : "Resolve DigiPIN"}
          </button>

          {/* RESOLVED LOCATION */}
          {resolvedLocation && (
            <>
              <div className="resolved-box">
                <div><b>📍 Location Verified via DigiPIN</b></div>
                <div>Lat: {resolvedLocation.lat.toFixed(5)}</div>
                <div>Lng: {resolvedLocation.lng.toFixed(5)}</div>
              </div>

              <div className="map-card">
                <div className="map-header">Location Preview</div>
                <img
                  className="map-image"
                  src={`https://static-maps.yandex.ru/1.x/?ll=${resolvedLocation.lng},${resolvedLocation.lat}&size=650,300&z=16&l=map&pt=${resolvedLocation.lng},${resolvedLocation.lat},pm2rdm`}
                  alt="Map preview"
                />
                <div className="map-footer">
                  <a
                    href={`https://www.google.com/maps?q=${resolvedLocation.lat},${resolvedLocation.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </>
          )}

          {/* EMERGENCY TYPE */}
          <label>
            Emergency Type
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
            >
              {EMERGENCY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          {/* GPS */}
          <button
            type="button"
            className="secondary"
            onClick={handleGetLocation}
          >
            Enable GPS (Fallback)
          </button>

          {locStatus && (
            <div style={{ fontSize: "0.85rem", color: "#5f6368" }}>
              {locStatus}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="danger"
            disabled={loading}
          >
            {loading ? "Sending SOS..." : "🚨 SEND SOS"}
          </button>
          <button
            type="button"
            style={{
              background: "white",
              color: "black",
              padding: "10px",
              borderRadius: "8px",
              marginTop: "8px",
            }}
            onClick={() => {
              alert("🔑 Keychain SOS triggered (simulation)");
              // reuse same submit logic
            }}
          >
            🔑 Simulate Keychain SOS
          </button>
          


        </form>

        {submitMessage && (
          <div style={{ marginTop: 12 }}>
            {submitMessage}
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            className="secondary"
            onClick={() => navigate("/")}
          >
            ← Change Location
          </button>
        </div>
      </div>
    </div>
  );
}
