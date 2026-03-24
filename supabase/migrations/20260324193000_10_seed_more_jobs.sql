-- Seed additional active jobs for demo/testing.
-- Safe to run multiple times: it skips duplicates by (employer_id, title).

with first_employer as (
  select id
  from public.employer_profiles
  order by created_at asc
  limit 1
),
seed_jobs(title, description, requirements, category, location, role_type, experience_level, salary_range, deadline) as (
  values
    (
      'Technical Support Specialist',
      'Provide customer and internal technical support across desktop and cloud systems. Troubleshoot incidents, document solutions, and escalate complex issues when needed.',
      '- 1+ years in technical support\n- Strong communication skills\n- Familiarity with Windows and SaaS tools\n- Basic networking knowledge',
      'Engineering',
      'Colombo, Sri Lanka',
      'Full-Time'::job_role_type,
      'Entry-Level'::job_experience_level,
      'LKR 90,000 - 130,000',
      current_date + interval '30 day'
    ),
    (
      'Frontend Developer (React/Next.js)',
      'Build and maintain responsive web interfaces, collaborate with designers, and optimize UI performance and accessibility.',
      '- 2+ years with React\n- Experience with Next.js\n- Good understanding of API integration\n- Strong CSS/Tailwind skills',
      'Engineering',
      'Remote',
      'Full-Time'::job_role_type,
      'Mid-Level'::job_experience_level,
      'LKR 220,000 - 320,000',
      current_date + interval '35 day'
    ),
    (
      'HR & Recruitment Coordinator',
      'Coordinate hiring workflows, schedule interviews, maintain candidate communication, and support onboarding activities.',
      '- Experience in recruitment coordination\n- Excellent organization and communication\n- Familiarity with ATS tools',
      'Administration',
      'Colombo, Sri Lanka',
      'Full-Time'::job_role_type,
      'Entry-Level'::job_experience_level,
      'LKR 110,000 - 150,000',
      current_date + interval '28 day'
    ),
    (
      'Digital Marketing Executive',
      'Plan and execute digital campaigns, track performance metrics, and improve conversion through iterative testing.',
      '- 2+ years in digital marketing\n- Experience with Meta/Google Ads\n- Strong analytical mindset',
      'Marketing',
      'Kandy, Sri Lanka',
      'Full-Time'::job_role_type,
      'Mid-Level'::job_experience_level,
      'LKR 140,000 - 210,000',
      current_date + interval '25 day'
    ),
    (
      'Finance Officer',
      'Support monthly closing, manage reconciliations, and assist with financial reporting and compliance documentation.',
      '- Degree/diploma in accounting or finance\n- Experience with accounting systems\n- Attention to detail',
      'Finance',
      'Colombo, Sri Lanka',
      'Full-Time'::job_role_type,
      'Mid-Level'::job_experience_level,
      'LKR 160,000 - 230,000',
      current_date + interval '40 day'
    ),
    (
      'Customer Success Associate',
      'Own onboarding for new customers, maintain client relationships, and provide product guidance for long-term success.',
      '- 1+ years in customer-facing role\n- Excellent written and verbal communication\n- Problem-solving mindset',
      'Operations',
      'Remote',
      'Full-Time'::job_role_type,
      'Entry-Level'::job_experience_level,
      'LKR 120,000 - 170,000',
      current_date + interval '32 day'
    ),
    (
      'UI/UX Designer',
      'Design intuitive user journeys, high-fidelity interfaces, and collaborate with engineering to ship polished experiences.',
      '- Portfolio of web/mobile work\n- Figma proficiency\n- Understanding of design systems',
      'Design',
      'Colombo, Sri Lanka',
      'Contract'::job_role_type,
      'Mid-Level'::job_experience_level,
      'LKR 180,000 - 260,000',
      current_date + interval '21 day'
    ),
    (
      'Sales Development Representative',
      'Generate pipeline through outbound activities, qualify leads, and collaborate with account executives.',
      '- Strong communication skills\n- Sales or customer service experience\n- Goal-oriented approach',
      'Sales',
      'Galle, Sri Lanka',
      'Full-Time'::job_role_type,
      'Entry-Level'::job_experience_level,
      'LKR 100,000 - 180,000 + incentives',
      current_date + interval '26 day'
    )
)
insert into public.jobs (
  employer_id,
  title,
  description,
  requirements,
  category,
  location,
  role_type,
  experience_level,
  salary_range,
  deadline,
  status
)
select
  fe.id,
  sj.title,
  sj.description,
  sj.requirements,
  sj.category,
  sj.location,
  sj.role_type,
  sj.experience_level,
  sj.salary_range,
  sj.deadline::date,
  'active'::job_status
from seed_jobs sj
cross join first_employer fe
where not exists (
  select 1
  from public.jobs j
  where j.employer_id = fe.id
    and j.title = sj.title
);
