import { cn } from '@/lib/utils';

type Skills = readonly string[];

interface SkillsProps {
  skills?: Skills;
  className?: string;
}

/**
 * Skills section component
 * Displays a list of professional skills separated by dots
 */
export function Skills({ skills, className }: SkillsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <section className={cn('mb-12 print:mb-8', className)}>
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="skills-section"
      >
        Skills
      </h2>
      <div
        className="text-sm font-semibold leading-relaxed text-theme-primary ml-6 sm:ml-0"
        aria-label="List of skills"
        aria-labelledby="skills-section"
      >
        {skills.map((skill, index) => (
          <span key={skill} className="inline-block">
            {skill}
            {index < skills.length - 1 && (
              <span className="mx-2 text-theme-secondary">•</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
