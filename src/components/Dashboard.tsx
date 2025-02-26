import React, { useState, useEffect, useRef } from "react";
import { signOut } from "aws-amplify/auth";
import {
  Droplet,
  Wifi,
  WifiOff,
  Clock,
  LogOut,
  Play,
  Square,
  Cpu,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { MQTTService, useMQTTStore } from "../iotService";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSignOut }) => {
  const [error, setError] = useState<string | null>(null);
  const mqttServiceRef = useRef<MQTTService | null>(null);

  // Get state from MQTT store
  const { isConnected, isRaspberryConnected, lastWatered, isWateringOn } =
    useMQTTStore();

  useEffect(() => {
    // Initialize MQTT service
    if (!mqttServiceRef.current) {
      try {
        mqttServiceRef.current = new MQTTService();

        // Set up ping interval to check if Raspberry Pi is connected
        const pingInterval = setInterval(() => {
          mqttServiceRef.current?.pingDevice();
        }, 30000); // Ping every 30 seconds

        // Request last watered time on initial load
        mqttServiceRef.current.requestLastWatered();

        // Clean up on unmount
        return () => {
          clearInterval(pingInterval);
        };
      } catch (err) {
        setError("Failed to initialize MQTT service");
        console.error("MQTT initialization error:", err);
      }
    }
  }, []);

  const handleStartWatering = async () => {
    try {
      await mqttServiceRef.current?.startWatering();
    } catch (err) {
      setError("Failed to send start watering command");
      console.error("MQTT publish error:", err);
    }
  };

  const handleStopWatering = async () => {
    try {
      await mqttServiceRef.current?.stopWatering();
    } catch (err) {
      setError("Failed to send stop watering command");
      console.error("MQTT publish error:", err);
    }
  };

  const handlePingDevice = async () => {
    try {
      await mqttServiceRef.current?.pingDevice();
    } catch (err) {
      setError("Failed to ping device");
      console.error("MQTT ping error:", err);
    }
  };

  const handleRequestLastWatered = async () => {
    try {
      await mqttServiceRef.current?.requestLastWatered();
    } catch (err) {
      setError("Failed to request last watered time");
      console.error("MQTT request error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut();
    } catch (err) {
      setError("Failed to sign out");
      console.error("Sign out error:", err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Droplet className="mr-2 text-blue-500" /> Plant Watering System
        </h1>
        <button
          onClick={handleSignOut}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <LogOut className="mr-1" size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          <span>{error}</span>
          <button
            className="ml-auto text-red-800 hover:text-red-900"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Connection Status Card */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Connection Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isConnected ? (
                  <Wifi className="mr-2 text-green-500" size={20} />
                ) : (
                  <WifiOff className="mr-2 text-red-500" size={20} />
                )}
                <span>AWS IoT Connection</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isRaspberryConnected ? (
                  <Cpu className="mr-2 text-green-500" size={20} />
                ) : (
                  <Cpu className="mr-2 text-red-500" size={20} />
                )}
                <span>Raspberry Pi</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                    isRaspberryConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isRaspberryConnected ? "Online" : "Offline"}
                </span>
                <button
                  onClick={handlePingDevice}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                  title="Ping device"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 text-blue-500" size={20} />
                <span>Last Watered</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  {lastWatered
                    ? formatDistanceToNow(lastWatered, { addSuffix: true })
                    : "-"}
                </span>
                <button
                  onClick={handleRequestLastWatered}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                  title="Refresh last watered time"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Status Card */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Plant Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplet className="mr-2 text-blue-500" size={20} />
                <span>Watering Status</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isWateringOn
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isWateringOn ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handleStartWatering}
                disabled={isWateringOn || !isConnected || !isRaspberryConnected}
                className={`flex items-center px-4 py-2 rounded-md text-white ${
                  isWateringOn || !isConnected || !isRaspberryConnected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Play size={16} className="mr-1" />
                Start Watering
              </button>

              <button
                onClick={handleStopWatering}
                disabled={
                  !isWateringOn || !isConnected || !isRaspberryConnected
                }
                className={`flex items-center px-4 py-2 rounded-md text-white ${
                  !isWateringOn || !isConnected || !isRaspberryConnected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Square size={16} className="mr-1" />
                Stop Watering
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          System Information
        </h2>
        <p className="text-sm text-gray-600">
          This dashboard connects to your Raspberry Pi plant watering system via
          AWS IoT Core. The system automatically waters your plants based on
          soil moisture levels, but you can also manually control watering using
          the buttons above.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Connection Status:</strong>{" "}
          {isConnected ? "Connected to AWS IoT" : "Disconnected from AWS IoT"}.
          {isRaspberryConnected
            ? " Raspberry Pi device is online."
            : " Raspberry Pi device is offline."}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
