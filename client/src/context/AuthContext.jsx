import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Проверяем, есть ли сохранённые данные в sessionStorage (fallback)
		const savedToken = sessionStorage.getItem("authToken");
		const savedUser = sessionStorage.getItem("authUser");

		if (savedToken && savedUser) {
			setToken(savedToken);
			setUser(JSON.parse(savedUser));
			window.__authToken = savedToken;
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		const data = await apiLogin(email, password);
		setToken(data.token);
		setUser(data.user);
		window.__authToken = data.token;

		// Пробуем сохранить в sessionStorage как fallback
		try {
			sessionStorage.setItem("authToken", data.token);
			sessionStorage.setItem("authUser", JSON.stringify(data.user));
		} catch (e) {
			console.warn("Не удалось сохранить данные авторизации");
		}

		return data;
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		window.__authToken = null;
		try {
			sessionStorage.removeItem("authToken");
			sessionStorage.removeItem("authUser");
		} catch (e) {}
	};

	return (
		<AuthContext.Provider
			value={{ user, token, login, logout, loading, setUser }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth должен использоваться внутри AuthProvider");
	}
	return context;
}
