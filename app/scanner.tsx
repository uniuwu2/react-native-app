import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScanTime = useRef(0);
  const isProcessing = useRef(false);

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
        <Text style={styles.permissionMessage}>
          Điểm danh bằng QR yêu cầu quyền truy cập camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cấp quyền truy cập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    const currentTime = Date.now();

    if (isProcessing.current || currentTime - lastScanTime.current < 2000) {
      return;
    }

    isProcessing.current = true;
    lastScanTime.current = currentTime;
    setScanned(true);

    try {
      console.log(`Scanned QR Code: ${data}`);

      // Kiểm tra sessionId hoặc eventId trong mã QR
      const sessionIdMatch = data.match(/sessionId=([a-zA-Z0-9]+)/);
      const eventIdMatch = data.match(/eventId=([a-zA-Z0-9]+)/);
      const sessionExpiredMatch = data.match(/expiredAt=([0-9]+)/);

      if (!sessionExpiredMatch || (!sessionIdMatch && !eventIdMatch)) {
        alert("Mã QR không hợp lệ. Vui lòng thử lại.");
        resetScanner();
        return;
      }

      const sessionExpiredAt = parseInt(sessionExpiredMatch[1]);
      console.log("Session Expired At:", sessionExpiredAt);

      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        // Lưu QR tạm nếu chưa đăng nhập
        const pendingQR = {
          sessionId: sessionIdMatch ? sessionIdMatch[1] : null,
          eventId: eventIdMatch ? eventIdMatch[1] : null,
          sessionExpiredAt,
          scannedAt: Date.now(),
        };

        await AsyncStorage.setItem("pendingQR", JSON.stringify(pendingQR));
        alert(
          "Bạn chưa đăng nhập. Mã QR đã được lưu tạm. Vui lòng đăng nhập để hoàn tất điểm danh."
        );
        resetScanner();
        return;
      }
      // const user = JSON.parse(userData);
      // // Gọi API điểm danh dựa trên sessionId hoặc eventId
      // if (sessionIdMatch) {
      //   const sessionId = sessionIdMatch[1];
      //   console.log("Session ID:", sessionId);
      //   await sendAttendance(sessionId, user.id, "session");
      // } else if (eventIdMatch) {
      //   const eventId = eventIdMatch[1];
      //   console.log("Event ID:", eventId);
      //   await sendAttendance(eventId, user.id, "event");
      // }

      resetScanner();
    } catch (error) {
      console.error("Lỗi khi xử lý mã QR:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
      resetScanner();
    }
  };

  const sendAttendance = async (id: string, userId: number, type: "session" | "event") => {
    try {
      const endpoint =
        type === "session"
          ? `https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/attendance/${id}`
          : `https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/event-attendance/${id}`;
      console.log(`Gửi điểm danh ${type} với ID: ${id}, userId: ${userId}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.status === 200) {
        alert(result.message);
      } else {
        alert(`${result.message}`);
      }
    } catch (error) {
      console.error(`Lỗi khi gọi API điểm danh ${type}:`, error);
      alert(`Có lỗi khi gửi điểm danh ${type}.`);
    }
  };

  const resetScanner = () => {
    setTimeout(() => {
      setScanned(false);
      isProcessing.current = false;
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quét QR điểm danh</Text>
      </View>

      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Hướng camera vào mã QR để điểm danh
            </Text>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  permissionMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  instructionContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});