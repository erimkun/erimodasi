import { useEffect, useState } from 'react';
import './ProjectPopup.css';

export interface ProjectData {
    id: string;
    boxId: string;
    title: string;
    description: string;
    technologies: string[];
    color: string;
    githubUrl?: string;
    demoUrl?: string;
}

interface ProjectPopupProps {
    isVisible: boolean;
    project: ProjectData | null;
    onClose: () => void;
}

export function ProjectPopup({ isVisible, project, onClose }: ProjectPopupProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            requestAnimationFrame(() => setShow(true));
        } else {
            setShow(false);
        }
    }, [isVisible]);

    if (!isVisible || !project) return null;

    return (
        <div className="project-popup-overlay" onClick={onClose}>
            <div
                className={`project-popup ${show ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ '--glow-color': project.color } as React.CSSProperties}
            >
                <button className="project-popup-close" onClick={onClose}>×</button>

                <div className="project-popup-header">
                    <div
                        className="project-popup-dot"
                        style={{ background: project.color, boxShadow: `0 0 12px ${project.color}` }}
                    />
                    <h2>{project.title}</h2>
                </div>

                <p className="project-popup-desc">{project.description}</p>

                <div className="project-popup-tags">
                    {project.technologies.map((tech) => (
                        <span key={tech} className="project-tag">{tech}</span>
                    ))}
                </div>

                <div className="project-popup-links">
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                            🐙 GitHub
                        </a>
                    )}
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                            🔗 Demo
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
