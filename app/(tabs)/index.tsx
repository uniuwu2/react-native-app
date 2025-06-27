import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

export default function HomeScreen() {
  const { logout } = useAuth(); // Giả sử user chứa studentId
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API để lấy lịch học
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        if (!user || !user.id) {
          setError('Không tìm thấy thông tin sinh viên');
          return;
        }

        const response = await fetch(`https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/get-student-schedule/${user.id}`);
        const result = await response.json();
        
        if (response.status === 200) {
          setSchedule(result.data);
        } else {
          setError(result.message || 'Không thể lấy lịch học');
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Đã xảy ra lỗi khi lấy lịch học');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);
  

  // Đánh dấu các ngày có lịch học
  const markedDates = schedule.reduce<Record<string, object>>((acc, item) => {
    const date = item.date; // Giả sử date có định dạng YYYY-MM-DD
    acc[date] = {
      marked: true,
      dotColor: item.color,
      selected: selectedDate === date,
      selectedColor: item.color,
    };
    return acc;
  }, {});

  // Xử lý khi nhấn vào ngày
  const handleDayPress = (day: { dateString: string }) => {
    const date = day.dateString;
    if (schedule.some((item) => item.date === date)) {
      setSelectedDate(date);
      setShowSubjects(true);
    } else {
      setShowSubjects(false);
      setSelectedDate(null);
    }
  };

  // Lọc danh sách môn học theo ngày được chọn
  const selectedSubjects = schedule.filter((item) => item.date === selectedDate);

  // Render môn học
  const renderSubject = ({ item }: { item: any }) => (
    <View style={[styles.subjectItem, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.timeText}>
        {item.startTime} - {item.endTime}
      </Text>
      <Text style={styles.detailText}>Phòng: {item.room}</Text>
      <Text style={styles.detailText}>Giảng viên: {item.teacher}</Text>
    </View>
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học</Text>
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Hiển thị loading hoặc lỗi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải lịch học...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* Lịch học */}
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#007bff',
              selectedDayBackgroundColor: '#007bff',
              arrowColor: '#007bff',
              textSectionTitleColor: '#6c757d',
            }}
          />

          {/* Hiển thị danh sách môn học */}
          {showSubjects && selectedDate && selectedSubjects.length > 0 && (
            <View style={styles.subjectsContainer}>
              <Text style={styles.subjectsTitle}>Môn học ngày {selectedDate}</Text>
              <FlatList
                data={selectedSubjects}
                renderItem={renderSubject}
                keyExtractor={(item) => `${item.courseId}-${item.startTime}`}
                style={styles.subjectList}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343a40',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  subjectsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  subjectList: {
    maxHeight: 300,
  },
  subjectItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  timeText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
});