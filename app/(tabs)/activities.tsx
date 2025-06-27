import { useAuth } from '@/contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

export default function EventScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API để lấy sự kiện
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        console.log('User data:', user);
        if (!user || !user.id) {
          setError('Không tìm thấy thông tin sinh viên');
          return;
        }

        const response = await fetch(`https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/get-student-events/${user.id}`);
        const result = await response.json();
        if (response.status === 200) {
          setEvents(result.data);
        } else {
          setError(result.message || 'Không thể lấy sự kiện');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Đã xảy ra lỗi khi lấy sự kiện');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Đánh dấu các ngày có sự kiện
  const markedDates = events.reduce<Record<string, object>>((acc, item) => {
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
    if (events.some((item) => item.date === date)) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  // Lọc danh sách sự kiện theo ngày được chọn
  const selectedEvents = events.filter((item) => item.date === selectedDate);

  // Render sự kiện
  const renderEvent = ({ item }: { item: any }) => (
    <View style={[styles.eventItem, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDescription}>{item.description}</Text>
      <Text style={styles.timeText}>
        {item.startTime} - {item.endTime}
      </Text>
      <Text style={styles.detailText}>Địa điểm: {item.location}</Text>
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
        <Text style={styles.headerTitle}>Sự kiện</Text>
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Hiển thị loading hoặc lỗi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* Lịch sự kiện */}
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

          {/* Hiển thị danh sách sự kiện */}
          {selectedDate && selectedEvents.length > 0 && (
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Sự kiện ngày {selectedDate}</Text>
              <FlatList
                data={selectedEvents}
                renderItem={renderEvent}
                keyExtractor={(item) => item.id.toString()}
                style={styles.eventList}
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
  eventsContainer: {
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
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  eventList: {
    maxHeight: 300,
  },
  eventItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
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