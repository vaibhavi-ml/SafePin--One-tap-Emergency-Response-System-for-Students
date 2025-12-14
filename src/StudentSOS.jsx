// src/StudentSOS.jsx
import { useState } from "react";
import { db, addDoc, collection, serverTimestamp } from "./firebase";
import { HOSTEL_MAP } from "./hostelMap";

const EMERGENCY_TYPES = [
  "Medical",
  "Harassment",
  "Fire",
  "Security Threat",
  "Other",
];

export default function StudentSOS() {
  // ✅ ALL HOOKS INSIDE COMPONENT
  const [studentId, setStudentId] = useState("");
  const [digipin, setDigipin] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [emergencyType, setEmergencyType] = useState("Medical");
  const [locationContext, setLocationContext] = useState("");
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locStatus, setLocStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // =========================
  // Resolve DigiPIN (Student View)
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
        source: "digipin",
      });
    } catch (err) {
      alert("Failed to resolve DigiPIN");
    } finally {
      setResolving(false);
    }
  };

  // =========================
  // GPS fallback (optional)
  // =========================
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation not supported");
      return;
    }

    setLocStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocStatus(
          `Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
      },
      () => setLocStatus("Failed to fetch GPS location")
    );
  };

  // =========================
  // Submit SOS
  // =========================
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setSubmitMessage("");

  try {
    let payload = {
      studentId,
      emergencyType,
      status: "open",
      createdAt: serverTimestamp(),
    };

    // =========================
    // LOCATION DECISION LOGIC
    // =========================

    /* 🏠 INSIDE HOSTEL */
    if (locationContext === "hostel") {
      payload.locationType = "hostel";
      payload.block = block;
      payload.floor = floor;
      payload.room = room;

      // GPS is optional indoors
      payload.lat = location.lat || null;
      payload.lng = location.lng || null;

      payload.locationSource = "registered_hostel";
    }

    /* 🌳 OUTSIDE HOSTEL (CAMPUS) */
    else if (locationContext === "campus") {
      payload.locationType = "campus";
      payload.digipin = digipin;

      // Prefer DigiPIN, fallback to GPS
      const finalLat = resolvedLocation?.lat || location.lat;
      const finalLng = resolvedLocation?.lng || location.lng;

      if (!finalLat || !finalLng) {
        alert("Unable to determine your location. Please enable GPS or resolve DigiPIN.");
        setLoading(false);
        return;
      }

      payload.lat = finalLat;
      payload.lng = finalLng;

      payload.locationSource = resolvedLocation
        ? "digipin"
        : "gps_fallback";
    }

    /* ❌ NO CONTEXT SELECTED */
    else {
      alert("Please select your location (Hostel or Campus)");
      setLoading(false);
      return;
    }

    await addDoc(collection(db, "incidents"), payload);

    setSubmitMessage("SOS sent successfully. Help is being notified.");

  } catch (err) {
    console.error(err);
    setSubmitMessage("Failed to send SOS.");
  } finally {
    setLoading(false);
  }
};


  // =========================
  // UI
  // =========================
  return (
    <div>
      <h2>Student SOS</h2>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="toggle-card">
            <p><b>Where are you right now?</b></p>

            <label>
              <input
                type="radio"
                name="locationContext"
                value="hostel"
                checked={locationContext === "hostel"}
                onChange={() => setLocationContext("hostel")}
              />
              Inside Hostel
            </label>

            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                name="locationContext"
                value="campus"
                checked={locationContext === "campus"}
                onChange={() => setLocationContext("campus")}
              />
              Outside Hostel (Campus)
            </label>
          </div>

          {/* STUDENT ID */}
          <label>
            Student ID / Name
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </label>

          {/* DIGIPIN */}
          <label>
            DigiPIN
            <input
              value={digipin}
              onChange={(e) => setDigipin(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />
          </label>

          <button type="button" onClick={handleResolveDigiPin}>
            {resolving ? "Resolving..." : "Resolve DigiPIN"}
          </button>

          {resolvedLocation && (
            <>
              {/* DigiPIN verified info */}
              <div className="resolved-box">
                <div><b>📍 DigiPIN Location Verified</b></div>
                <div>Latitude: {resolvedLocation.lat.toFixed(5)}</div>
                <div>Longitude: {resolvedLocation.lng.toFixed(5)}</div>
              </div>

              {/* Map preview card */}
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


          {/* HOSTEL */}
          <select value={block} onChange={(e) => setBlock(e.target.value)} required>
            <option value="">Select Block</option>
            {Object.keys(HOSTEL_MAP).map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {/* FLOOR */}
          <label>
            Floor
            <input
              type="number"
              min="0"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 2"
              required
            />
          </label>

          {/* ROOM */}
          <label>
            Room Number
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. 203"
              required
            />
          </label>


          <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)}>
            {EMERGENCY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <button type="button" onClick={handleGetLocation}>
            Get GPS (optional)
          </button>

          <div>{locStatus}</div>

          <button type="submit">
            {loading ? "Sending..." : "SEND SOS"}
          </button>
        </form>

        {submitMessage && <div>{submitMessage}</div>}
      </div>
    </div>
  );
}
