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
    <section className={cn("mb-12 print:mb-8", className)}>
      <h2 className="text-sm font-bold mb-8 print:mb-4 text-theme-primary" id="skills-section">
        Skills
      </h2>
      <div
        className="text-sm font-semibold text-theme-primary  leading-relaxed"
        aria-label="List of skills"
        aria-labelledby="skills-section"
      >
        {skills.map((skill, index) => (
          <span key={skill} className="inline-block">
            {skill}
            {index < skills.length - 1 && <span className="mx-2 text-theme-secondary">•</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
