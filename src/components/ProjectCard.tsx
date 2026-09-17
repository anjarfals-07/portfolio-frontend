import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Link } from 'react-router-dom'
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const header = project.thumbnailUrl ? (
    <img
      alt={project.title}
      src={project.thumbnailUrl}
      className="project-card-image"
      loading="lazy"
    />
  ) : (
    <div className="project-card-image-placeholder">
      <i className="pi pi-image text-5xl text-color-secondary"></i>
    </div>
  )

  const footer = (
    <div className="flex gap-2 justify-content-between align-items-center">
      <Link to={`/projects/${project.slug}`} className="no-underline">
        <Button label="Lihat Detail" icon="pi pi-arrow-right" iconPos="right" text />
      </Link>
      <div className="flex gap-1">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
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
          >
            <Button icon="pi pi-external-link" rounded text severity="secondary" />
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
      <div className="flex flex-wrap gap-1">
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