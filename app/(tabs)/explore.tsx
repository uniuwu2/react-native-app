import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, ActivityIndicator, SafeAreaView, View } from "react-native";
import { useState, useEffect } from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function TabTwoScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API để lấy lịch sử điểm danh
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        console.log("User data:", user);
        if (!user || !user.id) {
          setError("Không tìm thấy thông tin sinh viên");
          return;
        }

        // Lấy điểm danh môn học
        const subjectResponse = await fetch(
          `https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/get-student-attendance/${user.id}`
        );
        const subjectResult = await subjectResponse.json();
        console.log("Subject attendance response:", subjectResult);

        // Lấy điểm danh sự kiện
        const eventResponse = await fetch(
          `https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/get-student-event-attendance/${user.id}`
        );
        const eventResult = await eventResponse.json();
        console.log("Event attendance response:", eventResult);

        let combinedAttendance: any[] = [];
        if (subjectResponse.status === 200) {
          combinedAttendance = [...subjectResult.data];
        } else {
          setError(subjectResult.message || "Không thể lấy lịch sử điểm danh môn học");
        }

        if (eventResponse.status === 200) {
          combinedAttendance = [
            ...combinedAttendance,
            ...eventResult.data.map((item: any) => ({
              ...item,
              subject: item.eventName, // Đồng bộ trường subject để hiển thị
              room: item.location, // Đồng bộ trường room để hiển thị
            })),
          ];
        } else {
          setError(eventResult.message || "Không thể lấy lịch sử điểm danh sự kiện");
        }

        // Sắp xếp theo ngày giảm dần
        combinedAttendance.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
        setAttendance(combinedAttendance);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Đã xảy ra lỗi khi lấy lịch sử điểm danh");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Render mục điểm danh
  const renderAttendance = ({ item }: { item: any }) => (
    <ThemedView style={[styles.attendanceItem, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
      <ThemedText type="defaultSemiBold">{item.subject}</ThemedText>
      <ThemedText style={styles.timeText}>
        {item.date} | {item.startTime} - {item.endTime}
      </ThemedText>
      <ThemedText style={styles.detailText}>
        {item.room ? `Phòng: ${item.room}` : `Địa điểm: ${item.location}`}
      </ThemedText>
      {/* Thời gian checkAt, nếu không có thì hiển thị "Chưa điểm danh" */}
      <ThemedText style={styles.timeText}>
        {item.checkedAt ? `Thời gian điểm danh: ${new Date(item.checkedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}` : "Chưa điểm danh"}
      </ThemedText>
      <ThemedText
        style={[
          styles.detailText,
          {
            color:
              item.status === "Có mặt"
                ? "#28a745"
                : item.status === "Vắng"
                ? "#dc3545"
                : "#ffc107",
          },
        ]}
      >
        Trạng thái: {item.status}
      </ThemedText>
    </ThemedView>
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Render header
  const renderHeader = () => (
    <ThemedView style={styles.titleContainer}>
      <ThemedText type="title">Lịch sử điểm danh</ThemedText>
      <Feather
        name="log-out"
        size={24}
        color="#dc3545"
        onPress={handleLogout}
        style={styles.logoutIcon}
      />
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color="#007bff" />
          <ThemedText style={styles.loadingText}>Đang tải lịch sử điểm danh...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.errorContainer}>
          {renderHeader()}
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={attendance}
          renderItem={renderAttendance}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Không có dữ liệu điểm danh</ThemedText>
            </ThemedView>
          }
          style={styles.attendanceList}
          contentContainerStyle={styles.attendanceContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutIcon: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
  attendanceContainer: {
    padding: 16,
  },
  attendanceList: {
    flex: 1,
  },
  attendanceItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    marginBottom: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
});