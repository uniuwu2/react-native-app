import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      await login(email, password);

      // Sau khi login thành công, kiểm tra QR tạm
      const pendingQR = await AsyncStorage.getItem("pendingQR");

      if (pendingQR) {
        const { sessionId } = JSON.parse(pendingQR);
        const user = await AsyncStorage.getItem("user");

        if (user) {
          await sendAttendance(sessionId, JSON.parse(user).id);
          await AsyncStorage.removeItem("pendingQR"); // Xoá QR tạm
        }
      }

      // Chuyển đến màn hình chính
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Lỗi đăng nhập", error.message);
    }
  };

  const sendAttendance = async (sessionId: string, userId: number) => {
    try {
      const response = await fetch(
        `https://5d05-27-65-52-60.ngrok-free.app/api/v1/attendance/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, annonymous: true }),
        }
      );

      const result = await response.json();

      if (result.status === 200) {
        Alert.alert("Thành công", result.message);
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API điểm danh:", error);
      Alert.alert("Lỗi", "Có lỗi khi gửi điểm danh.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Vui lòng nhập thông tin để tiếp tục</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#10b981", marginTop: 16 }]}
          activeOpacity={0.7}
          onPress={() => router.push("/scanner")}
        >
          <Text style={styles.buttonText}>Quét QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#bfdbfe", // Màu nền đơn sắc thay cho gradient
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#4b5563",
  },
  footerLink: {
    fontSize: 14,
  },
});
