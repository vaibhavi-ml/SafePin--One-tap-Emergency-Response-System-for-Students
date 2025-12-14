// src/HostelSOS.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { HOSTEL_MAP } from "./hostelMap";
import { useNavigate } from "react-router-dom";

const EMERGENCY_TYPES = [
    "Medical",
    "Harassment",
    "Fire",
    "Security Threat",
    "Other",
];

export default function HostelSOS() {
    const navigate = useNavigate();
    const [locationContext, setLocationContext] = useState("hostel");
    // =========================
    // FORM STATE
    // =========================
    const [studentId, setStudentId] = useState("");
    const [block, setBlock] = useState("");
    const [floor, setFloor] = useState("");
    const [room, setRoom] = useState("");
    const [emergencyType, setEmergencyType] = useState("Medical");

    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locStatus, setLocStatus] = useState("");

    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    // =========================
    // GPS (OPTIONAL)
    // =========================
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocStatus("Geolocation not supported");
            return;
        }

        setLocStatus("Detecting location and hostel block...");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                // 1️⃣ Store GPS
                setLocation({
                    lat: latitude,
                    lng: longitude,
                });

                // 2️⃣ Detect hostel block using GPS
                const detectedBlock = detectHostelBlock(latitude, longitude);

                if (detectedBlock) {
                    setBlock(detectedBlock);
                    setLocStatus(`Block ${detectedBlock} auto-detected via GPS`);
                } else {
                    setLocStatus("GPS captured, but hostel block could not be detected");
                }
            },
            () => {
                setLocStatus("Unable to fetch GPS location");
            }
        );
    };


    // =========================
    // SUBMIT SOS
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitMessage("");

        try {
            const payload = {
                studentId,
                emergencyType,

                locationType: "hostel",
                block,
                floor,
                room,

                lat: location.lat || null,
                lng: location.lng || null,
                locationSource: "registered_hostel",
                triggeredBy: "mobile",

                status: "open",
                createdAt: serverTimestamp(),

            };

            await addDoc(collection(db, "incidents"), payload);

            setSubmitMessage("🚨 SOS sent successfully. Help is on the way.");
        } catch (err) {
            console.error(err);
            setSubmitMessage("❌ Failed to send SOS. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UI
    // =========================
    return (
        <div>
            <div className="location-select">
                <button
                    type="button"
                    className={`location-btn ${locationContext === "hostel" ? "active" : ""}`}
                    onClick={() => setLocationContext("hostel")}
                >
                    🏠 Inside Hostel
                </button>

                <button
                    type="button"
                    className={`location-btn ${locationContext === "campus" ? "active" : ""}`}
                    onClick={() => navigate("/sos/campus")}
                >
                    🌳 Outside Hostel (Campus)
                </button>
            </div>

            <div className="page-title">
                <h1>Hostel Emergency SOS</h1>
                <p>Your registered hostel location will be used</p>
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

                    {/* BLOCK */}
                    <label>
                        Block
                        <select
                            value={block}
                            onChange={(e) => {
                                setBlock(e.target.value);
                                setFloor("");
                                setRoom("");
                            }}
                            required
                        >
                            <option value="">Select Block</option>
                            {Object.keys(HOSTEL_MAP).map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </label>

                    {/* FLOOR */}
                    {block && (
                        <label>
                            Floor
                            <select
                                value={floor}
                                onChange={(e) => {
                                    setFloor(e.target.value);
                                    setRoom("");
                                }}
                                required
                            >
                                <option value="">Select Floor</option>
                                {Object.keys(HOSTEL_MAP[block].floors).map((f) => (
                                    <option key={f} value={f}>Floor {f}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    {/* ROOM */}
                    {block && floor && (
                        <label>
                            Room Number
                            <select
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                required
                            >
                                <option value="">Select Room</option>
                                {HOSTEL_MAP[block].floors[floor].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </label>
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
                        Get GPS Location (Optional)
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
                            background: "#222",
                            color: "#fff",
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
