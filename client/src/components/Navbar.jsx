import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../api";

function Navbar({ showToast }) {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (user) {
			loadUnreadCount();
		}
	}, [user]);

	useEffect(() => {
		setMobileMenuOpen(false);
		setUserMenuOpen(false);
	}, [location]);

	const loadUnreadCount = async () => {
		try {
			const data = await getUnreadCount();
			setUnreadCount(data.count);
		} catch (e) {}
	};

	const handleLogout = () => {
		logout();
		setUserMenuOpen(false);
		showToast("Вы вышли из системы", "success");
	};

	const getRoleLabel = (role) => {
		switch (role) {
			case "b2c":
				return "Личный кабинет";
			case "b2b_employee":
				return "Кабинет предприятия";
			case "admin":
				return "Администрирование";
			case "ministry":
				return "Аналитика";
			default:
				return "Кабинет";
		}
	};

	const getRoleLink = (role) => {
		switch (role) {
			case "b2c":
				return "/account";
			case "b2b_employee":
				return "/b2b";
			case "admin":
				return "/admin";
			case "ministry":
				return "/analytics";
			default:
				return "/account";
		}
	};

	const isActive = (path) => location.pathname === path;

	return (
		<>
			<nav className="navbar">
				<div className="navbar-inner">
					<Link to="/" className="navbar-brand">
						<div className="navbar-brand-icon">ТМП</div>
						ТЭМП
					</Link>

					<ul className="navbar-nav">
						<li>
							<Link to="/" className={isActive("/") ? "active" : ""}>
								Главная
							</Link>
						</li>
						<li>
							<Link
								to="/catalog"
								className={isActive("/catalog") ? "active" : ""}
							>
								Каталог
							</Link>
						</li>
					</ul>

					<div className="auth-section">
						{user ? (
							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F5F3FF] transition-colors"
								>
									<div className="avatar">
										{user.full_name?.charAt(0).toUpperCase()}
									</div>
									{unreadCount > 0 && (
										<span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC2626] rounded-full text-xs text-white flex items-center justify-center">
											{unreadCount}
										</span>
									)}
								</button>

								{userMenuOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-[#E9D5FF] py-2 z-50">
										<div className="px-4 py-2 border-b border-[#E9D5FF]">
											<p className="font-medium text-[#1F2937]">{user.full_name}</p>
											<p className="text-sm text-[#6B7280]">{user.email}</p>
										</div>
										<Link
											to={getRoleLink(user.role)}
											onClick={() => setUserMenuOpen(false)}
											className="block px-4 py-2 text-[#1F2937] hover:bg-[#F5F3FF]"
										>
											{getRoleLabel(user.role)}
										</Link>
										<hr className="my-2 border-[#E9D5FF]" />
										<button
											onClick={handleLogout}
											className="w-full text-left px-4 py-2 text-[#DC2626] hover:bg-[#F5F3FF]"
										>
											Выйти
										</button>
									</div>
								)}
							</div>
						) : (
							<>
								<Link to="/login" className="auth-link auth-link-login">
									Войти
								</Link>
								<Link to="/register" className="auth-link auth-link-register">
									Регистрация
								</Link>
							</>
						)}

						<button
							className="mobile-menu-toggle"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Меню"
						>
							<span></span>
							<span></span>
							<span></span>
						</button>
					</div>
				</div>
			</nav>

			{/* Mobile backdrop */}
			<div
				className={`mobile-backdrop ${mobileMenuOpen ? "open" : ""}`}
				onClick={() => setMobileMenuOpen(false)}
			/>

			{/* Mobile menu */}
			<div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
				<ul className="mobile-nav">
					<li>
						<Link to="/">Главная</Link>
					</li>
					<li>
						<Link to="/catalog">Каталог</Link>
					</li>
					{user && (
						<li>
							<Link to={getRoleLink(user.role)}>{getRoleLabel(user.role)}</Link>
						</li>
					)}
				</ul>
				<div className="mobile-divider" />
				<ul className="mobile-nav">
					{user ? (
						<li>
							<button onClick={handleLogout} className="w-full text-left">
								Выйти
							</button>
						</li>
					) : (
						<>
							<li>
								<Link to="/login">Войти</Link>
							</li>
							<li>
								<Link to="/register">Регистрация</Link>
							</li>
						</>
					)}
				</ul>
			</div>

			{/* User menu backdrop */}
			{userMenuOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setUserMenuOpen(false)}
				/>
			)}
		</>
	);
}

export default Navbar;