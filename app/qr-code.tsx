import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
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

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
    if (scanned) return;

    setScanned(true);

    try {
      const parsed = JSON.parse(data); // nếu QR là JSON
      console.log("QR parsed:", parsed);
      // Lưu vào AsyncStorage
      const existing = await AsyncStorage.getItem("pending_attendance");
      const list = existing ? JSON.parse(existing) : [];

      list.push({
        ...parsed,
        scannedAt: new Date().toISOString(), // thời gian quét
      });

      await AsyncStorage.setItem("pending_attendance", JSON.stringify(list));

      alert("Đã lưu điểm danh tạm thời. Vui lòng đăng nhập để đồng bộ.");
    } catch (err) {
      console.error("QR không hợp lệ hoặc không phải JSON:", err);
      alert("QR không hợp lệ");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quét QR điểm danh</Text>
      </View>

      {/* Camera container */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {/* Overlay trên camera */}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Hướng camera vào mã QR để điểm danh
            </Text>
          </View>

          {/* Nút quét lại */}
          {scanned && (
            <View style={styles.scanAgainButtonContainer}>
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainButtonText}>Quét lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
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
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    height: 280,
    width: 280,
    borderWidth: 3,
    borderColor: "#00FF00",
    borderRadius: 20,
  },
  instructionContainer: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    textAlign: "center",
  },
  scanAgainButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: "center",
  },
  scanAgainButton: {
    backgroundColor: "#00C851",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scanAgainButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
