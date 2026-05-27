import React, { useState, useEffect } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Link,
	useNavigate,
	useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Страницы
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Enterprise from "./pages/Enterprise";
import Excursion from "./pages/Excursion";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import AccountB2C from "./pages/AccountB2C";
import AccountB2B from "./pages/AccountB2B";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Компоненты
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

// Защищённые маршруты
function ProtectedRoute({ children, allowedRoles }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-500">Загрузка...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
}

// Маршруты по ролям
function RoleBasedRedirect() {
	const { user } = useAuth();

	if (!user) return <Navigate to="/login" replace />;

	switch (user.role) {
		case "admin":
			return <Navigate to="/admin" replace />;
		case "b2b_employee":
			return <Navigate to="/b2b" replace />;
		case "ministry":
			return <Navigate to="/analytics" replace />;
		default:
			return <Navigate to="/account" replace />;
	}
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</BrowserRouter>
	);
}

function AppContent() {
	const [toast, setToast] = useState(null);

	const showToast = (message, type = "success") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar showToast={showToast} />
			<main className="flex-grow">
				<Routes>
					{/* Публичные маршруты */}
					<Route path="/" element={<Home />} />
					<Route path="/catalog" element={<Catalog />} />
					<Route path="/enterprise/:id" element={<Enterprise />} />
					<Route
						path="/excursion/:id"
						element={<Excursion showToast={showToast} />}
					/>
					<Route path="/login" element={<Login showToast={showToast} />} />
					<Route
						path="/register"
						element={<Register showToast={showToast} />}
					/>

					{/* Защищённые маршруты */}
					<Route
						path="/checkout"
						element={
							<ProtectedRoute allowedRoles={["b2c"]}>
								<Checkout showToast={showToast} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/payment-result"
						element={<PaymentResult showToast={showToast} />}
					/>

					{/* B2C маршруты */}
					<Route
						path="/account"
						element={
							<ProtectedRoute allowedRoles={["b2c"]}>
								<AccountB2C showToast={showToast} />
							</ProtectedRoute>
						}
					/>

					{/* B2B маршруты */}
					<Route
						path="/b2b"
						element={
							<ProtectedRoute allowedRoles={["b2b_employee"]}>
								<AccountB2B showToast={showToast} />
							</ProtectedRoute>
						}
					/>

					{/* Admin маршруты */}
					<Route
						path="/admin"
						element={
							<ProtectedRoute allowedRoles={["admin"]}>
								<Admin showToast={showToast} />
							</ProtectedRoute>
						}
					/>

					{/* Ministry маршруты */}
					<Route
						path="/analytics"
						element={
							<ProtectedRoute allowedRoles={["ministry", "admin"]}>
								<Analytics showToast={showToast} />
							</ProtectedRoute>
						}
					/>

					{/* Редирект после авторизации */}
					<Route path="/redirect" element={<RoleBasedRedirect />} />

					{/* 404 */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
			<Footer />

			{/* Toast уведомления */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	);
}

export default App;
