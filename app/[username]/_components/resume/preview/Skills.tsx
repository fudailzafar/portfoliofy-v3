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
    <section className={cn('mb-9 print:mb-8', className)}>
      <h2
        className="mb-6 text-[length:var(--type-size)] font-bold leading-[var(--line-height)] text-theme-primary print:mb-4"
        id="skills-section"
      >
        Skills
      </h2>
      <div
        className="font-regular ml-6 text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary sm:ml-0"
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
