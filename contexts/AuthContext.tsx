import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: () => Promise<any | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  user: async () => null,
});

import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập kiểm tra trạng thái đăng nhập
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Giả lập xác thực: chấp nhận bất kỳ email nào với mật khẩu "password"
    // Trong thực tế, bạn sẽ gọi API xác thực ở đây
    if (!email || !password) {
      throw new Error("Vui lòng nhập email và mật khẩu");
    }
    const response = await fetch("https://e371-2402-800-63b7-b748-b40f-558b-a96e-7765.ngrok-free.app/api/v1/app/login", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json());
    if (response) {
      if (response.success) {
        // lưu token và thông tin của user vào async storage
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setIsAuthenticated(true);
        return;
      }
    }
    throw new Error("Email hoặc mật khẩu không đúng");
  };

  const user = async () => {
    // Lấy thông tin người dùng từ AsyncStorage
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    // Xoá token và thông tin người dùng khỏi AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
