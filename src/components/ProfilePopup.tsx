import { useEffect, useState } from 'react';
import './ProfilePopup.css';
import './PopupCommon.css';

interface ProfilePopupProps {
    isVisible: boolean;
    onClose: () => void;
}

export function ProfilePopup({ isVisible, onClose }: ProfilePopupProps) {
    const [show, setShow] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setClosing(false);
            requestAnimationFrame(() => setShow(true));
        } else {
            setShow(false);
        }
    }, [isVisible]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setShow(false);
            onClose();
        }, 300);
    };

    if (!isVisible && !closing) return null;

    return (
        <div className="profile-popup-overlay" onClick={handleClose}>
            <div
                className={`profile-popup ${show && !closing ? 'visible' : ''} ${closing ? 'closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="popup-titlebar profile-popup-header">
                    <span className="profile-popup-header-title">Profil Kartı</span>
                    <button className="popup-close-btn profile-popup-close" onClick={handleClose} aria-label="Profili kapat">×</button>
                </div>

                {/* Fotoğraf alanı */}
                <div className="profile-photo-area">
                    <div className="profile-photo-placeholder">
                        <span>📸</span>
                    </div>
                </div>

                {/* Bilgiler */}
                <div className="profile-info">
                    <h2 className="profile-name">Erden Erim Aydoğdu</h2>
                    <p className="profile-title">AI & XR Solutions Architect</p>
                    <p className="profile-subtitle">IoT, Embedded Systems & Full-Stack Developer</p>

                    <p className="profile-bio">
                        Elektrik-Elektronik Mühendisliği altyapısını; AI, XR ve endüstriyel IoT ile birleştiren
                        multidisipliner çözüm mimarı. Donanım seviyesinden bulut mimarisine uçtan uca sistemler.
                    </p>

                    <div className="profile-details">
                        <div className="profile-detail-row">
                            <span className="detail-icon">📍</span>
                            <span>İstanbul, Türkiye</span>
                        </div>
                        <div className="profile-detail-row">
                            <a href="mailto:erdennilsu1965@gmail.com" className="detail-link">
                                <span className="detail-icon">📧</span>
                                <span>erdennilsu1965@gmail.com</span>
                            </a>
                        </div>
                        <div className="profile-detail-row">
                            <a href="https://linkedin.com/in/erden-erim-aydoğdu" target="_blank" rel="noopener noreferrer" className="detail-link">
                                <span className="detail-icon">💼</span>
                                <span>linkedin.com/in/erden-erim-aydoğdu</span>
                            </a>
                        </div>
                        <div className="profile-detail-row">
                            <a href="https://github.com/erimkun" target="_blank" rel="noopener noreferrer" className="detail-link">
                                <span className="detail-icon">🐙</span>
                                <span>github.com/erimkun</span>
                            </a>
                        </div>
                    </div>

                    <div className="profile-languages">
                        <span className="lang-badge">🇬🇧 İngilizce (C1)</span>
                        <span className="lang-badge">🇩🇪 Almanca (A2)</span>
                        <span className="lang-badge">🇪🇸 İspanyolca (A1)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
