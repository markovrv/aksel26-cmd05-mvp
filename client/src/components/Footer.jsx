import React from "react";
import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="footer">
			<div className="footer-grid">
				{/* О проекте */}
				<div>
					<div className="footer-brand">
						<div className="footer-brand-icon">
							<svg
								className="w-5 h-5 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						ПромТур
					</div>
					<p className="footer-description">
						Платформа промышленного туризма Кировской области. Откройте для себя
						удивительный мир производства и познакомьтесь с лучшими
						предприятиями региона.
					</p>
				</div>

				{/* Навигация */}
				<div>
					<h4 className="footer-title">Навигация</h4>
					<ul className="footer-links">
						<li>
							<Link to="/">Главная</Link>
						</li>
						<li>
							<Link to="/catalog">Каталог экскурсий</Link>
						</li>
						<li>
							<Link to="/login">Вход</Link>
						</li>
						<li>
							<Link to="/register">Регистрация</Link>
						</li>
					</ul>
				</div>

				{/* Контакты */}
				<div>
					<h4 className="footer-title">Контакты</h4>
					<ul className="footer-links">
						<li>г. Киров, ул. Московская, 69</li>
						<li>+7 (8332) 12-34-56</li>
						<li>info@promtur.ru</li>
					</ul>
				</div>

				{/* Информация */}
				<div>
					<h4 className="footer-title">Информация</h4>
					<ul className="footer-links">
						<li>
							<a href="#">О проекте</a>
						</li>
						<li>
							<a href="#">Для предприятий</a>
						</li>
						<li>
							<a href="#">Политика конфиденциальности</a>
						</li>
						<li>
							<a href="#">Пользовательское соглашение</a>
						</li>
					</ul>
				</div>
			</div>

			<div className="footer-bottom">
				<p>
					© {new Date().getFullYear()} ПромТур — Платформа промышленного туризма
				</p>
			</div>
		</footer>
	);
}

export default Footer;
