import {
  PubSub as PubSubClient,
  CONNECTION_STATE_CHANGE,
  ConnectionState,
} from "@aws-amplify/pubsub";
import { create } from "zustand";
import { Hub } from "aws-amplify/utils";
import { v4 as uuidv4 } from "uuid";

const TOPIC_WATERING_SMALL = "plants/watering/small";
const TOPIC_WATERING_STOP = "plants/watering/stop";
const TOPIC_WATERING_STOPPED = "plants/watering/stopped";
const TOPIC_DEVICE_LAST_WATERED = "plants/device/lastWatered";
const TOPIC_DEVICE_LAST_WATERED_GET = "plants/device/lastWatered/get";
const TOPIC_DEVICE_PING = "plants/device/ping";
const TOPIC_DEVICE_PONG = "plants/device/pong";

interface MQTTState {
  isConnected: boolean;
  isRaspberryConnected: boolean;
  lastWatered: string | null;
  isWateringOn: boolean;
  setIsConnected: (connected: boolean) => void;
  setIsRaspberryConnected: (connected: boolean) => void;
  setLastWatered: (date: string) => void;
  setIsWateringOn: (flag: boolean) => void;
}

export const useMQTTStore = create<MQTTState>((set) => ({
  isConnected: false,
  isRaspberryConnected: false,
  lastWatered: null,
  isWateringOn: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsRaspberryConnected: (connected) =>
    set({ isRaspberryConnected: connected }),
  setLastWatered: (date) => set({ lastWatered: date }),
  setIsWateringOn: (flag) => set({ isWateringOn: flag }),
}));

export class MQTTService {
  private pubSubClient: PubSubClient | undefined;

  constructor() {
    console.log("Constructor called");
    this.initialize();
  }

  private async initialize() {
    await this.connect();
    await this.subscribeToTopics();
    await this.listenEvents();
  }

  connect = async () => {
    console.log("connect called");
    try {
      const pubSubClient = new PubSubClient({
        region: "us-east-2",
        endpoint: "wss://a3ec0i3g0gczud-ats.iot.us-east-2.amazonaws.com/mqtt",
        clientId: "plant-watering-app-" + uuidv4(),
      });

      this.pubSubClient = pubSubClient;
    } catch (error) {
      console.error("Failed to connect to AWS IoT:", error);
    }
  };

  listenEvents = async () => {
    try {
      Hub.listen("pubsub", (data: any) => {
        const { payload } = data;
        if (payload.event === CONNECTION_STATE_CHANGE) {
          const connectionState = payload.data
            .connectionState as ConnectionState;

          switch (connectionState) {
            case ConnectionState.Connected:
              console.log("[HUB UPDATE] Successfully connected to MQTT");
              useMQTTStore.getState().setIsConnected(true);
              // this.subscribeToTopics();

              this.pingDevice();
              break;

            case ConnectionState.Connecting:
              console.log("[HUB UPDATE]Connecting to MQTT...");
              useMQTTStore.getState().setIsConnected(false);
              break;

            case ConnectionState.ConnectionDisrupted:
              console.warn(
                "[HUB UPDATE]Connection disrupted - attempting to reconnect"
              );
              useMQTTStore.getState().setIsConnected(false);
              break;

            case ConnectionState.ConnectionDisruptedPendingNetwork:
              console.warn("Connection disrupted - waiting for network.");
              useMQTTStore.getState().setIsConnected(false);
              break;

            case ConnectionState.Disconnected:
              console.log("[HUB UPDATE]Disconnected from MQTT");
              useMQTTStore.getState().setIsConnected(false);
              // this.connect();
              setTimeout(this.connect, 3000);
              break;

            case ConnectionState.ConnectedPendingNetwork:
              console.warn("[HUB UPDATE]Connected but network is unstable");
              useMQTTStore.getState().setIsConnected(true);
              break;

            case ConnectionState.ConnectedPendingDisconnect:
              console.log("[HUB UPDATE]Disconnecting from MQTT...");
              useMQTTStore.getState().setIsConnected(false);
              break;

            case ConnectionState.ConnectedPendingKeepAlive:
              console.warn("[HUB UPDATE]Connection alive check pending");
              break;
          }
        }
      });
    } catch (error) {
      console.error("[HUB] Failed to connect to AWS IoT:", error);
      useMQTTStore.getState().setIsConnected(false);
    }
  };

  // todo decide in what topics we subscribe
  private async subscribeToTopics() {
    if (!this.pubSubClient) return;

    const topics = [
      TOPIC_DEVICE_PONG,
      TOPIC_DEVICE_LAST_WATERED,
      TOPIC_WATERING_STOPPED,
    ];

    console.log("Subscribing to topics:", topics);

    this.pubSubClient.subscribe({ topics: topics }).subscribe({
      next: (data) => {
        console.log("Received message:", JSON.stringify(data));
        const symbols = Object.getOwnPropertySymbols(data);
        const topicSymbol = symbols.find(
          (sym) => sym.toString() === "Symbol(topic)"
        );

        if (topicSymbol) {
          const topic = data[topicSymbol];
          this.handleMessage(topic as string, data);
        }
      },
      error: (error) => console.error(error),
      complete: () => console.log("Done"),
    });
  }

  private handleMessage(topic: string, message: any) {
    try {
      switch (topic) {
        case TOPIC_WATERING_STOPPED:
          useMQTTStore.getState().setIsWateringOn(false);
          break;
        case TOPIC_DEVICE_LAST_WATERED:
          useMQTTStore.getState().setLastWatered(message.timestamp as string);

          break;
        case TOPIC_DEVICE_PONG:
          useMQTTStore.getState().setIsRaspberryConnected(true);
          break;
        default:
          console.warn("Unknown topic:", topic);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  pingDevice = async () => {
    if (!this.pubSubClient) {
      console.log("Not connected to MQTT");
      return;
    }
    useMQTTStore.getState().setIsRaspberryConnected(false);

    console.log("pingDevice called");
    await this.pubSubClient.publish({
      topics: [TOPIC_DEVICE_PING],
      message: {
        action: "PING",
      },
    });
  };

  startWatering = async () => {
    if (!this.pubSubClient) {
      console.log("Not connected to MQTT");
      return;
    }
    useMQTTStore.getState().setIsWateringOn(true);
    try {
      console.log("Starting watering...");
      await this.pubSubClient.publish({
        topics: [TOPIC_WATERING_SMALL],
        message: {
          status: "on",
          seconds: 5,
        },
      });
    } catch (error) {
      console.error("Error starting watering:", error);
    }
  };

  stopWatering = async () => {
    if (!this.pubSubClient) {
      console.log("Not connected to MQTT");
      return;
    }

    console.log("Stopping watering...");
    useMQTTStore.getState().setIsWateringOn(false);
    try {
      await this.pubSubClient.publish({
        topics: [TOPIC_WATERING_STOP],
        message: {
          status: "off",
        },
      });
    } catch (error) {
      console.error("Error stopping watering:", error);
    }
  };

  requestLastWatered = async () => {
    if (!this.pubSubClient) {
      console.log("Not connected to MQTT");
      return;
    }

    console.log("request last watered...");
    try {
      await this.pubSubClient.publish({
        topics: [TOPIC_DEVICE_LAST_WATERED_GET],
        message: {
          status: "get",
        },
      });
    } catch (error) {
      console.error("Error get last watered:", error);
    }
  };
}
