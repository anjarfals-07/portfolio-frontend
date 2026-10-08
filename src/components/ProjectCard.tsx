import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Link } from 'react-router-dom'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  username: string
}

function ProjectCard({ project, username }: ProjectCardProps) {
  // ===== Helper: generate path user =====
  const detailPath = `/${username}/projects/${project.slug}`

  const header = project.thumbnailUrl ? (
    <div className="project-card-image-wrapper">
      <img
        alt={project.title}
        src={project.thumbnailUrl}
        className="project-card-image"
        loading="lazy"
      />
      <div className="project-card-image-overlay">
        <span className="project-card-image-overlay-badge">
          <i className="pi pi-eye"></i> Preview
        </span>
      </div>
    </div>
  ) : (
    <div className="project-card-image-placeholder">
      <i className="pi pi-image text-5xl"></i>
    </div>
  )

  const footer = (
    <div className="project-card-footer">
      <Link to={detailPath} className="no-underline">
        <Button
          label="Lihat Detail"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          className="project-card-detail-btn"
        />
      </Link>
      <div className="project-card-links">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="project-card-icon-link"
          >
            <Button icon="pi pi-github" rounded text severity="secondary" />
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Live Demo"
            className="project-card-icon-link"
          >
            <Button
              icon="pi pi-external-link"
              rounded
              text
              severity="secondary"
            />
          </a>
        )}
      </div>
    </div>
  )

  return (
    <Card footer={footer} header={header} className="project-card">
      <h3 className="project-card-title">{project.title}</h3>
      <p className="project-card-desc">
        {project.description || 'Tanpa deskripsi'}
      </p>
      <div className="project-card-tags">
        {project.techStack?.slice(0, 4).map((tech) => (
          <Tag key={tech} value={tech} severity="info" />
        ))}
        {project.techStack && project.techStack.length > 4 && (
          <Tag value={`+${project.techStack.length - 4}`} severity="secondary" />
        )}
        {!project.techStack?.length && (
          <Tag value="No tools" severity="secondary" />
        )}
      </div>
    </Card>
  )
}

export default ProjectCard